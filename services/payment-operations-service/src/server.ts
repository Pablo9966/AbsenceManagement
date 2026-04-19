import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import {
  createRuntimeRequestContext,
  handleRuntimeError,
  HttpRuntimeError,
  logRuntimeEvent,
  writeHealth,
  writeJson,
  writeRuntimeError,
} from "../../../packages/runtime-baseline/src/index.js";
import { FileBackedPaymentOperationsRepositoryAdapter } from "./adapters/persistence/file-backed.repository.js";
import { PaymentOperationsService } from "./application/payment-operations.service.js";
import {
  INTERNAL_TENANT_ID,
  REFERENCE_EFFECTIVE_AT,
} from "./bootstrap/reference-data.js";
import type {
  ExportFormat,
  PaymentInstructionRef,
  ReconciliationStatus,
  StatementType,
  TaggelddispositivData,
} from "./domain/types.js";

const PORT = Number(process.env.PAYMENT_OPERATIONS_SERVICE_PORT ?? "4030");

const readRequestBody = async <T>(request: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as T;
};

const createActor = (actorId?: string, actorRole?: "finance_operator" | "team_lead" | "system" | "api") => ({
  actorId: actorId ?? "payment-operations-api",
  actorRole: actorRole ?? "api",
  effectiveAt: new Date().toISOString(),
});

const getTenantId = (requestUrl: URL): string => requestUrl.searchParams.get("tenantId") ?? INTERNAL_TENANT_ID;

const getPage = (requestUrl: URL): number | undefined => {
  const raw = requestUrl.searchParams.get("page");
  if (!raw) return undefined;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};

const getPageSize = (requestUrl: URL): number | undefined => {
  const raw = requestUrl.searchParams.get("pageSize");
  if (!raw) return undefined;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};

const paginate = <T>(items: T[], page?: number, pageSize?: number) => {
  const totalCount = items.length;
  const resolvedPageSize = Math.max(1, pageSize ?? (totalCount || 1));
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));
  const resolvedPage = Math.min(Math.max(1, page ?? 1), totalPages);
  const start = (resolvedPage - 1) * resolvedPageSize;
  return {
    data: items.slice(start, start + resolvedPageSize),
    meta: {
      totalCount,
      page: resolvedPage,
      pageSize: resolvedPageSize,
      totalPages,
    },
  };
};

const buildPaymentOperationsHttpServer = async () => {
  const adapter = new FileBackedPaymentOperationsRepositoryAdapter();
  await adapter.load();
  const service = new PaymentOperationsService(adapter.getRepository());
  const stateFilePath = process.env.PAYMENT_OPERATIONS_STATE_FILE ?? new URL("../.data/payment-operations-state.json", import.meta.url).pathname;

  const persist = async (): Promise<void> => {
    await adapter.save(adapter.exportState());
  };

  const server = createServer(async (request, response) => {
    const method = request.method;
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const context = createRuntimeRequestContext("payment-operations-service", request, url.pathname);

    try {
      if (method === "GET" && url.pathname === "/health") {
        writeHealth(response, context, {
          service: "payment-operations-service",
          persistenceMode: "file-backed",
          details: {
            stateFilePath,
            referenceEffectiveAt: REFERENCE_EFFECTIVE_AT,
          },
        });
        return;
      }

      if (method === "GET" && url.pathname === "/v1/internal/payment-runs") {
        const runs = await service.listPaymentRuns(getTenantId(url), {
          runStatus: url.searchParams.get("runStatus") ?? undefined,
          runType: url.searchParams.get("runType") ?? undefined,
        });
        writeJson(response, 200, paginate(runs, getPage(url), getPageSize(url)), context);
        return;
      }

      if (method === "POST" && url.pathname === "/v1/internal/payment-runs/create") {
        const payload = await readRequestBody<{
          tenantId: string;
          runType: "scheduled" | "manual" | "correction";
          scheduledExecutionAt?: string;
          notes?: string;
          actorId?: string;
          actorRole?: "finance_operator" | "team_lead" | "system" | "api";
        }>(request);
        const result = await service.createPaymentRun(payload, createActor(payload.actorId, payload.actorRole));
        if (!result.data) {
          writeRuntimeError(response, context, 400, "validation_error", "Payment run creation failed.", { issues: result.issues });
          return;
        }
        await persist();
        writeJson(response, 200, result, context);
        return;
      }

      const runPathMatch = url.pathname.match(/^\/v1\/internal\/payment-runs\/([^/]+)(?:\/(.+))?$/);
      if (runPathMatch) {
        const [, runId, action] = runPathMatch;
        if (!runId) {
          throw new HttpRuntimeError(404, "not_found", "Payment run not found.");
        }
        const tenantId = getTenantId(url);

        if (method === "GET" && !action) {
          const detail = await service.getPaymentRunDetail(tenantId, runId);
          if (!detail) {
            throw new HttpRuntimeError(404, "not_found", "Payment run not found.", { runId, tenantId });
          }
          writeJson(response, 200, detail, context);
          return;
        }

        if (method === "POST" && action === "items") {
          const payload = await readRequestBody<{
            tenantId: string;
            paymentInstruction: PaymentInstructionRef;
            actorId?: string;
            actorRole?: "finance_operator" | "team_lead" | "system" | "api";
          }>(request);
          const result = await service.addInstructionToRun({
            tenantId: payload.tenantId,
            runId,
            paymentInstruction: payload.paymentInstruction,
          }, createActor(payload.actorId, payload.actorRole));
          if (!result.data) {
            writeRuntimeError(response, context, 400, "validation_error", "Adding payment instruction failed.", { issues: result.issues });
            return;
          }
          await persist();
          writeJson(response, 200, result, context);
          return;
        }

        if (method === "POST" && action === "ready") {
          const payload = await readRequestBody<{ tenantId: string; actorId?: string; actorRole?: "finance_operator" | "team_lead" | "system" | "api" }>(request);
          const result = await service.markReadyForExport({ tenantId: payload.tenantId, runId }, createActor(payload.actorId, payload.actorRole));
          if (!result.data) {
            writeRuntimeError(response, context, 400, "validation_error", "Marking payment run ready failed.", { issues: result.issues });
            return;
          }
          await persist();
          writeJson(response, 200, result, context);
          return;
        }

        if (method === "POST" && action === "cancel") {
          const payload = await readRequestBody<{ tenantId: string; actorId?: string; actorRole?: "finance_operator" | "team_lead" | "system" | "api" }>(request);
          const result = await service.cancelPaymentRun({ tenantId: payload.tenantId, runId }, createActor(payload.actorId, payload.actorRole));
          if (!result.data) {
            writeRuntimeError(response, context, 400, "validation_error", "Canceling payment run failed.", { issues: result.issues });
            return;
          }
          await persist();
          writeJson(response, 200, result, context);
          return;
        }

        if (method === "POST" && action === "export") {
          const payload = await readRequestBody<{
            tenantId: string;
            format: ExportFormat;
            generatedBy: string;
            actorId?: string;
            actorRole?: "finance_operator" | "team_lead" | "system" | "api";
          }>(request);
          const result = await service.generateExportPackage({
            tenantId: payload.tenantId,
            runId,
            format: payload.format,
            generatedBy: payload.generatedBy,
          }, createActor(payload.actorId, payload.actorRole));
          if (!result.data) {
            writeRuntimeError(response, context, 400, "validation_error", "Generating export package failed.", { issues: result.issues });
            return;
          }
          await persist();
          writeJson(response, 200, result, context);
          return;
        }

        if (method === "POST" && action === "statement") {
          const payload = await readRequestBody<{
            tenantId: string;
            paymentInstructionId?: string;
            ktgCaseId: string;
            statementType: StatementType;
            taggelddispositivData?: TaggelddispositivData;
            actorId?: string;
            actorRole?: "finance_operator" | "team_lead" | "system" | "api";
          }>(request);
          const result = await service.generateStatement({
            tenantId: payload.tenantId,
            runId,
            paymentInstructionId: payload.paymentInstructionId,
            ktgCaseId: payload.ktgCaseId,
            statementType: payload.statementType,
            taggelddispositivData: payload.taggelddispositivData,
          }, createActor(payload.actorId, payload.actorRole));
          if (!result.data) {
            writeRuntimeError(response, context, 400, "validation_error", "Generating statement failed.", { issues: result.issues });
            return;
          }
          await persist();
          writeJson(response, 200, result, context);
          return;
        }

        if (method === "POST" && action === "reconcile") {
          const payload = await readRequestBody<{
            tenantId: string;
            status: ReconciliationStatus;
            reconciledBy?: string;
            mismatchReason?: string;
            payrollBookingReference?: string;
            actorId?: string;
            actorRole?: "finance_operator" | "team_lead" | "system" | "api";
          }>(request);
          const result = await service.updateReconciliationStatus({
            tenantId: payload.tenantId,
            runId,
            status: payload.status,
            reconciledBy: payload.reconciledBy,
            mismatchReason: payload.mismatchReason,
            payrollBookingReference: payload.payrollBookingReference,
          }, createActor(payload.actorId, payload.actorRole));
          if (!result.data) {
            writeRuntimeError(response, context, 400, "validation_error", "Updating reconciliation status failed.", { issues: result.issues });
            return;
          }
          await persist();
          writeJson(response, 200, result, context);
          return;
        }

        if (method === "POST" && action === "booking-confirmation") {
          const payload = await readRequestBody<{
            tenantId: string;
            confirmationReference: string;
            confirmedBy: string;
            bookingPayload: Record<string, unknown>;
            actorId?: string;
            actorRole?: "finance_operator" | "team_lead" | "system" | "api";
          }>(request);
          const result = await service.recordPayrollBookingConfirmation({
            tenantId: payload.tenantId,
            runId,
            confirmationReference: payload.confirmationReference,
            confirmedBy: payload.confirmedBy,
            bookingPayload: payload.bookingPayload,
          }, createActor(payload.actorId, payload.actorRole));
          if (!result.data) {
            writeRuntimeError(response, context, 400, "validation_error", "Recording payroll booking confirmation failed.", { issues: result.issues });
            return;
          }
          await persist();
          writeJson(response, 200, result, context);
          return;
        }
      }

      if (method === "GET" && url.pathname === "/v1/internal/month-end") {
        const tenantId = getTenantId(url);
        const [runs, reconciliationRecords] = await Promise.all([
          service.listPaymentRuns(tenantId),
          service.listReconciliationRecords(tenantId),
        ]);
        const entries = runs.map((run) => {
          const reconciliation = reconciliationRecords.find((record) => record.paymentRunId === run.id);
          return {
            runId: run.id,
            runNumber: run.runNumber,
            runStatus: run.runStatus,
            totalNetAmountChf: run.totalNetAmountChf,
            reconciliationStatus: run.reconciliationStatus,
            exportedAt: run.exportedAt,
            completedAt: run.completedAt,
            mismatch: reconciliation?.reconciliationStatus === "mismatch",
            bookingReference: reconciliation?.payrollBookingReference,
          };
        });
        writeJson(response, 200, {
          reportGeneratedAt: REFERENCE_EFFECTIVE_AT,
          totalRuns: runs.length,
          totalNetAmountChf: runs.reduce((sum, run) => sum + run.totalNetAmountChf, 0),
          confirmed: runs.filter((run) => run.reconciliationStatus === "confirmed").length,
          unresolved: runs.filter((run) => run.runStatus !== "cancelled" && run.reconciliationStatus !== "confirmed").length,
          mismatches: entries.filter((entry) => entry.mismatch).length,
          entries,
        }, context);
        return;
      }

      if (method === "GET" && url.pathname === "/v1/internal/reconciliation") {
        const records = await service.listReconciliationRecords(getTenantId(url), {
          reconciliationStatus: url.searchParams.get("reconciliationStatus") ?? undefined,
        });
        writeJson(response, 200, records, context);
        return;
      }

      const settlementMatch = url.pathname.match(/^\/v1\/internal\/settlement\/([^/]+)$/);
      if (method === "GET" && settlementMatch) {
        const ktgCaseId = settlementMatch[1];
        if (!ktgCaseId) {
          throw new HttpRuntimeError(404, "not_found", "Settlement summary not found.");
        }
        const summary = await service.getSettlementSummaryByCase(getTenantId(url), ktgCaseId);
        if (!summary) {
          throw new HttpRuntimeError(404, "not_found", "Settlement summary not found.", { tenantId: getTenantId(url), ktgCaseId });
        }
        writeJson(response, 200, summary, context);
        return;
      }

      if (method === "GET" && url.pathname === "/v1/internal/payment-audit-events") {
        const events = await service.listAuditEvents(getTenantId(url), {
          runId: url.searchParams.get("runId") ?? undefined,
        });
        writeJson(response, 200, events, context);
        return;
      }

      if (method === "GET" && url.pathname === "/v1/employer/payment-runs") {
        const runs = await service.listPaymentRuns(INTERNAL_TENANT_ID);
        const summaries = runs.map((run) => ({
          runId: run.id,
          runNumber: run.runNumber,
          totalNetAmountChf: run.totalNetAmountChf,
          instructionCount: run.instructionCount,
          runStatus: run.runStatus,
          createdAt: run.createdAt,
        }));
        writeJson(response, 200, paginate(summaries, getPage(url), getPageSize(url)), context);
        return;
      }

      writeRuntimeError(response, context, 404, "not_found", "Not found.");
    } catch (error) {
      handleRuntimeError(response, context, error, "Unhandled payment operations error.");
    }
  });

  return server;
};

export const executePaymentOperationsRequest = async (
  requestPath: string,
  input?: { method?: "GET" | "POST"; body?: unknown },
): Promise<{ statusCode: number; body: unknown }> => {
  let statusCode = 200;
  let body;
  const response = {
    set statusCode(code: number) {
      statusCode = code;
    },
    get statusCode() {
      return statusCode;
    },
    setHeader() {
      return undefined;
    },
    end(payload?: string) {
      body = payload ? JSON.parse(payload) : undefined;
    },
  } as unknown as ServerResponse;

  const request = {
    method: input?.method ?? "GET",
    url: requestPath,
    headers: { host: "localhost" },
    async *[Symbol.asyncIterator]() {
      if (input?.body !== undefined) {
        yield Buffer.from(JSON.stringify(input.body));
      }
    },
  } as IncomingMessage;

  const server = await buildPaymentOperationsHttpServer();
  const listeners = server.listeners("request");
  const listener = listeners[0];
  if (typeof listener !== "function") {
    throw new Error("Payment operations server request handler unavailable.");
  }
  await listener(request, response);
  server.close();

  return { statusCode, body };
};

export const createPaymentOperationsHttpServer = async () => buildPaymentOperationsHttpServer();

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  createPaymentOperationsHttpServer().then((server) => {
    server.listen(PORT, () => {
      logRuntimeEvent("payment-operations-service", "info", "startup", {
        port: PORT,
        persistenceMode: "file-backed",
      });
    });
  });
}

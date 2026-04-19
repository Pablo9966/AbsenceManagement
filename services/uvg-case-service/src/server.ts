import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import {
  createRuntimeRequestContext,
  handleRuntimeError,
  logRuntimeEvent,
  writeHealth,
  writeJson,
  writeRuntimeError,
} from "../../../packages/runtime-baseline/src/index.js";
import { UvgCaseService } from "./application/uvg-case.service.js";
import { UvgCaseMemoryRepository } from "./adapters/memory-repository.js";
import type { ActorContext } from "./application/uvg-case.service.js";
import type {
  UvgCaseStatus,
  UvgCoordinationStatus,
  UvgCoordinationType,
  UvgDecisionStatus,
  UvgDocumentRole,
} from "./domain/types.js";

const PORT = Number(process.env.UVG_CASE_SERVICE_PORT ?? "4040");

const repository = new UvgCaseMemoryRepository();
const service = new UvgCaseService(repository);

const readBody = async <T>(request: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf-8") || "{}") as T;
};

const actorFromRequest = (request: IncomingMessage): ActorContext => ({
  actorId: String(request.headers["x-actor-id"] ?? "local-uvg-actor"),
  actorRole: String(request.headers["x-actor-role"] ?? "claims_handler") as ActorContext["actorRole"],
  effectiveAt: new Date().toISOString(),
  correlationId: String(request.headers["x-correlation-id"] ?? "local-uvg-request"),
});

const requestHandler = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  if (!request.url) {
    const context = createRuntimeRequestContext("uvg-case-service", request, "/");
    writeRuntimeError(response, context, 404, "not_found", "Not found.");
    return;
  }
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const tenantId = requestUrl.searchParams.get("tenantId") ?? "";
  const pathname = requestUrl.pathname;
  const context = createRuntimeRequestContext("uvg-case-service", request, pathname);

  try {
    if (request.method === "GET" && pathname === "/health") {
      writeHealth(response, context, {
        service: "uvg-case-service",
        persistenceMode: "in-memory",
      });
      return;
    }
    if (request.method === "GET" && pathname === "/v1/uvg-cases") {
      writeJson(response, 200, await service.listCases(tenantId, {
        employeeId: requestUrl.searchParams.get("employeeId") ?? undefined,
        status: requestUrl.searchParams.get("status") ?? undefined,
        type: requestUrl.searchParams.get("type") ?? undefined,
      }), context);
      return;
    }
    if (request.method === "POST" && pathname === "/v1/uvg-cases") {
      const payload = await readBody<Parameters<UvgCaseService["createAccidentReport"]>[0]>(request);
      writeJson(response, 200, await service.createAccidentReport(payload, actorFromRequest(request)), context);
      return;
    }
    if (request.method === "GET" && pathname.match(/^\/v1\/uvg-cases\/[^/]+$/)) {
      writeJson(response, 200, await service.getCaseDetail(tenantId, pathname.split("/").at(-1) ?? ""), context);
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/status$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      const payload = await readBody<{ caseStatus: UvgCaseStatus }>(request);
      writeJson(response, 200, await service.updateCaseStatus(tenantId, caseId, payload.caseStatus, actorFromRequest(request)), context);
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/injuries$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      const payload = await readBody<{
        tenantId: string;
        injuryType: string;
        bodyPart: string;
        severity: "minor" | "moderate" | "severe" | "critical";
        medicalTreatmentFlag: boolean;
        hospitalizedFlag: boolean;
        notes?: string;
      }>(request);
      writeJson(response, 200, await service.recordInjury({
        tenantId: payload.tenantId,
        uvgCaseId: caseId,
        injuryType: payload.injuryType,
        bodyPart: payload.bodyPart,
        severity: payload.severity,
        medicalTreatmentFlag: payload.medicalTreatmentFlag,
        hospitalizedFlag: payload.hospitalizedFlag,
        notes: payload.notes,
      }, actorFromRequest(request)), context);
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/circumstances$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      const payload = await readBody<{
        tenantId: string;
        causeCategory: string;
        activityContext: string;
        thirdPartyInvolvedFlag: boolean;
        vehicleInvolvedFlag: boolean;
        narrative: string;
      }>(request);
      writeJson(response, 200, await service.recordCircumstance({
        tenantId: payload.tenantId,
        uvgCaseId: caseId,
        causeCategory: payload.causeCategory,
        activityContext: payload.activityContext,
        thirdPartyInvolvedFlag: payload.thirdPartyInvolvedFlag,
        vehicleInvolvedFlag: payload.vehicleInvolvedFlag,
        narrative: payload.narrative,
      }, actorFromRequest(request)), context);
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/documents$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      const payload = await readBody<{
        tenantId: string;
        documentId: string;
        documentRole: UvgDocumentRole;
      }>(request);
      writeJson(response, 200, await service.linkDocument({
        tenantId: payload.tenantId,
        uvgCaseId: caseId,
        documentId: payload.documentId,
        documentRole: payload.documentRole,
      }, actorFromRequest(request)), context);
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/coordination$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      const payload = await readBody<{
        tenantId: string;
        coordinationType: UvgCoordinationType;
        relatedKtgCaseId?: string;
        overlapStart?: string;
        overlapEnd?: string;
        coordinationStatus: UvgCoordinationStatus;
        benefitOverlapFlag: boolean;
        notes?: string;
      }>(request);
      writeJson(response, 200, await service.upsertCoordination({
        tenantId: payload.tenantId,
        uvgCaseId: caseId,
        coordinationType: payload.coordinationType,
        relatedKtgCaseId: payload.relatedKtgCaseId,
        overlapStart: payload.overlapStart,
        overlapEnd: payload.overlapEnd,
        coordinationStatus: payload.coordinationStatus,
        benefitOverlapFlag: payload.benefitOverlapFlag,
        notes: payload.notes,
      }, actorFromRequest(request)), context);
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/decisions$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      const payload = await readBody<{
        tenantId: string;
        decisionStatus: UvgDecisionStatus;
        decisionReason: string;
        effectiveFrom: string;
        effectiveTo?: string;
        decidedBy: string;
      }>(request);
      writeJson(response, 200, await service.upsertDecision({
        tenantId: payload.tenantId,
        uvgCaseId: caseId,
        decisionStatus: payload.decisionStatus,
        decisionReason: payload.decisionReason,
        effectiveFrom: payload.effectiveFrom,
        effectiveTo: payload.effectiveTo,
        decidedBy: payload.decidedBy,
      }, actorFromRequest(request)), context);
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/report-artifact$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      writeJson(response, 200, await service.generateAccidentReport(tenantId, caseId, actorFromRequest(request)), context);
      return;
    }
    if (request.method === "GET" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/audit-events$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      writeJson(response, 200, await service.listAuditEvents(tenantId, caseId), context);
      return;
    }
    writeRuntimeError(response, context, 404, "not_found", "Not found.");
  } catch (error) {
    handleRuntimeError(response, context, error, "Unhandled UVG case error.");
  }
};

export const createUvgCaseHttpServer = () => createServer(requestHandler);

export const executeUvgCaseRequest = async (
  requestPath: string,
  input?: { method?: "GET" | "POST"; body?: unknown; headers?: Record<string, string> },
): Promise<{ statusCode: number; body: unknown }> => {
  let statusCode = 200;
  let body;

  const response = {
    set statusCode(value: number) {
      statusCode = value;
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

  await requestHandler(
    {
      method: input?.method ?? "GET",
      url: requestPath,
      headers: input?.headers ?? {},
      async *[Symbol.asyncIterator]() {
        if (input?.body !== undefined) {
          yield Buffer.from(JSON.stringify(input.body));
        }
      },
    } as IncomingMessage,
    response,
  );

  return { statusCode, body };
};

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  createUvgCaseHttpServer().listen(PORT, () => {
    logRuntimeEvent("uvg-case-service", "info", "startup", {
      port: PORT,
      persistenceMode: "in-memory",
    });
  });
}

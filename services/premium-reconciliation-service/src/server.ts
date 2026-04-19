import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import {
  PremiumReconciliationMemoryRepository,
  PremiumReconciliationService,
  type PremiumActorContext,
  type PremiumPeriodType,
} from "./index.js";

const PORT = Number(process.env.PREMIUM_RECONCILIATION_SERVICE_PORT ?? "4050");
const repository = new PremiumReconciliationMemoryRepository();
const service = new PremiumReconciliationService(repository);

const writeJson = (response: ServerResponse, statusCode: number, body: unknown): void => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

const readBody = async <T>(request: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf-8") || "{}") as T;
};

const actorFrom = (request: IncomingMessage): PremiumActorContext => ({
  actorId: String(request.headers["x-actor-id"] ?? "premium-local-user"),
  actorRole: String(request.headers["x-actor-role"] ?? "employer_finance") as PremiumActorContext["actorRole"],
  effectiveAt: new Date().toISOString(),
  correlationId: String(request.headers["x-correlation-id"] ?? "premium-local-request"),
});

const requestHandler = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  if (!request.url) return writeJson(response, 404, { error: "Not found." });
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const pathname = requestUrl.pathname;
  const tenantId = requestUrl.searchParams.get("tenantId") ?? "";

  try {
    if (request.method === "POST" && pathname === "/v1/premium/periods") {
      const body = await readBody<Parameters<PremiumReconciliationService["createReportingPeriod"]>[0]>(request);
      return writeJson(response, 200, await service.createReportingPeriod(body, actorFrom(request)));
    }
    if (request.method === "GET" && pathname === "/v1/premium/periods") {
      return writeJson(response, 200, await service.listReportingPeriods(tenantId));
    }
    if (request.method === "POST" && pathname === "/v1/premium/salary-mass-reports") {
      const body = await readBody<Parameters<PremiumReconciliationService["createDraftSalaryMassReport"]>[0]>(request);
      return writeJson(response, 200, await service.createDraftSalaryMassReport(body, actorFrom(request)));
    }
    if (request.method === "GET" && pathname === "/v1/premium/salary-mass-reports") {
      return writeJson(response, 200, await service.listSalaryMassReports(tenantId, requestUrl.searchParams.get("periodId") ?? undefined));
    }
    if (request.method === "GET" && pathname.match(/^\/v1\/premium\/salary-mass-reports\/[^/]+$/)) {
      return writeJson(response, 200, await service.getSalaryMassReportDetail(tenantId, pathname.split("/").at(-1) ?? ""));
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/premium\/salary-mass-reports\/[^/]+\/submit$/)) {
      return writeJson(response, 200, await service.submitSalaryMassReport(tenantId, pathname.split("/").at(-2) ?? "", actorFrom(request)));
    }
    if (request.method === "POST" && pathname === "/v1/premium/adjustments/calculate") {
      const body = await readBody<Parameters<PremiumReconciliationService["calculatePremiumAdjustment"]>[0]>(request);
      return writeJson(response, 200, await service.calculatePremiumAdjustment(body, actorFrom(request)));
    }
    if (request.method === "GET" && pathname === "/v1/premium/adjustments") {
      return writeJson(response, 200, await service.listAdjustmentCalculations(tenantId, requestUrl.searchParams.get("periodId") ?? undefined));
    }
    if (request.method === "GET" && pathname.match(/^\/v1\/premium\/adjustments\/[^/]+$/)) {
      return writeJson(response, 200, await service.getAdjustmentCalculation(tenantId, pathname.split("/").at(-1) ?? ""));
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/premium\/adjustments\/[^/]+\/recommendation$/)) {
      return writeJson(response, 200, await service.generateSettlementRecommendation(tenantId, pathname.split("/").at(-2) ?? "", actorFrom(request)));
    }
    if (request.method === "GET" && pathname.match(/^\/v1\/premium\/recommendations\/[^/]+$/)) {
      return writeJson(response, 200, await service.getSettlementRecommendation(tenantId, pathname.split("/").at(-1) ?? ""));
    }
    if (request.method === "POST" && pathname === "/v1/premium/installment-plans") {
      const body = await readBody<Parameters<PremiumReconciliationService["createInstallmentPlan"]>[0]>(request);
      return writeJson(response, 200, await service.createInstallmentPlan(body, actorFrom(request)));
    }
    if (request.method === "GET" && pathname === "/v1/premium/installment-plans") {
      return writeJson(response, 200, await service.listInstallmentPlans(tenantId, requestUrl.searchParams.get("periodId") ?? undefined));
    }
    if (request.method === "GET" && pathname.match(/^\/v1\/premium\/installment-plans\/[^/]+$/)) {
      return writeJson(response, 200, await service.getInstallmentPlanDetail(tenantId, pathname.split("/").at(-1) ?? ""));
    }
    if (request.method === "GET" && pathname === "/v1/premium/dashboard") {
      return writeJson(response, 200, await service.getEmployerPremiumDashboard(tenantId, requestUrl.searchParams.get("periodId") ?? undefined));
    }
    if (request.method === "GET" && pathname === "/v1/premium/audit-events") {
      return writeJson(response, 200, await service.listAuditEvents(tenantId, { periodId: requestUrl.searchParams.get("periodId") ?? undefined, reportId: requestUrl.searchParams.get("reportId") ?? undefined }));
    }
    return writeJson(response, 404, { error: "Not found." });
  } catch (error) {
    return writeJson(response, 500, { error: error instanceof Error ? error.message : "Unhandled premium reconciliation error." });
  }
};

export const createPremiumReconciliationHttpServer = () => createServer(requestHandler);

export const executePremiumReconciliationRequest = async (
  requestPath: string,
  input?: { method?: "GET" | "POST"; body?: unknown; headers?: Record<string, string> },
): Promise<{ statusCode: number; body: unknown }> => {
  let statusCode = 200;
  let body;
  const response = {
    set statusCode(value: number) { statusCode = value; },
    get statusCode() { return statusCode; },
    setHeader() { return undefined; },
    end(payload?: string) { body = payload ? JSON.parse(payload) : undefined; },
  } as unknown as ServerResponse;
  await requestHandler({
    method: input?.method ?? "GET",
    url: requestPath,
    headers: input?.headers ?? {},
    async *[Symbol.asyncIterator]() {
      if (input?.body !== undefined) yield Buffer.from(JSON.stringify(input.body));
    },
  } as IncomingMessage, response);
  return { statusCode, body };
};

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  createPremiumReconciliationHttpServer().listen(PORT, () => {
    process.stdout.write(`premium-reconciliation-service listening on http://127.0.0.1:${PORT}\n`);
  });
}

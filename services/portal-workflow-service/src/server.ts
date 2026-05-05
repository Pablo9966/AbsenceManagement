import { WorkflowForbiddenError, WorkflowNotFoundError } from "./errors.js";
import { initializeWorkflowContext, isWorkflowContextInitialized } from "./service-context.js";

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import {
  assertLocalRuntimeOnly,
  createRuntimeRequestContext,
  handleRuntimeError,
  logRuntimeEvent,
  writeHealth,
  writeRuntimeError,
} from "../../../packages/runtime-baseline/src/index.js";

import type { PortalLocale } from "@elipslife/portal-workflow-client";
import {
  confirmEmployeeReturnToWork,
  getEmployeeAbsenceDetail,
  getEmployeeDashboard,
  getEmployeeDocumentDetail,
  getEmployeeReturnToWorkState,
  getEmployeeStatusSummary,
  getEmployerAbsenceDetail,
  getEmployerCaseDetail,
  getEmployerDashboard,
  getEmployerAnalyticsDashboard,
  getEmployerPremiumDashboard,
  getEmployerUvgCaseDetail,
  getInternalBenefitDetail,
  getInternalCaseDetail,
  getInternalDashboard,
  getInternalIntakeDetail,
  getInternalUvgCaseDetail,
  listEmployerAbsences,
  listEmployerCases,
  listEmployerDocuments,
  listEmployerPayments,
  listEmployerTasks,
  listEmployerUvgCases,
  listEmployeeAbsences,
  listEmployeeDocuments,
  listInternalBenefits,
  listInternalCases,
  listInternalIntake,
  listInternalUvgCases,
  listEmployerPaymentRunSummaries,
  listInternalPaymentRuns,
  getInternalPaymentRunDetail,
  getInternalMonthEndReport,
  listInternalReconciliationRecords,
  getInternalSettlementSummary,
  listInternalPaymentAuditEvents,
  createEmployerUvgAccidentReport,
  submitEmployerSalaryMassReport,
  calculateEmployerPremiumAdjustment,
  generateEmployerPremiumSettlement,
  createEmployerPremiumInstallmentPlan,
  refreshEmployerAnalyticsDashboard,
  generateEmployerUvgAccidentReportArtifact,
  updateInternalUvgCaseStatus,
  recordInternalUvgInjury,
  recordInternalUvgCircumstance,
  upsertInternalUvgCoordination,
  linkInternalUvgDocument,
  upsertInternalUvgDecision,
  submitEmployeeAbsence,
  uploadEmployeeCertificate,
} from "./service-context.js";

const PORT = Number(process.env.PORTAL_WORKFLOW_SERVICE_PORT ?? "4020");
const DEMO_BOOTSTRAP = "demo-wiring";
let workflowContextPromise: Promise<void> | null = null;

const ensureWorkflowContextInitialized = async (): Promise<void> => {
  if (isWorkflowContextInitialized()) {
    return;
  }
  workflowContextPromise ??= (async () => {
    assertLocalRuntimeOnly("portal-workflow-service", "demo workflow wiring", { bootstrap: DEMO_BOOTSTRAP });
    const { createServices } = await import("./bootstrap/demo-wiring.js");
    initializeWorkflowContext(createServices());
  })();
  try {
    await workflowContextPromise;
  } catch (error) {
    workflowContextPromise = null;
    throw error;
  }
};

const writeJson = (response: ServerResponse, statusCode: number, body: unknown): void => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

const readRequestBody = async <T>(request: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as T;
};

const getLocale = (requestUrl: URL): PortalLocale => {
  const locale = requestUrl.searchParams.get("locale");
  switch (locale) {
    case "en-CH":
    case "fr-CH":
    case "it-CH":
    case "de-CH":
      return locale;
    default:
      return "de-CH";
  }
};

const getTenantId = (requestUrl: URL): string => requestUrl.searchParams.get("tenantId") ?? "tenant-employer-demo";
const getPage = (requestUrl: URL): number | undefined => {
  const raw = requestUrl.searchParams.get("page");
  if (!raw) {
    return undefined;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};

const getPageSize = (requestUrl: URL): number | undefined => {
  const raw = requestUrl.searchParams.get("pageSize");
  if (!raw) {
    return undefined;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};

const notFound = (response: ServerResponse): void => {
  writeJson(response, 404, { error: "Not found." });
};

const handleEmployeeRoutes = async (
  pathname: string,
  requestUrl: URL,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean> => {
  const tenantId = getTenantId(requestUrl);
  const locale = getLocale(requestUrl);
  const employeeId = requestUrl.searchParams.get("employeeId");

  if (pathname === "/v1/employee/dashboard") {
    writeJson(response, 200, await getEmployeeDashboard(tenantId, locale, employeeId ?? ""));
    return true;
  }
  if (pathname === "/v1/employee/absences") {
    writeJson(response, 200, await listEmployeeAbsences(tenantId, locale, employeeId ?? "", {
      status: requestUrl.searchParams.get("status") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname.startsWith("/v1/employee/absences/")) {
    writeJson(response, 200, await getEmployeeAbsenceDetail(tenantId, locale, employeeId ?? "", pathname.split("/").at(-1) ?? ""));
    return true;
  }
  if (pathname === "/v1/employee/documents") {
    writeJson(response, 200, await listEmployeeDocuments(tenantId, locale, employeeId ?? "", {
      status: requestUrl.searchParams.get("status") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname.startsWith("/v1/employee/documents/") && pathname !== "/v1/employee/documents/upload") {
    writeJson(response, 200, await getEmployeeDocumentDetail(tenantId, locale, employeeId ?? "", pathname.split("/").at(-1) ?? ""));
    return true;
  }
  if (pathname === "/v1/employee/status") {
    writeJson(response, 200, await getEmployeeStatusSummary(tenantId, locale, employeeId ?? ""));
    return true;
  }
  if (request.method === "GET" && pathname === "/v1/employee/return-to-work") {
    writeJson(response, 200, await getEmployeeReturnToWorkState(tenantId, locale, employeeId ?? ""));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employee/report-absence") {
    const payload = await readRequestBody<{
      tenantId: string;
      locale: PortalLocale;
      employeeId: string;
      userId: string;
      absenceType: string;
      startDate: string;
      expectedEndDate?: string;
      comment?: string;
    }>(request);
    writeJson(response, 200, await submitEmployeeAbsence(payload));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employee/documents/upload") {
    const payload = await readRequestBody<{
      tenantId: string;
      locale: PortalLocale;
      employeeId: string;
      userId: string;
      documentType: string;
      fileName: string;
      mimeType: string;
      fileSizeBytes: number;
      absenceEpisodeId?: string;
      certificateStartDate: string;
      certificateEndDate?: string;
      incapacityPercentage: number;
      issuingProviderName?: string;
    }>(request);
    writeJson(response, 200, await uploadEmployeeCertificate(payload));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employee/return-to-work") {
    const payload = await readRequestBody<{
      tenantId: string;
      locale: PortalLocale;
      employeeId: string;
      userId: string;
      episodeId: string;
      actualReturnDate: string;
    }>(request);
    writeJson(response, 200, await confirmEmployeeReturnToWork(payload));
    return true;
  }

  return false;
};

const handleEmployerRoutes = async (pathname: string, requestUrl: URL, request: IncomingMessage, response: ServerResponse): Promise<boolean> => {
  const tenantId = getTenantId(requestUrl);
  const locale = getLocale(requestUrl);

  if (pathname === "/v1/employer/dashboard") {
    writeJson(response, 200, await getEmployerDashboard(tenantId, locale));
    return true;
  }
  if (pathname === "/v1/employer/absences") {
    writeJson(response, 200, await listEmployerAbsences(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      employee: requestUrl.searchParams.get("employee") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname.startsWith("/v1/employer/absences/")) {
    const detail = await getEmployerAbsenceDetail(tenantId, locale, pathname.split("/").at(-1) ?? "");
    writeJson(response, 200, detail);
    return true;
  }
  if (pathname === "/v1/employer/cases") {
    writeJson(response, 200, await listEmployerCases(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      employee: requestUrl.searchParams.get("employee") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname.startsWith("/v1/employer/cases/")) {
    const detail = await getEmployerCaseDetail(tenantId, locale, pathname.split("/").at(-1) ?? "");
    writeJson(response, 200, detail);
    return true;
  }
  if (pathname === "/v1/employer/documents") {
    writeJson(response, 200, await listEmployerDocuments(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      employee: requestUrl.searchParams.get("employee") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname === "/v1/employer/tasks") {
    writeJson(response, 200, await listEmployerTasks(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname === "/v1/employer/payments") {
    writeJson(response, 200, await listEmployerPayments(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname === "/v1/employer/payment-runs") {
    writeJson(response, 200, await listEmployerPaymentRunSummaries(tenantId, locale, {
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname === "/v1/employer/premium/dashboard") {
    writeJson(response, 200, await getEmployerPremiumDashboard(tenantId, locale));
    return true;
  }
  if (pathname === "/v1/employer/analytics") {
    const granularity = requestUrl.searchParams.get("granularity") === "weekly" ? "weekly" : "monthly";
    writeJson(response, 200, await getEmployerAnalyticsDashboard(tenantId, locale, {
      periodStart: requestUrl.searchParams.get("periodStart") ?? undefined,
      periodEnd: requestUrl.searchParams.get("periodEnd") ?? undefined,
      granularity,
      cause: requestUrl.searchParams.get("cause") ?? undefined,
      status: requestUrl.searchParams.get("status") ?? undefined,
      caseType: requestUrl.searchParams.get("caseType") ?? undefined,
    }));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employer/analytics/refresh") {
    const payload = await readRequestBody<Parameters<typeof refreshEmployerAnalyticsDashboard>[0]>(request);
    writeJson(response, 200, await refreshEmployerAnalyticsDashboard(payload));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employer/premium/salary-mass-report") {
    const payload = await readRequestBody<Parameters<typeof submitEmployerSalaryMassReport>[0]>(request);
    writeJson(response, 200, await submitEmployerSalaryMassReport(payload));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employer/premium/adjustment") {
    const payload = await readRequestBody<Parameters<typeof calculateEmployerPremiumAdjustment>[0]>(request);
    writeJson(response, 200, await calculateEmployerPremiumAdjustment(payload));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employer/premium/settlement") {
    const payload = await readRequestBody<Parameters<typeof generateEmployerPremiumSettlement>[0]>(request);
    writeJson(response, 200, await generateEmployerPremiumSettlement(payload));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employer/premium/installment-plan") {
    const payload = await readRequestBody<Parameters<typeof createEmployerPremiumInstallmentPlan>[0]>(request);
    writeJson(response, 200, await createEmployerPremiumInstallmentPlan(payload));
    return true;
  }
  if (pathname === "/v1/employer/uvg-cases") {
    writeJson(response, 200, await listEmployerUvgCases(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      type: requestUrl.searchParams.get("type") ?? undefined,
      employee: requestUrl.searchParams.get("employee") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (request.method === "POST" && pathname === "/v1/employer/uvg-cases/report") {
    const payload = await readRequestBody<Parameters<typeof createEmployerUvgAccidentReport>[0]>(request);
    writeJson(response, 200, await createEmployerUvgAccidentReport(payload));
    return true;
  }
  if (request.method === "POST" && pathname.match(/^\/v1\/employer\/uvg-cases\/[^/]+\/report-artifact$/)) {
    const payload = await readRequestBody<Omit<Parameters<typeof generateEmployerUvgAccidentReportArtifact>[0], "caseId">>(request);
    writeJson(response, 200, await generateEmployerUvgAccidentReportArtifact({
      ...payload,
      caseId: pathname.split("/").at(-2) ?? "",
    }));
    return true;
  }
  if (pathname.startsWith("/v1/employer/uvg-cases/")) {
    writeJson(response, 200, await getEmployerUvgCaseDetail(tenantId, locale, pathname.split("/").at(-1) ?? ""));
    return true;
  }

  return false;
};

const handleInternalRoutes = async (pathname: string, requestUrl: URL, request: IncomingMessage, response: ServerResponse): Promise<boolean> => {
  const tenantId = getTenantId(requestUrl);
  const locale = getLocale(requestUrl);

  if (pathname === "/v1/internal/dashboard") {
    writeJson(response, 200, await getInternalDashboard(tenantId, locale));
    return true;
  }
  if (pathname === "/v1/internal/intake") {
    writeJson(response, 200, await listInternalIntake(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      assignedHandler: requestUrl.searchParams.get("assignedHandler") ?? undefined,
      assignedTeam: requestUrl.searchParams.get("assignedTeam") ?? undefined,
      overdue: requestUrl.searchParams.get("overdue") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname.startsWith("/v1/internal/intake/")) {
    const detail = await getInternalIntakeDetail(tenantId, locale, pathname.split("/").at(-1) ?? "");
    writeJson(response, 200, detail);
    return true;
  }
  if (pathname === "/v1/internal/ktg-cases") {
    writeJson(response, 200, await listInternalCases(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      employee: requestUrl.searchParams.get("employee") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname.startsWith("/v1/internal/ktg-cases/")) {
    const detail = await getInternalCaseDetail(tenantId, locale, pathname.split("/").at(-1) ?? "");
    writeJson(response, 200, detail);
    return true;
  }
  if (pathname === "/v1/internal/benefits") {
    writeJson(response, 200, await listInternalBenefits(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      caseId: requestUrl.searchParams.get("caseId") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname.startsWith("/v1/internal/benefits/")) {
    const detail = await getInternalBenefitDetail(tenantId, locale, pathname.split("/").at(-1) ?? "");
    writeJson(response, 200, detail);
    return true;
  }
  if (pathname === "/v1/internal/payment-runs") {
    writeJson(response, 200, await listInternalPaymentRuns(tenantId, locale, {
      runStatus: requestUrl.searchParams.get("runStatus") ?? undefined,
      runType: requestUrl.searchParams.get("runType") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (pathname.startsWith("/v1/internal/payment-runs/") && !pathname.endsWith("/")) {
    const runId = pathname.split("/").at(-1) ?? "";
    writeJson(response, 200, await getInternalPaymentRunDetail(tenantId, locale, runId));
    return true;
  }
  if (pathname === "/v1/internal/month-end") {
    writeJson(response, 200, await getInternalMonthEndReport(tenantId, locale));
    return true;
  }
  if (pathname === "/v1/internal/reconciliation") {
    writeJson(response, 200, await listInternalReconciliationRecords(tenantId, locale, {
      reconciliationStatus: requestUrl.searchParams.get("reconciliationStatus") ?? undefined,
    }));
    return true;
  }
  if (pathname.startsWith("/v1/internal/settlement/")) {
    const ktgCaseId = pathname.split("/").at(-1) ?? "";
    writeJson(response, 200, await getInternalSettlementSummary(tenantId, locale, ktgCaseId));
    return true;
  }
  if (pathname === "/v1/internal/payment-audit-events") {
    writeJson(response, 200, await listInternalPaymentAuditEvents(tenantId, locale, {
      runId: requestUrl.searchParams.get("runId") ?? undefined,
    }));
    return true;
  }
  if (pathname === "/v1/internal/uvg-cases") {
    writeJson(response, 200, await listInternalUvgCases(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      type: requestUrl.searchParams.get("type") ?? undefined,
      employee: requestUrl.searchParams.get("employee") ?? undefined,
      page: getPage(requestUrl),
      pageSize: getPageSize(requestUrl),
    }));
    return true;
  }
  if (request.method === "POST" && pathname.match(/^\/v1\/internal\/uvg-cases\/[^/]+\/status$/)) {
    const payload = await readRequestBody<Omit<Parameters<typeof updateInternalUvgCaseStatus>[0], "caseId">>(request);
    writeJson(response, 200, await updateInternalUvgCaseStatus({ ...payload, caseId: pathname.split("/").at(-2) ?? "" }));
    return true;
  }
  if (request.method === "POST" && pathname.match(/^\/v1\/internal\/uvg-cases\/[^/]+\/injuries$/)) {
    const payload = await readRequestBody<Omit<Parameters<typeof recordInternalUvgInjury>[0], "caseId">>(request);
    writeJson(response, 200, await recordInternalUvgInjury({ ...payload, caseId: pathname.split("/").at(-2) ?? "" }));
    return true;
  }
  if (request.method === "POST" && pathname.match(/^\/v1\/internal\/uvg-cases\/[^/]+\/circumstances$/)) {
    const payload = await readRequestBody<Omit<Parameters<typeof recordInternalUvgCircumstance>[0], "caseId">>(request);
    writeJson(response, 200, await recordInternalUvgCircumstance({ ...payload, caseId: pathname.split("/").at(-2) ?? "" }));
    return true;
  }
  if (request.method === "POST" && pathname.match(/^\/v1\/internal\/uvg-cases\/[^/]+\/coordination$/)) {
    const payload = await readRequestBody<Omit<Parameters<typeof upsertInternalUvgCoordination>[0], "caseId">>(request);
    writeJson(response, 200, await upsertInternalUvgCoordination({ ...payload, caseId: pathname.split("/").at(-2) ?? "" }));
    return true;
  }
  if (request.method === "POST" && pathname.match(/^\/v1\/internal\/uvg-cases\/[^/]+\/documents$/)) {
    const payload = await readRequestBody<Omit<Parameters<typeof linkInternalUvgDocument>[0], "caseId">>(request);
    writeJson(response, 200, await linkInternalUvgDocument({ ...payload, caseId: pathname.split("/").at(-2) ?? "" }));
    return true;
  }
  if (request.method === "POST" && pathname.match(/^\/v1\/internal\/uvg-cases\/[^/]+\/decisions$/)) {
    const payload = await readRequestBody<Omit<Parameters<typeof upsertInternalUvgDecision>[0], "caseId">>(request);
    writeJson(response, 200, await upsertInternalUvgDecision({ ...payload, caseId: pathname.split("/").at(-2) ?? "" }));
    return true;
  }
  if (pathname.startsWith("/v1/internal/uvg-cases/")) {
    writeJson(response, 200, await getInternalUvgCaseDetail(tenantId, locale, pathname.split("/").at(-1) ?? ""));
    return true;
  }

  return false;
};

const requestHandler = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  if (!request.url) {
    const context = createRuntimeRequestContext("portal-workflow-service", request, "/");
    writeRuntimeError(response, context, 404, "not_found", "Not found.");
    return;
  }

  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const { pathname } = requestUrl;
  const context = createRuntimeRequestContext("portal-workflow-service", request, pathname);

  try {
    if (request.method === "GET" && pathname === "/health") {
      writeHealth(response, context, {
        service: "portal-workflow-service",
        persistenceMode: "composed-runtime",
        details: {
          bootstrap: DEMO_BOOTSTRAP,
        },
      });
      return;
    }

    await ensureWorkflowContextInitialized();

    if (await handleEmployeeRoutes(pathname, requestUrl, request, response)) {
      return;
    }

    if (await handleEmployerRoutes(pathname, requestUrl, request, response)) {
      return;
    }

    if (await handleInternalRoutes(pathname, requestUrl, request, response)) {
      return;
    }

    writeRuntimeError(response, context, 404, "not_found", "Not found.");
  } catch (error) {
    if (error instanceof WorkflowNotFoundError) {
      writeRuntimeError(response, context, 404, "not_found", error.message);
      return;
    }
    if (error instanceof WorkflowForbiddenError) {
      writeRuntimeError(response, context, 403, "forbidden", error.message);
      return;
    }
    handleRuntimeError(response, context, error, "Unhandled portal workflow error.");
  }
};

export const createPortalWorkflowHttpServer = () => {
  assertLocalRuntimeOnly("portal-workflow-service", "demo workflow wiring", { bootstrap: DEMO_BOOTSTRAP });
  return createServer(requestHandler);
};

export const executePortalWorkflowRequest = async (
  requestPath: string,
  input?: { method?: "GET" | "POST"; body?: unknown },
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
      async *[Symbol.asyncIterator]() {
        if (input?.body !== undefined) {
          yield Buffer.from(JSON.stringify(input.body));
        }
      },
    } as IncomingMessage,
    response,
  );

  return {
    statusCode,
    body,
  };
};

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  createPortalWorkflowHttpServer().listen(PORT, () => {
    logRuntimeEvent("portal-workflow-service", "info", "startup", {
      port: PORT,
      bootstrap: DEMO_BOOTSTRAP,
    });
  });
}

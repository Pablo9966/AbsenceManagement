import { WorkflowForbiddenError, WorkflowNotFoundError } from "./errors.js";
import { initializeWorkflowContext } from "./service-context.js";
import { createServices } from "./bootstrap/demo-wiring.js";

initializeWorkflowContext(createServices());

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";

import type { PortalLocale } from "@elipslife/portal-workflow-client";
import {
  getEmployerAbsenceDetail,
  getEmployerCaseDetail,
  getEmployerDashboard,
  getInternalBenefitDetail,
  getInternalCaseDetail,
  getInternalDashboard,
  getInternalIntakeDetail,
  listEmployerAbsences,
  listEmployerCases,
  listEmployerDocuments,
  listEmployerPayments,
  listEmployerTasks,
  listInternalBenefits,
  listInternalCases,
  listInternalIntake,
} from "./service-context.js";

const PORT = Number(process.env.PORTAL_WORKFLOW_SERVICE_PORT ?? "4020");

const writeJson = (response: ServerResponse, statusCode: number, body: unknown): void => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
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

const handleEmployerRoutes = async (pathname: string, requestUrl: URL, response: ServerResponse): Promise<boolean> => {
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

  return false;
};

const handleInternalRoutes = async (pathname: string, requestUrl: URL, response: ServerResponse): Promise<boolean> => {
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

  return false;
};

const requestHandler = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  if (!request.url) {
    notFound(response);
    return;
  }

  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const { pathname } = requestUrl;

  try {
    if (await handleEmployerRoutes(pathname, requestUrl, response)) {
      return;
    }

    if (await handleInternalRoutes(pathname, requestUrl, response)) {
      return;
    }

    notFound(response);
  } catch (error) {
    if (error instanceof WorkflowNotFoundError) {
      writeJson(response, 404, { error: error.message });
      return;
    }
    if (error instanceof WorkflowForbiddenError) {
      writeJson(response, 403, { error: error.message });
      return;
    }
    writeJson(response, 500, {
      error: error instanceof Error ? error.message : "Unhandled portal workflow error.",
    });
  }
};

export const createPortalWorkflowHttpServer = () => createServer(requestHandler);

export const executePortalWorkflowRequest = async (
  requestPath: string,
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
      url: requestPath,
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
    process.stdout.write(`portal-workflow-service listening on http://127.0.0.1:${PORT}\n`);
  });
}

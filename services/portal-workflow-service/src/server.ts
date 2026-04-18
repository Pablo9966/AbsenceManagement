import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";

import type { PortalLocale } from "@elipslife/portal-workflow-client";
import {
  buildEmployerAbsenceDetail,
  buildEmployerAbsenceList,
  buildEmployerCaseDetail,
  buildEmployerCaseList,
  buildEmployerDashboard,
  buildEmployerDocuments,
  buildEmployerPayments,
  buildEmployerTasks,
  buildInternalBenefitDetail,
  buildInternalBenefitList,
  buildInternalCaseDetail,
  buildInternalCaseList,
  buildInternalDashboard,
  buildInternalIntakeDetail,
  buildInternalIntakeList,
} from "./demo-data.js";

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

const notFound = (response: ServerResponse): void => {
  writeJson(response, 404, { error: "Not found." });
};

const handleEmployerRoutes = (pathname: string, requestUrl: URL, response: ServerResponse): boolean => {
  const tenantId = getTenantId(requestUrl);
  const locale = getLocale(requestUrl);

  if (pathname === "/v1/employer/dashboard") {
    writeJson(response, 200, buildEmployerDashboard(tenantId, locale));
    return true;
  }
  if (pathname === "/v1/employer/absences") {
    writeJson(response, 200, buildEmployerAbsenceList(tenantId, locale, {
      status: requestUrl.searchParams.get("status") ?? undefined,
      employee: requestUrl.searchParams.get("employee") ?? undefined,
    }));
    return true;
  }
  if (pathname.startsWith("/v1/employer/absences/")) {
    writeJson(response, 200, buildEmployerAbsenceDetail(tenantId, locale, pathname.split("/").at(-1) ?? ""));
    return true;
  }
  if (pathname === "/v1/employer/cases") {
    writeJson(response, 200, buildEmployerCaseList(tenantId, locale));
    return true;
  }
  if (pathname.startsWith("/v1/employer/cases/")) {
    writeJson(response, 200, buildEmployerCaseDetail(tenantId, locale, pathname.split("/").at(-1) ?? ""));
    return true;
  }
  if (pathname === "/v1/employer/documents") {
    writeJson(response, 200, buildEmployerDocuments(tenantId, locale));
    return true;
  }
  if (pathname === "/v1/employer/tasks") {
    writeJson(response, 200, buildEmployerTasks(tenantId, locale));
    return true;
  }
  if (pathname === "/v1/employer/payments") {
    writeJson(response, 200, buildEmployerPayments(tenantId, locale));
    return true;
  }

  return false;
};

const handleInternalRoutes = (pathname: string, requestUrl: URL, response: ServerResponse): boolean => {
  const tenantId = getTenantId(requestUrl).replace("employer", "internal");
  const locale = getLocale(requestUrl);

  if (pathname === "/v1/internal/dashboard") {
    writeJson(response, 200, buildInternalDashboard(tenantId, locale));
    return true;
  }
  if (pathname === "/v1/internal/intake") {
    writeJson(response, 200, buildInternalIntakeList(tenantId, locale));
    return true;
  }
  if (pathname.startsWith("/v1/internal/intake/")) {
    writeJson(response, 200, buildInternalIntakeDetail(tenantId, locale, pathname.split("/").at(-1) ?? ""));
    return true;
  }
  if (pathname === "/v1/internal/ktg-cases") {
    writeJson(response, 200, buildInternalCaseList(tenantId, locale));
    return true;
  }
  if (pathname.startsWith("/v1/internal/ktg-cases/")) {
    writeJson(response, 200, buildInternalCaseDetail(tenantId, locale, pathname.split("/").at(-1) ?? ""));
    return true;
  }
  if (pathname === "/v1/internal/benefits") {
    writeJson(response, 200, buildInternalBenefitList(tenantId, locale));
    return true;
  }
  if (pathname.startsWith("/v1/internal/benefits/")) {
    writeJson(response, 200, buildInternalBenefitDetail(tenantId, locale, pathname.split("/").at(-1) ?? ""));
    return true;
  }

  return false;
};

const requestHandler = (request: IncomingMessage, response: ServerResponse): void => {
  if (!request.url) {
    notFound(response);
    return;
  }

  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const { pathname } = requestUrl;

  try {
    if (handleEmployerRoutes(pathname, requestUrl, response)) {
      return;
    }

    if (handleInternalRoutes(pathname, requestUrl, response)) {
      return;
    }

    notFound(response);
  } catch (error) {
    writeJson(response, 500, {
      error: error instanceof Error ? error.message : "Unhandled portal workflow error.",
    });
  }
};

export const createPortalWorkflowHttpServer = () => createServer(requestHandler);

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  createPortalWorkflowHttpServer().listen(PORT, () => {
    process.stdout.write(`portal-workflow-service listening on http://127.0.0.1:${PORT}\n`);
  });
}

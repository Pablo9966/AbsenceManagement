import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import {
  createRuntimeRequestContext,
  logRuntimeEvent,
  writeHealth,
  writeRuntimeError,
} from "../../../packages/runtime-baseline/src/index.js";

const PORT = Number(process.env.DASHBOARD_PROJECTION_SERVICE_PORT ?? "4060");

const requestHandler = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const context = createRuntimeRequestContext("dashboard-projection-service", request, requestUrl.pathname);

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    writeHealth(response, context, {
      service: "dashboard-projection-service",
      persistenceMode: "embedded-projection-repository",
      details: {
        analyticsExposure: "portal-workflow-service",
      },
    });
    return;
  }

  writeRuntimeError(response, context, 404, "not_found", "Not found.");
};

export const createDashboardProjectionHttpServer = () => createServer(requestHandler);

export const executeDashboardProjectionRequest = async (
  requestPath: string,
  input?: { method?: "GET"; headers?: Record<string, string> },
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
      headers: {
        host: "localhost",
        ...(input?.headers ?? {}),
      },
    } as IncomingMessage,
    response,
  );

  return { statusCode, body };
};

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  createDashboardProjectionHttpServer().listen(PORT, () => {
    logRuntimeEvent("dashboard-projection-service", "info", "startup", {
      port: PORT,
      analyticsExposure: "portal-workflow-service",
    });
  });
}

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { UvgCaseService } from "./application/uvg-case.service.js";
import { UvgCaseMemoryRepository } from "./adapters/memory-repository.js";
import type { ActorContext } from "./application/uvg-case.service.js";
import type { UvgCaseStatus } from "./domain/types.js";

const PORT = Number(process.env.UVG_CASE_SERVICE_PORT ?? "4040");

const repository = new UvgCaseMemoryRepository();
const service = new UvgCaseService(repository);

const writeJson = (response: ServerResponse, statusCode: number, body: unknown): void => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

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
    writeJson(response, 404, { error: "Not found." });
    return;
  }
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const tenantId = requestUrl.searchParams.get("tenantId") ?? "";
  const pathname = requestUrl.pathname;

  try {
    if (request.method === "GET" && pathname === "/v1/uvg-cases") {
      writeJson(response, 200, await service.listCases(tenantId, {
        employeeId: requestUrl.searchParams.get("employeeId") ?? undefined,
        status: requestUrl.searchParams.get("status") ?? undefined,
        type: requestUrl.searchParams.get("type") ?? undefined,
      }));
      return;
    }
    if (request.method === "POST" && pathname === "/v1/uvg-cases") {
      const payload = await readBody<Parameters<UvgCaseService["createAccidentReport"]>[0]>(request);
      writeJson(response, 200, await service.createAccidentReport(payload, actorFromRequest(request)));
      return;
    }
    if (request.method === "GET" && pathname.startsWith("/v1/uvg-cases/")) {
      writeJson(response, 200, await service.getCaseDetail(tenantId, pathname.split("/").at(-1) ?? ""));
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/status$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      const payload = await readBody<{ caseStatus: UvgCaseStatus }>(request);
      writeJson(response, 200, await service.updateCaseStatus(tenantId, caseId, payload.caseStatus, actorFromRequest(request)));
      return;
    }
    if (request.method === "POST" && pathname.match(/^\/v1\/uvg-cases\/[^/]+\/report-artifact$/)) {
      const caseId = pathname.split("/").at(-2) ?? "";
      writeJson(response, 200, await service.generateAccidentReport(tenantId, caseId, actorFromRequest(request)));
      return;
    }
    writeJson(response, 404, { error: "Not found." });
  } catch (error) {
    writeJson(response, 500, { error: error instanceof Error ? error.message : "Unhandled UVG case error." });
  }
};

export const createUvgCaseHttpServer = () => createServer(requestHandler);

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  createUvgCaseHttpServer().listen(PORT, () => {
    process.stdout.write(`uvg-case-service listening on http://127.0.0.1:${PORT}\n`);
  });
}

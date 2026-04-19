import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export type RuntimeErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "internal_error";

export interface RuntimeRequestContext {
  serviceName: string;
  requestId: string;
  correlationId: string;
  method: string;
  path: string;
  startedAt: string;
}

export interface RuntimeHealthPayload {
  service: string;
  status: "ok";
  timestamp: string;
  version: string;
  persistenceMode?: string;
  details?: Record<string, unknown>;
}

export interface RuntimeErrorPayload {
  error: {
    code: RuntimeErrorCode;
    message: string;
    requestId: string;
    correlationId: string;
    details?: unknown;
  };
}

export class HttpRuntimeError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: RuntimeErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpRuntimeError";
  }
}

const getHeader = (request: IncomingMessage, key: string): string | undefined => {
  if (!request.headers) {
    return undefined;
  }
  const value = request.headers[key];
  if (typeof value === "string") {
    return value;
  }
  return Array.isArray(value) ? value[0] : undefined;
};

const setCommonHeaders = (response: ServerResponse, context?: RuntimeRequestContext): void => {
  response.setHeader("Content-Type", "application/json");
  if (context) {
    response.setHeader("x-request-id", context.requestId);
    response.setHeader("x-correlation-id", context.correlationId);
  }
};

export const createRuntimeRequestContext = (
  serviceName: string,
  request: IncomingMessage,
  path: string,
): RuntimeRequestContext => ({
  serviceName,
  requestId: getHeader(request, "x-request-id") ?? randomUUID(),
  correlationId: getHeader(request, "x-correlation-id") ?? `${serviceName}-${randomUUID()}`,
  method: request.method ?? "GET",
  path,
  startedAt: new Date().toISOString(),
});

export const writeJson = (
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
  context?: RuntimeRequestContext,
): void => {
  response.statusCode = statusCode;
  setCommonHeaders(response, context);
  response.end(JSON.stringify(payload));
};

export const writeHealth = (
  response: ServerResponse,
  context: RuntimeRequestContext,
  payload: Omit<RuntimeHealthPayload, "timestamp" | "version" | "status"> & Partial<Pick<RuntimeHealthPayload, "details">>,
): void => {
  writeJson(
    response,
    200,
    {
      service: payload.service,
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION ?? "0.1.0",
      persistenceMode: payload.persistenceMode,
      details: payload.details,
    } satisfies RuntimeHealthPayload,
    context,
  );
};

export const writeRuntimeError = (
  response: ServerResponse,
  context: RuntimeRequestContext,
  statusCode: number,
  code: RuntimeErrorCode,
  message: string,
  details?: unknown,
): void => {
  writeJson(
    response,
    statusCode,
    {
      error: {
        code,
        message,
        requestId: context.requestId,
        correlationId: context.correlationId,
        details,
      },
    } satisfies RuntimeErrorPayload,
    context,
  );
};

export const handleRuntimeError = (
  response: ServerResponse,
  context: RuntimeRequestContext,
  error: unknown,
  fallbackMessage: string,
): void => {
  if (error instanceof HttpRuntimeError) {
    logRuntimeEvent(context.serviceName, "warn", "request_failed", {
      requestId: context.requestId,
      correlationId: context.correlationId,
      method: context.method,
      path: context.path,
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    });
    writeRuntimeError(response, context, error.statusCode, error.code, error.message, error.details);
    return;
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  logRuntimeEvent(context.serviceName, "error", "request_failed", {
    requestId: context.requestId,
    correlationId: context.correlationId,
    method: context.method,
    path: context.path,
    statusCode: 500,
    code: "internal_error",
    message,
  });
  writeRuntimeError(response, context, 500, "internal_error", message);
};

export const logRuntimeEvent = (
  serviceName: string,
  level: "info" | "warn" | "error",
  event: string,
  details?: Record<string, unknown>,
): void => {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: serviceName,
    event,
    ...details,
  });

  if (level === "error") {
    process.stderr.write(`${line}\n`);
    return;
  }
  process.stdout.write(`${line}\n`);
};

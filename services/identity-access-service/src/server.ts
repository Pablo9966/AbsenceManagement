import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import {
  createRuntimeRequestContext,
  handleRuntimeError,
  logRuntimeEvent,
  writeHealth,
  writeRuntimeError,
} from "../../../packages/runtime-baseline/src/index.js";
import { IdentityAccessService } from "./application/identity-access.service.js";
import {
  EMPLOYER_PORTAL_BOOTSTRAP_PERMISSIONS,
  INTERNAL_CLAIMS_BOOTSTRAP_PERMISSIONS,
  INTERNAL_COMPLIANCE_BOOTSTRAP_PERMISSIONS,
  REFERENCE_EFFECTIVE_AT,
} from "./bootstrap/reference-data.js";
import type { AccessPurposeRecord, LawfulBasis } from "./domain/types.js";
import { FileBackedIdentityAccessRepositoryAdapter, type PersistedSession } from "./adapters/persistence/file-backed.repository.js";

type HttpMethod = "GET" | "POST";

interface AuthenticatedSession extends PersistedSession {}

const PORT = Number(process.env.IDENTITY_ACCESS_SERVICE_PORT ?? "4010");

const readRequestBody = async <T>(request: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as T;
};

const writeJson = (response: ServerResponse, statusCode: number, payload: unknown): void => {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
};

const readBearerToken = (request: IncomingMessage): string | null => {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  return authorization.slice("Bearer ".length);
};

const hasActivePurpose = (
  records: AccessPurposeRecord[],
  input: { userId: string; employeeId?: string; purposeCode?: string; lawfulBases?: LawfulBasis[] },
): boolean =>
  records.some((record) =>
    record.userId === input.userId &&
    !record.revokedAt &&
    (input.employeeId === undefined || record.employeeId === input.employeeId) &&
    (input.purposeCode === undefined || record.purposeCode === input.purposeCode) &&
    (input.lawfulBases === undefined || input.lawfulBases.includes(record.lawfulBasis)),
  );

const createIdentityAccessHttpServer = async () => {
  const adapter = new FileBackedIdentityAccessRepositoryAdapter();
  let state = await adapter.load();
  const service = new IdentityAccessService(adapter.getRepository());

  const persist = async (): Promise<void> => {
    state = await adapter.exportState(state.sessions);
    await adapter.save(state);
  };

  const requireSession = (request: IncomingMessage): AuthenticatedSession | null => {
    const token = readBearerToken(request);
    if (!token) {
      return null;
    }
    return state.sessions.find((session) => session.sessionToken === token) ?? null;
  };

  const server = createServer(async (request, response) => {
    const method = request.method as HttpMethod | undefined;
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const context = createRuntimeRequestContext("identity-access-service", request, url.pathname);

    try {
      if (method === "GET" && url.pathname === "/health") {
        writeHealth(response, context, {
          service: "identity-access-service",
          persistenceMode: "file-backed",
        });
        return;
      }

      if (method === "POST" && url.pathname === "/v1/session/sign-in") {
        const payload = await readRequestBody<{ email: string; tenantId: string }>(request);
        const snapshot = adapter.getRepository().exportSnapshot();
        const user = snapshot.platformUsers.find((candidate) => candidate.email === payload.email);
        const membership = snapshot.tenantMemberships.find(
          (candidate) =>
            candidate.tenantId === payload.tenantId &&
            candidate.userId === user?.id &&
            candidate.membershipStatus === "active" &&
            !candidate.leftAt,
        );

        if (!user || !membership) {
          writeRuntimeError(response, context, 401, "unauthorized", "Invalid sign-in request.");
          return;
        }

        const session = {
          sessionToken: randomUUID(),
          tenantId: payload.tenantId,
          userId: user.id,
          createdAt: new Date().toISOString(),
        };
        state.sessions = [...state.sessions.filter((candidate) => candidate.userId !== user.id), session];
        await persist();
        writeJson(response, 200, session);
        return;
      }

      const session = requireSession(request);
      if (!session) {
        writeRuntimeError(response, context, 401, "unauthorized", "Missing or invalid session token.");
        return;
      }

      if (method === "POST" && url.pathname === "/v1/session/bootstrap") {
        const payload = await readRequestBody<{
          permissions: Array<{ resourceType: string; action: string }>;
          routeLocale?: "de-CH" | "en-CH" | "fr-CH" | "it-CH";
        }>(request);
        const bootstrap = await service.getPortalBootstrap({
          tenantId: session.tenantId,
          userId: session.userId,
          routeLocale: payload.routeLocale,
          permissions: payload.permissions,
          effectiveAt: REFERENCE_EFFECTIVE_AT,
        });
        writeJson(response, 200, bootstrap);
        return;
      }

      const tenantMatch = url.pathname.match(/^\/v1\/tenants\/([^/]+)\/(.+)$/);
      if (!tenantMatch) {
        writeRuntimeError(response, context, 404, "not_found", "Route not found.");
        return;
      }

      const [, tenantId, resourcePath] = tenantMatch;
      if (tenantId !== session.tenantId) {
        writeRuntimeError(response, context, 403, "forbidden", "Session tenant mismatch.");
        return;
      }

      if (method === "GET" && resourcePath === "memberships") {
        writeJson(response, 200, await service.listTenantMemberships(tenantId));
        return;
      }

      if (method === "GET" && resourcePath === "role-assignments") {
        const userId = url.searchParams.get("userId") ?? session.userId;
        writeJson(response, 200, await service.listRoleAssignments(tenantId, userId));
        return;
      }

      if (method === "GET" && resourcePath === "provisioning-invites") {
        writeJson(response, 200, await service.listProvisioningInvites(tenantId));
        return;
      }

      if (method === "GET" && resourcePath === "onboarding-workspace") {
        writeJson(response, 200, await service.getOnboardingWorkspace(tenantId));
        return;
      }

      if (method === "GET" && resourcePath === "onboarding-readiness") {
        writeJson(response, 200, await service.getOnboardingReadiness(tenantId));
        return;
      }

      if (method === "GET" && resourcePath === "audit-access-policies") {
        const userId = url.searchParams.get("userId") ?? session.userId;
        writeJson(response, 200, await service.getAuditAccessPoliciesForUser(tenantId, userId));
        return;
      }

      if (method === "GET" && resourcePath === "audit-events") {
        const permission = await service.getEffectivePermissions({
          tenantId,
          userId: session.userId,
          resourceType: "audit",
          action: "view",
          effectiveAt: REFERENCE_EFFECTIVE_AT,
        });
        const auditPolicies = await service.getAuditAccessPoliciesForUser(tenantId, session.userId);
        const canViewAudit = permission.allowed.value && auditPolicies.some((policy) => policy.canViewAuditFlag);

        if (!canViewAudit) {
          writeRuntimeError(response, context, 403, "forbidden", "Audit queries require matching permission grant and audit access policy.");
          return;
        }

        const events = await service.listAccessAuditEvents(tenantId, {
          userId: url.searchParams.get("userId") ?? undefined,
          resourceType: url.searchParams.get("resource") ?? undefined,
          lawfulBasis: (url.searchParams.get("lawfulBasis") as LawfulBasis | null) ?? undefined,
        });
        const result = url.searchParams.get("result");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        writeJson(
          response,
          200,
          events.filter((event) =>
            (result === null || event.result === result) &&
            (from === null || event.occurredAt >= from) &&
            (to === null || event.occurredAt <= to),
          ),
        );
        return;
      }

      if (method === "GET" && resourcePath === "access-purpose-records") {
        writeJson(
          response,
          200,
          await service.listAccessPurposeRecords(tenantId, {
            userId: url.searchParams.get("userId") ?? undefined,
            employeeId: url.searchParams.get("employeeId") ?? undefined,
            lawfulBasis: (url.searchParams.get("lawfulBasis") as LawfulBasis | null) ?? undefined,
          }),
        );
        return;
      }

      if (method === "POST" && resourcePath === "access-evaluations") {
        const payload = await readRequestBody<{
          resourceType: string;
          action: string;
          employeeId?: string;
          purposeCode?: string;
          requiredLawfulBasis?: LawfulBasis[];
          auditAccessRequired?: boolean;
        }>(request);
        const permission = await service.getEffectivePermissions({
          tenantId,
          userId: session.userId,
          resourceType: payload.resourceType,
          action: payload.action,
          effectiveAt: REFERENCE_EFFECTIVE_AT,
        });

        const purposeRecords = await service.listAccessPurposeRecords(tenantId, {
          userId: session.userId,
          employeeId: payload.employeeId,
        });
        const auditPolicies = await service.getAuditAccessPoliciesForUser(tenantId, session.userId);
        const requiresLawfulBasis =
          payload.requiredLawfulBasis !== undefined ||
          payload.resourceType === "document" ||
          payload.resourceType === "medical_document";
        const requiresAuditPolicy = payload.auditAccessRequired === true || payload.resourceType === "audit";

        const reasons: string[] = [];
        if (!permission.allowed.value) {
          reasons.push("permission_denied");
        }

        if (requiresLawfulBasis && !hasActivePurpose(purposeRecords, {
          userId: session.userId,
          employeeId: payload.employeeId,
          purposeCode: payload.purposeCode,
          lawfulBases: payload.requiredLawfulBasis,
        })) {
          reasons.push("missing_lawful_basis");
        }

        if (requiresAuditPolicy && !auditPolicies.some((policy) => policy.canViewAuditFlag)) {
          reasons.push("missing_audit_access_policy");
        }

        writeJson(response, 200, {
          allowed: reasons.length === 0,
          enforcementMode: requiresAuditPolicy
            ? "role_permission_and_audit_policy"
            : requiresLawfulBasis
              ? "role_permission_and_lawful_basis"
              : "role_permission_only",
          reasons,
        });
        return;
      }

      writeRuntimeError(response, context, 404, "not_found", "Route not found.");
    } catch (error) {
      handleRuntimeError(response, context, error, "Unexpected identity access server error.");
    }
  });

  return server;
};

export const executeIdentityAccessRequest = async (
  requestPath: string,
  input?: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> },
): Promise<{ statusCode: number; body: unknown }> => {
  let statusCode = 200;
  let body;
  const response = {
    writeHead(code: number) {
      statusCode = code;
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
    headers: {
      host: "localhost",
      ...(input?.headers ?? {}),
    },
    async *[Symbol.asyncIterator]() {
      if (input?.body !== undefined) {
        yield Buffer.from(JSON.stringify(input.body));
      }
    },
  } as IncomingMessage;

  const server = await createIdentityAccessHttpServer();
  const listener = server.listeners("request")[0];
  if (typeof listener !== "function") {
    throw new Error("Identity access server request handler unavailable.");
  }
  await listener(request, response);
  server.close();
  return { statusCode, body };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = await createIdentityAccessHttpServer();
  server.listen(PORT, () => {
    logRuntimeEvent("identity-access-service", "info", "startup", {
      port: PORT,
      persistenceMode: "file-backed",
    });
  });
}

export { createIdentityAccessHttpServer };
export const DEFAULT_BOOTSTRAP_PERMISSIONS = {
  employer: EMPLOYER_PORTAL_BOOTSTRAP_PERMISSIONS,
  internalClaims: INTERNAL_CLAIMS_BOOTSTRAP_PERMISSIONS,
  internalCompliance: INTERNAL_COMPLIANCE_BOOTSTRAP_PERMISSIONS,
};

import type {
  AccessAuditEventDto,
  AccessEvaluationRequest,
  AccessEvaluationResponse,
  AccessPurposeRecordDto,
  AuditAccessPolicyDto,
  AuditEventQuery,
  OnboardingWorkspaceDto,
  PermissionCheck,
  PortalBootstrapDto,
  ProvisioningInviteDto,
  RoleAssignmentDto,
  SessionBootstrapRequest,
  SignInRequest,
  SignInResponse,
  TenantMembershipDto,
  TransparentBoolean,
} from "./types.js";

export interface IdentityAccessClient {
  signIn(input: SignInRequest): Promise<SignInResponse>;
  getPortalBootstrap(sessionToken: string, input: SessionBootstrapRequest): Promise<PortalBootstrapDto>;
  listMemberships(sessionToken: string, tenantId: string): Promise<TenantMembershipDto[]>;
  listRoleAssignments(sessionToken: string, tenantId: string, userId: string): Promise<RoleAssignmentDto[]>;
  listProvisioningInvites(sessionToken: string, tenantId: string): Promise<ProvisioningInviteDto[]>;
  getOnboardingWorkspace(sessionToken: string, tenantId: string): Promise<OnboardingWorkspaceDto | null>;
  getOnboardingReadiness(sessionToken: string, tenantId: string): Promise<TransparentBoolean>;
  listAuditAccessPolicies(sessionToken: string, tenantId: string, userId: string): Promise<AuditAccessPolicyDto[]>;
  listAuditEvents(sessionToken: string, tenantId: string, query?: AuditEventQuery): Promise<AccessAuditEventDto[]>;
  listAccessPurposeRecords(sessionToken: string, tenantId: string, query?: {
    userId?: string;
    employeeId?: string;
    lawfulBasis?: string;
  }): Promise<AccessPurposeRecordDto[]>;
  evaluateAccess(sessionToken: string, tenantId: string, input: AccessEvaluationRequest): Promise<AccessEvaluationResponse>;
}

const toQueryString = (query?: Record<string, string | undefined>): string => {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, value);
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Identity access request failed with ${response.status}.`);
  }

  return response.json() as Promise<T>;
};

export const createIdentityAccessClient = (input: {
  baseUrl: string;
  fetchFn?: typeof fetch;
}): IdentityAccessClient => {
  const fetchFn = input.fetchFn ?? fetch;

  const withAuth = (sessionToken: string): HeadersInit => ({
    Authorization: `Bearer ${sessionToken}`,
    "Content-Type": "application/json",
  });

  const withBaseUrl = (path: string): string => `${input.baseUrl.replace(/\/$/, "")}${path}`;

  return {
    async signIn(payload: SignInRequest): Promise<SignInResponse> {
      const response = await fetchFn(withBaseUrl("/v1/session/sign-in"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return readJson<SignInResponse>(response);
    },

    async getPortalBootstrap(sessionToken: string, payload: SessionBootstrapRequest): Promise<PortalBootstrapDto> {
      const response = await fetchFn(withBaseUrl("/v1/session/bootstrap"), {
        method: "POST",
        headers: withAuth(sessionToken),
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      return readJson<PortalBootstrapDto>(response);
    },

    async listMemberships(sessionToken: string, tenantId: string): Promise<TenantMembershipDto[]> {
      const response = await fetchFn(withBaseUrl(`/v1/tenants/${tenantId}/memberships`), {
        headers: withAuth(sessionToken),
        cache: "no-store",
      });
      return readJson<TenantMembershipDto[]>(response);
    },

    async listRoleAssignments(sessionToken: string, tenantId: string, userId: string): Promise<RoleAssignmentDto[]> {
      const response = await fetchFn(
        withBaseUrl(`/v1/tenants/${tenantId}/role-assignments${toQueryString({ userId })}`),
        {
          headers: withAuth(sessionToken),
          cache: "no-store",
        },
      );
      return readJson<RoleAssignmentDto[]>(response);
    },

    async listProvisioningInvites(sessionToken: string, tenantId: string): Promise<ProvisioningInviteDto[]> {
      const response = await fetchFn(withBaseUrl(`/v1/tenants/${tenantId}/provisioning-invites`), {
        headers: withAuth(sessionToken),
        cache: "no-store",
      });
      return readJson<ProvisioningInviteDto[]>(response);
    },

    async getOnboardingWorkspace(sessionToken: string, tenantId: string): Promise<OnboardingWorkspaceDto | null> {
      const response = await fetchFn(withBaseUrl(`/v1/tenants/${tenantId}/onboarding-workspace`), {
        headers: withAuth(sessionToken),
        cache: "no-store",
      });
      return readJson<OnboardingWorkspaceDto | null>(response);
    },

    async getOnboardingReadiness(sessionToken: string, tenantId: string): Promise<TransparentBoolean> {
      const response = await fetchFn(withBaseUrl(`/v1/tenants/${tenantId}/onboarding-readiness`), {
        headers: withAuth(sessionToken),
        cache: "no-store",
      });
      return readJson<TransparentBoolean>(response);
    },

    async listAuditAccessPolicies(sessionToken: string, tenantId: string, userId: string): Promise<AuditAccessPolicyDto[]> {
      const response = await fetchFn(
        withBaseUrl(`/v1/tenants/${tenantId}/audit-access-policies${toQueryString({ userId })}`),
        {
          headers: withAuth(sessionToken),
          cache: "no-store",
        },
      );
      return readJson<AuditAccessPolicyDto[]>(response);
    },

    async listAuditEvents(sessionToken: string, tenantId: string, query?: AuditEventQuery): Promise<AccessAuditEventDto[]> {
      const response = await fetchFn(
        withBaseUrl(`/v1/tenants/${tenantId}/audit-events${toQueryString({
          userId: query?.userId,
          role: query?.role,
          resource: query?.resource,
          lawfulBasis: query?.lawfulBasis,
          result: query?.result,
          from: query?.from,
          to: query?.to,
        })}`),
        {
          headers: withAuth(sessionToken),
          cache: "no-store",
        },
      );
      return readJson<AccessAuditEventDto[]>(response);
    },

    async listAccessPurposeRecords(
      sessionToken: string,
      tenantId: string,
      query?: { userId?: string; employeeId?: string; lawfulBasis?: string },
    ): Promise<AccessPurposeRecordDto[]> {
      const response = await fetchFn(
        withBaseUrl(`/v1/tenants/${tenantId}/access-purpose-records${toQueryString(query)}`),
        {
          headers: withAuth(sessionToken),
          cache: "no-store",
        },
      );
      return readJson<AccessPurposeRecordDto[]>(response);
    },

    async evaluateAccess(
      sessionToken: string,
      tenantId: string,
      payload: AccessEvaluationRequest,
    ): Promise<AccessEvaluationResponse> {
      const response = await fetchFn(withBaseUrl(`/v1/tenants/${tenantId}/access-evaluations`), {
        method: "POST",
        headers: withAuth(sessionToken),
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      return readJson<AccessEvaluationResponse>(response);
    },
  };
};

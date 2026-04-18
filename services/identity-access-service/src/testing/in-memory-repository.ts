import type {
  AccessAuditEvent,
  AccessPurposeRecord,
  AuditAccessPolicy,
  OnboardingWorkspace,
  PermissionGrant,
  PermissionPolicySet,
  PlatformUser,
  PortalSessionPolicy,
  ProvisioningInvite,
  RoleAssignment,
  SsoConfiguration,
  TenantMembership,
  UserEmployeeLink,
  UserProfile,
} from "../domain/types.js";
import type {
  IdentityAccessRepository,
  IdentityAccessRepositoryContext,
} from "../application/identity-access.service.js";

type ConstraintError = Error & { constraint: string };

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const constraintError = (constraint: string, message: string): ConstraintError => {
  const error = new Error(message) as ConstraintError;
  error.constraint = constraint;
  return error;
};

const matches = <T extends object>(value: T, filters?: Partial<T>): boolean => {
  if (!filters) {
    return true;
  }

  return Object.entries(filters).every(([key, expected]) =>
    expected === undefined || value[key as keyof T] === expected,
  );
};

export class InMemoryIdentityAccessRepository implements IdentityAccessRepository {
  private platformUsers = new Map<string, PlatformUser>();
  private userProfiles = new Map<string, UserProfile>();
  private tenantMemberships = new Map<string, TenantMembership>();
  private userEmployeeLinks = new Map<string, UserEmployeeLink>();
  private roleAssignments = new Map<string, RoleAssignment>();
  private permissionPolicySets = new Map<string, PermissionPolicySet>();
  private permissionGrants = new Map<string, PermissionGrant>();
  private portalSessionPolicies = new Map<string, PortalSessionPolicy>();
  private ssoConfigurations = new Map<string, SsoConfiguration>();
  private accessPurposeRecords = new Map<string, AccessPurposeRecord>();
  private auditAccessPolicies = new Map<string, AuditAccessPolicy>();
  private onboardingWorkspaces = new Map<string, OnboardingWorkspace>();
  private provisioningInvites = new Map<string, ProvisioningInvite>();
  private accessAuditEvents = new Map<string, AccessAuditEvent>();

  async withTransaction<T>(operation: (repository: IdentityAccessRepositoryContext) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createPlatformUser(user: PlatformUser): Promise<PlatformUser> {
    if ([...this.platformUsers.values()].some((candidate) => candidate.email === user.email)) {
      throw constraintError("platform_user_email_key", "Platform user email must be unique.");
    }
    this.platformUsers.set(user.id, clone(user));
    return clone(user);
  }

  async updatePlatformUser(user: PlatformUser): Promise<PlatformUser> {
    this.platformUsers.set(user.id, clone(user));
    return clone(user);
  }

  async getPlatformUserById(userId: string): Promise<PlatformUser | null> {
    return clone(this.platformUsers.get(userId) ?? null);
  }

  async createUserProfile(profile: UserProfile): Promise<UserProfile> {
    this.userProfiles.set(profile.userId, clone(profile));
    return clone(profile);
  }

  async getUserProfileByUserId(userId: string): Promise<UserProfile | null> {
    return clone(this.userProfiles.get(userId) ?? null);
  }

  async createTenantMembership(membership: TenantMembership): Promise<TenantMembership> {
    if ([...this.tenantMemberships.values()].some((candidate) =>
      candidate.tenantId === membership.tenantId &&
      candidate.userId === membership.userId &&
      candidate.leftAt === undefined &&
      candidate.membershipStatus !== "revoked",
    )) {
      throw constraintError("uq_tenant_membership_active_user", "Only one active membership per tenant and user.");
    }
    this.tenantMemberships.set(membership.id, clone(membership));
    return clone(membership);
  }

  async updateTenantMembership(membership: TenantMembership): Promise<TenantMembership> {
    this.tenantMemberships.set(membership.id, clone(membership));
    return clone(membership);
  }

  async getTenantMembershipById(tenantId: string, membershipId: string): Promise<TenantMembership | null> {
    const membership = this.tenantMemberships.get(membershipId);
    if (!membership || membership.tenantId !== tenantId) {
      return null;
    }
    return clone(membership);
  }

  async listTenantMemberships(tenantId: string): Promise<TenantMembership[]> {
    return [...this.tenantMemberships.values()]
      .filter((membership) => membership.tenantId === tenantId)
      .map(clone);
  }

  async createUserEmployeeLink(link: UserEmployeeLink): Promise<UserEmployeeLink> {
    if ([...this.userEmployeeLinks.values()].some((candidate) =>
      candidate.tenantId === link.tenantId &&
      candidate.userId === link.userId &&
      candidate.revokedAt === undefined,
    )) {
      throw constraintError("uq_user_employee_link_active_user", "Only one active user employee link per tenant and user.");
    }
    this.userEmployeeLinks.set(link.id, clone(link));
    return clone(link);
  }

  async listUserEmployeeLinksByUser(tenantId: string, userId: string): Promise<UserEmployeeLink[]> {
    return [...this.userEmployeeLinks.values()]
      .filter((link) => link.tenantId === tenantId && link.userId === userId)
      .map(clone);
  }

  async createRoleAssignment(roleAssignment: RoleAssignment): Promise<RoleAssignment> {
    this.roleAssignments.set(roleAssignment.id, clone(roleAssignment));
    return clone(roleAssignment);
  }

  async listRoleAssignmentsByUser(tenantId: string, userId: string): Promise<RoleAssignment[]> {
    return [...this.roleAssignments.values()]
      .filter((assignment) => assignment.tenantId === tenantId && assignment.userId === userId)
      .map(clone);
  }

  async createPermissionPolicySet(policySet: PermissionPolicySet): Promise<PermissionPolicySet> {
    if ([...this.permissionPolicySets.values()].some((candidate) =>
      candidate.tenantId === policySet.tenantId &&
      candidate.policyCode === policySet.policyCode &&
      candidate.policyVersion === policySet.policyVersion,
    )) {
      throw constraintError("uq_permission_policy_set_code_version", "Policy version must be unique.");
    }

    if (policySet.activeFlag && [...this.permissionPolicySets.values()].some((candidate) =>
      candidate.tenantId === policySet.tenantId &&
      candidate.policyCode === policySet.policyCode &&
      candidate.activeFlag,
    )) {
      throw constraintError("uq_permission_policy_set_active_version", "Only one active policy version allowed.");
    }

    this.permissionPolicySets.set(policySet.id, clone(policySet));
    return clone(policySet);
  }

  async listPermissionPolicySets(tenantId: string): Promise<PermissionPolicySet[]> {
    return [...this.permissionPolicySets.values()]
      .filter((policySet) => policySet.tenantId === tenantId)
      .map(clone);
  }

  async createPermissionGrant(permissionGrant: PermissionGrant): Promise<PermissionGrant> {
    this.permissionGrants.set(permissionGrant.id, clone(permissionGrant));
    return clone(permissionGrant);
  }

  async listPermissionGrants(tenantId: string): Promise<PermissionGrant[]> {
    return [...this.permissionGrants.values()]
      .filter((grant) => grant.tenantId === tenantId)
      .map(clone);
  }

  async upsertPortalSessionPolicy(policy: PortalSessionPolicy): Promise<PortalSessionPolicy> {
    this.portalSessionPolicies.set(policy.tenantId, clone(policy));
    return clone(policy);
  }

  async getPortalSessionPolicy(tenantId: string): Promise<PortalSessionPolicy | null> {
    return clone(this.portalSessionPolicies.get(tenantId) ?? null);
  }

  async upsertSsoConfiguration(configuration: SsoConfiguration): Promise<SsoConfiguration> {
    this.ssoConfigurations.set(configuration.id, clone(configuration));
    return clone(configuration);
  }

  async listSsoConfigurations(tenantId: string): Promise<SsoConfiguration[]> {
    return [...this.ssoConfigurations.values()]
      .filter((configuration) => configuration.tenantId === tenantId)
      .map(clone);
  }

  async createAccessPurposeRecord(record: AccessPurposeRecord): Promise<AccessPurposeRecord> {
    this.accessPurposeRecords.set(record.id, clone(record));
    return clone(record);
  }

  async listAccessPurposeRecords(
    tenantId: string,
    filters?: {
      userId?: string;
      employeeId?: string;
      lawfulBasis?: AccessPurposeRecord["lawfulBasis"];
    },
  ): Promise<AccessPurposeRecord[]> {
    return [...this.accessPurposeRecords.values()]
      .filter((record) => record.tenantId === tenantId)
      .filter((record) => matches(record, filters))
      .map(clone);
  }

  async upsertAuditAccessPolicy(policy: AuditAccessPolicy): Promise<AuditAccessPolicy> {
    const key = `${policy.tenantId}:${policy.roleCode}`;
    this.auditAccessPolicies.set(key, clone(policy));
    return clone(policy);
  }

  async getAuditAccessPolicyByRole(tenantId: string, roleCode: string): Promise<AuditAccessPolicy | null> {
    return clone(this.auditAccessPolicies.get(`${tenantId}:${roleCode}`) ?? null);
  }

  async createOnboardingWorkspace(workspace: OnboardingWorkspace): Promise<OnboardingWorkspace> {
    if ([...this.onboardingWorkspaces.values()].some((candidate) => candidate.tenantId === workspace.tenantId)) {
      throw constraintError("uq_onboarding_workspace_tenant", "Only one onboarding workspace per tenant.");
    }
    this.onboardingWorkspaces.set(workspace.id, clone(workspace));
    return clone(workspace);
  }

  async updateOnboardingWorkspace(workspace: OnboardingWorkspace): Promise<OnboardingWorkspace> {
    this.onboardingWorkspaces.set(workspace.id, clone(workspace));
    return clone(workspace);
  }

  async getOnboardingWorkspace(tenantId: string): Promise<OnboardingWorkspace | null> {
    return clone(
      [...this.onboardingWorkspaces.values()].find((workspace) => workspace.tenantId === tenantId) ?? null,
    );
  }

  async createProvisioningInvite(invite: ProvisioningInvite): Promise<ProvisioningInvite> {
    this.provisioningInvites.set(invite.id, clone(invite));
    return clone(invite);
  }

  async listProvisioningInvites(
    tenantId: string,
    filters?: {
      inviteStatus?: ProvisioningInvite["inviteStatus"];
    },
  ): Promise<ProvisioningInvite[]> {
    return [...this.provisioningInvites.values()]
      .filter((invite) => invite.tenantId === tenantId)
      .filter((invite) => matches(invite, filters))
      .map(clone);
  }

  async createAccessAuditEvent(event: AccessAuditEvent): Promise<AccessAuditEvent> {
    this.accessAuditEvents.set(event.id, clone(event));
    return clone(event);
  }

  async listAccessAuditEvents(
    tenantId: string,
    filters?: {
      userId?: string;
      resourceType?: string;
      lawfulBasis?: AccessPurposeRecord["lawfulBasis"];
    },
  ): Promise<AccessAuditEvent[]> {
    return [...this.accessAuditEvents.values()]
      .filter((event) => event.tenantId === tenantId)
      .filter((event) => matches(event, filters))
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
      .map(clone);
  }
}

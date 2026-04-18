import {
  calculateEffectivePermissionAllowed,
  calculateOnboardingReadyForGoLive,
  calculateResolvedLocale,
} from "../domain/formulas.js";
import type {
  AccessAuditEvent,
  AccessPurposeRecord,
  ActorRole,
  AuditAccessPolicy,
  EffectivePermissionDecision,
  OnboardingWorkspace,
  PermissionGrant,
  PermissionPolicySet,
  PlatformUser,
  PortalSessionPolicy,
  ProvisioningInvite,
  RoleAssignment,
  SsoConfiguration,
  TenantMembership,
  UpdateOnboardingWorkspacePatch,
  UpdatePlatformUserPatch,
  UpdateTenantMembershipPatch,
  UserEmployeeLink,
  UserProfile,
} from "../domain/types.js";
import {
  hasBlockingIssues,
  type ValidationIssue,
  validateAccessPurposeRecord,
  validateOnboardingWorkspace,
  validateOnboardingWorkspacePatch,
  validatePermissionGrant,
  validatePermissionPolicySet,
  validatePlatformUser,
  validatePlatformUserPatch,
  validatePortalSessionPolicy,
  validateProvisioningInvite,
  validateRoleAssignment,
  validateSsoConfiguration,
  validateTenantMembership,
  validateTenantMembershipPatch,
  validateUserEmployeeLink,
  validateUserProfile,
} from "../domain/validations.js";

export interface IdentityAccessRepositoryContext {
  createPlatformUser(user: PlatformUser): Promise<PlatformUser>;
  updatePlatformUser(user: PlatformUser): Promise<PlatformUser>;
  getPlatformUserById(userId: string): Promise<PlatformUser | null>;

  createUserProfile(profile: UserProfile): Promise<UserProfile>;
  getUserProfileByUserId(userId: string): Promise<UserProfile | null>;

  createTenantMembership(membership: TenantMembership): Promise<TenantMembership>;
  updateTenantMembership(membership: TenantMembership): Promise<TenantMembership>;
  getTenantMembershipById(tenantId: string, membershipId: string): Promise<TenantMembership | null>;
  listTenantMemberships(tenantId: string): Promise<TenantMembership[]>;

  createUserEmployeeLink(link: UserEmployeeLink): Promise<UserEmployeeLink>;
  listUserEmployeeLinksByUser(tenantId: string, userId: string): Promise<UserEmployeeLink[]>;

  createRoleAssignment(roleAssignment: RoleAssignment): Promise<RoleAssignment>;
  listRoleAssignmentsByUser(tenantId: string, userId: string): Promise<RoleAssignment[]>;

  createPermissionPolicySet(policySet: PermissionPolicySet): Promise<PermissionPolicySet>;
  listPermissionPolicySets(tenantId: string): Promise<PermissionPolicySet[]>;

  createPermissionGrant(permissionGrant: PermissionGrant): Promise<PermissionGrant>;
  listPermissionGrants(tenantId: string): Promise<PermissionGrant[]>;

  upsertPortalSessionPolicy(policy: PortalSessionPolicy): Promise<PortalSessionPolicy>;
  getPortalSessionPolicy(tenantId: string): Promise<PortalSessionPolicy | null>;

  upsertSsoConfiguration(configuration: SsoConfiguration): Promise<SsoConfiguration>;
  listSsoConfigurations(tenantId: string): Promise<SsoConfiguration[]>;

  createAccessPurposeRecord(record: AccessPurposeRecord): Promise<AccessPurposeRecord>;
  listAccessPurposeRecords(tenantId: string, filters?: {
    userId?: string;
    employeeId?: string;
    lawfulBasis?: AccessPurposeRecord["lawfulBasis"];
  }): Promise<AccessPurposeRecord[]>;

  upsertAuditAccessPolicy(policy: AuditAccessPolicy): Promise<AuditAccessPolicy>;
  getAuditAccessPolicyByRole(tenantId: string, roleCode: string): Promise<AuditAccessPolicy | null>;

  createOnboardingWorkspace(workspace: OnboardingWorkspace): Promise<OnboardingWorkspace>;
  updateOnboardingWorkspace(workspace: OnboardingWorkspace): Promise<OnboardingWorkspace>;
  getOnboardingWorkspace(tenantId: string): Promise<OnboardingWorkspace | null>;

  createProvisioningInvite(invite: ProvisioningInvite): Promise<ProvisioningInvite>;
  listProvisioningInvites(tenantId: string, filters?: {
    inviteStatus?: ProvisioningInvite["inviteStatus"];
  }): Promise<ProvisioningInvite[]>;

  createAccessAuditEvent(event: AccessAuditEvent): Promise<AccessAuditEvent>;
  listAccessAuditEvents(tenantId: string, filters?: {
    userId?: string;
    resourceType?: string;
    lawfulBasis?: AccessPurposeRecord["lawfulBasis"];
  }): Promise<AccessAuditEvent[]>;
}

export interface IdentityAccessRepository extends IdentityAccessRepositoryContext {
  withTransaction<T>(operation: (repository: IdentityAccessRepositoryContext) => Promise<T>): Promise<T>;
}

export interface ActorContext {
  actorId?: string;
  actorRole: ActorRole;
  correlationId?: string;
  effectiveAt: string;
}

export interface CommandResult<T> {
  data?: T;
  issues: ValidationIssue[];
}

interface RepositoryConstraintErrorLike {
  constraint?: string;
}

const generateId = (): string => crypto.randomUUID();
const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000000";

const withOptional = <T extends object, K extends string, V>(
  target: T,
  key: K,
  value: V | undefined,
): T & Partial<Record<K, V>> =>
  value === undefined ? target : { ...target, [key]: value };

const isRepositoryConstraintError = (error: unknown): error is RepositoryConstraintErrorLike =>
  typeof error === "object" &&
  error !== null &&
  "constraint" in error &&
  typeof (error as RepositoryConstraintErrorLike).constraint === "string";

const mapRepositoryErrorToIssue = (error: unknown): ValidationIssue | null => {
  if (!isRepositoryConstraintError(error)) {
    return null;
  }

  switch (error.constraint) {
    case "uq_tenant_membership_active_user":
      return { field: "membership", message: "Es existiert bereits eine aktive Tenant-Mitgliedschaft fuer diesen Benutzer.", severity: "error" };
    case "uq_user_employee_link_active_user":
      return { field: "userEmployeeLink", message: "Es existiert bereits eine aktive Benutzer-Mitarbeiter-Verknuepfung.", severity: "error" };
    case "uq_permission_policy_set_code_version":
      return { field: "policyVersion", message: "Diese Policy-Version existiert bereits.", severity: "error" };
    case "uq_permission_policy_set_active_version":
      return { field: "activeFlag", message: "Pro Tenant und Policy-Code darf nur eine aktive Policy-Version existieren.", severity: "error" };
    case "uq_onboarding_workspace_tenant":
      return { field: "onboardingWorkspace", message: "Fuer diesen Tenant existiert bereits ein Onboarding-Workspace.", severity: "error" };
    case "platform_user_email_key":
      return { field: "email", message: "E-Mail-Adresse ist bereits vorhanden.", severity: "error" };
    default:
      return null;
  }
};

export class IdentityAccessService {
  constructor(private readonly repository: IdentityAccessRepository) {}

  private async appendAccessAuditEvent(
    repository: IdentityAccessRepositoryContext,
    event: Omit<AccessAuditEvent, "id">,
  ): Promise<AccessAuditEvent> {
    return repository.createAccessAuditEvent({
      id: generateId(),
      ...event,
    });
  }

  async createPlatformUser(user: PlatformUser, profile?: UserProfile, actor?: ActorContext): Promise<CommandResult<PlatformUser>> {
    const issues = validatePlatformUser(user);
    if (profile) {
      issues.push(...validateUserProfile(profile));
    }
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const createdUser = await transaction.createPlatformUser(user);
        if (profile) {
          await transaction.createUserProfile({
            ...profile,
            userId: createdUser.id,
          });
        }
        if (actor) {
          const event = withOptional(
            withOptional(
              {
                tenantId: PLATFORM_TENANT_ID,
                userId: createdUser.id,
                actorRole: actor.actorRole,
                resourceType: "platform_user",
                resourceReference: createdUser.id,
                action: "create",
                result: "success",
                occurredAt: actor.effectiveAt,
                payload: {
                  preferredLanguage: createdUser.preferredLanguage,
                },
              },
              "actorId",
              actor.actorId,
            ),
            "correlationId",
            actor.correlationId,
          );
          await this.appendAccessAuditEvent(transaction, event);
        }
        return { data: createdUser, issues };
      });
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async updatePlatformUser(params: {
    userId: string;
    patch: UpdatePlatformUserPatch;
  }, actor: ActorContext): Promise<CommandResult<PlatformUser>> {
    const issues = validatePlatformUserPatch(params.patch);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const existing = await transaction.getPlatformUserById(params.userId);
      if (!existing) {
        return { issues: [{ field: "userId", message: "Platform-Benutzer wurde nicht gefunden.", severity: "error" }] };
      }

      const updated = await transaction.updatePlatformUser({
        ...existing,
        ...params.patch,
        updatedAt: params.patch.updatedAt ?? actor.effectiveAt,
      });
      const event = withOptional(
        withOptional(
          {
            tenantId: PLATFORM_TENANT_ID,
            userId: updated.id,
            actorRole: actor.actorRole,
            resourceType: "platform_user",
            resourceReference: updated.id,
            action: "update",
            result: "success",
            occurredAt: actor.effectiveAt,
            payload: {
              patch: params.patch,
            },
          },
          "actorId",
          actor.actorId,
        ),
        "correlationId",
        actor.correlationId,
      );
      await this.appendAccessAuditEvent(transaction, event);
      return { data: updated, issues };
    });
  }

  async createTenantMembership(membership: TenantMembership, actor: ActorContext): Promise<CommandResult<TenantMembership>> {
    const issues = validateTenantMembership(membership);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const created = await transaction.createTenantMembership(membership);
        const event = withOptional(
          withOptional(
            {
              tenantId: created.tenantId,
              userId: created.userId,
              actorRole: actor.actorRole,
              resourceType: "tenant_membership",
              resourceReference: created.id,
              action: "create",
              result: "success",
              occurredAt: actor.effectiveAt,
              payload: {
                membershipStatus: created.membershipStatus,
              },
            },
            "actorId",
            actor.actorId,
          ),
          "correlationId",
          actor.correlationId,
        );
        await this.appendAccessAuditEvent(transaction, event);
        return { data: created, issues };
      });
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async updateTenantMembership(params: {
    tenantId: string;
    membershipId: string;
    patch: UpdateTenantMembershipPatch;
  }, actor: ActorContext): Promise<CommandResult<TenantMembership>> {
    const issues = validateTenantMembershipPatch(params.patch);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const existing = await transaction.getTenantMembershipById(params.tenantId, params.membershipId);
      if (!existing) {
        return { issues: [{ field: "membershipId", message: "Tenant-Mitgliedschaft wurde nicht gefunden.", severity: "error" }] };
      }

      const updated = await transaction.updateTenantMembership({
        ...existing,
        ...params.patch,
        updatedAt: params.patch.updatedAt ?? actor.effectiveAt,
      });
      const event = withOptional(
        withOptional(
          {
            tenantId: updated.tenantId,
            userId: updated.userId,
            actorRole: actor.actorRole,
            resourceType: "tenant_membership",
            resourceReference: updated.id,
            action: "update",
            result: "success",
            occurredAt: actor.effectiveAt,
            payload: {
              patch: params.patch,
            },
          },
          "actorId",
          actor.actorId,
        ),
        "correlationId",
        actor.correlationId,
      );
      await this.appendAccessAuditEvent(transaction, event);
      return { data: updated, issues };
    });
  }

  async createUserEmployeeLink(link: UserEmployeeLink, actor: ActorContext): Promise<CommandResult<UserEmployeeLink>> {
    const issues = validateUserEmployeeLink(link);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const created = await transaction.createUserEmployeeLink(link);
        const event = withOptional(
          withOptional(
            {
              tenantId: created.tenantId,
              userId: created.userId,
              actorRole: actor.actorRole,
              resourceType: "user_employee_link",
              resourceReference: created.id,
              action: "create",
              result: "success",
              occurredAt: actor.effectiveAt,
              payload: {
                employeeId: created.employeeId,
                linkType: created.linkType,
              },
            },
            "actorId",
            actor.actorId,
          ),
          "correlationId",
          actor.correlationId,
        );
        await this.appendAccessAuditEvent(transaction, event);
        return { data: created, issues };
      });
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async createRoleAssignment(roleAssignment: RoleAssignment, actor: ActorContext): Promise<CommandResult<RoleAssignment>> {
    const issues = validateRoleAssignment(roleAssignment);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const created = await transaction.createRoleAssignment(roleAssignment);
      const event = withOptional(
        withOptional(
          withOptional(
            {
              tenantId: created.tenantId,
              userId: created.userId,
              actorRole: actor.actorRole,
              resourceType: "role_assignment",
              resourceReference: created.id,
              action: "create",
              result: "success",
              occurredAt: actor.effectiveAt,
              payload: {
                roleCode: created.roleCode,
                scopeType: created.scopeType,
                scopeReference: created.scopeReference,
              },
            },
            "actorId",
            actor.actorId,
          ),
          "correlationId",
          actor.correlationId,
        ),
        "userId",
        created.userId,
      );
      await this.appendAccessAuditEvent(transaction, event);
      return { data: created, issues };
    });
  }

  async createPermissionPolicySet(policySet: PermissionPolicySet, actor: ActorContext): Promise<CommandResult<PermissionPolicySet>> {
    const issues = validatePermissionPolicySet(policySet);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const created = await transaction.createPermissionPolicySet(policySet);
        const event = withOptional(
          withOptional(
            {
              tenantId: created.tenantId ?? PLATFORM_TENANT_ID,
              actorRole: actor.actorRole,
              resourceType: "permission_policy_set",
              resourceReference: created.id,
              action: "create",
              result: "success",
              occurredAt: actor.effectiveAt,
              payload: {
                policyCode: created.policyCode,
                policyVersion: created.policyVersion,
                activeFlag: created.activeFlag,
              },
            },
            "actorId",
            actor.actorId,
          ),
          "correlationId",
          actor.correlationId,
        );
        await this.appendAccessAuditEvent(transaction, event);
        return { data: created, issues };
      });
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async createPermissionGrant(permissionGrant: PermissionGrant, actor: ActorContext): Promise<CommandResult<PermissionGrant>> {
    const issues = validatePermissionGrant(permissionGrant);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const created = await transaction.createPermissionGrant(permissionGrant);
      const event = withOptional(
        withOptional(
          {
            tenantId: created.tenantId ?? PLATFORM_TENANT_ID,
            actorRole: actor.actorRole,
            resourceType: "permission_grant",
            resourceReference: created.id,
            action: "create",
            result: "success",
            occurredAt: actor.effectiveAt,
            payload: {
              roleCode: created.roleCode,
              resourceType: created.resourceType,
              actionName: created.action,
              effect: created.effect,
            },
          },
          "actorId",
          actor.actorId,
        ),
        "correlationId",
        actor.correlationId,
      );
      await this.appendAccessAuditEvent(transaction, event);
      return { data: created, issues };
    });
  }

  async upsertPortalSessionPolicy(policy: PortalSessionPolicy): Promise<CommandResult<PortalSessionPolicy>> {
    const issues = validatePortalSessionPolicy(policy);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    const data = await this.repository.upsertPortalSessionPolicy(policy);
    return { data, issues };
  }

  async upsertSsoConfiguration(configuration: SsoConfiguration): Promise<CommandResult<SsoConfiguration>> {
    const issues = validateSsoConfiguration(configuration);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    const data = await this.repository.upsertSsoConfiguration(configuration);
    return { data, issues };
  }

  async createAccessPurposeRecord(record: AccessPurposeRecord): Promise<CommandResult<AccessPurposeRecord>> {
    const issues = validateAccessPurposeRecord(record);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    const data = await this.repository.createAccessPurposeRecord(record);
    return { data, issues };
  }

  async upsertAuditAccessPolicy(policy: AuditAccessPolicy): Promise<CommandResult<AuditAccessPolicy>> {
    const data = await this.repository.upsertAuditAccessPolicy(policy);
    return { data, issues: [] };
  }

  async createOnboardingWorkspace(workspace: OnboardingWorkspace): Promise<CommandResult<OnboardingWorkspace>> {
    const issues = validateOnboardingWorkspace(workspace);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const data = await this.repository.createOnboardingWorkspace(workspace);
      return { data, issues };
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async updateOnboardingWorkspace(params: {
    tenantId: string;
    patch: UpdateOnboardingWorkspacePatch;
  }): Promise<CommandResult<OnboardingWorkspace>> {
    return this.repository.withTransaction(async (transaction) => {
      const existing = await transaction.getOnboardingWorkspace(params.tenantId);
      if (!existing) {
        return { issues: [{ field: "tenantId", message: "Onboarding-Workspace wurde nicht gefunden.", severity: "error" }] };
      }

      const issues = validateOnboardingWorkspacePatch(existing.status, params.patch);
      if (hasBlockingIssues(issues)) {
        return { issues };
      }

      const updated = await transaction.updateOnboardingWorkspace({
        ...existing,
        ...params.patch,
        updatedAt: params.patch.updatedAt ?? new Date().toISOString(),
      });
      return { data: updated, issues };
    });
  }

  async createProvisioningInvite(invite: ProvisioningInvite): Promise<CommandResult<ProvisioningInvite>> {
    const issues = validateProvisioningInvite(invite);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    const data = await this.repository.createProvisioningInvite(invite);
    return { data, issues };
  }

  async getEffectivePermissions(params: {
    tenantId: string;
    userId: string;
    resourceType: string;
    action: string;
    effectiveAt: string;
  }): Promise<EffectivePermissionDecision> {
    const [roleAssignments, policySets, grants] = await Promise.all([
      this.repository.listRoleAssignmentsByUser(params.tenantId, params.userId),
      this.repository.listPermissionPolicySets(params.tenantId),
      this.repository.listPermissionGrants(params.tenantId),
    ]);

    return calculateEffectivePermissionAllowed({
      roleAssignments,
      policySets,
      grants,
      resourceType: params.resourceType,
      action: params.action,
      effectiveAt: params.effectiveAt,
    });
  }

  async getResolvedLocale(params: {
    userId: string;
    routeLocale?: PlatformUser["preferredLanguage"];
    tenantDefaultLanguage?: PlatformUser["preferredLanguage"];
    effectiveAt: string;
  }) {
    const user = await this.repository.getPlatformUserById(params.userId);
    const localeInput = withOptional(
      withOptional(
        withOptional(
          { effectiveAt: params.effectiveAt },
          "routeLocale",
          params.routeLocale,
        ),
        "userPreferredLanguage",
        user?.preferredLanguage,
      ),
      "tenantDefaultLanguage",
      params.tenantDefaultLanguage,
    );
    return calculateResolvedLocale(localeInput);
  }

  async getOnboardingReadiness(tenantId: string) {
    const workspace = await this.repository.getOnboardingWorkspace(tenantId);
    if (!workspace) {
      return calculateOnboardingReadyForGoLive({
        status: "created",
        policySyncStatus: "missing",
        userProvisioningStatus: "missing",
        integrationSetupStatus: "missing",
        effectiveAt: new Date().toISOString(),
      });
    }

    return calculateOnboardingReadyForGoLive({
      status: workspace.status,
      policySyncStatus: workspace.policySyncStatus,
      userProvisioningStatus: workspace.userProvisioningStatus,
      integrationSetupStatus: workspace.integrationSetupStatus,
      effectiveAt: workspace.updatedAt,
    });
  }
}

import type { AccessAuditEvent, AccessPurposeRecord, ActorRole, AuditAccessPolicy, EffectivePermissionSnapshot, EffectivePermissionDecision, OnboardingWorkspace, PermissionCheck, PermissionGrant, PermissionPolicySet, PlatformUser, PortalBootstrap, PortalSessionPolicy, ProvisioningInvite, RoleAssignment, SsoConfiguration, TenantMembership, UpdateOnboardingWorkspacePatch, UpdatePlatformUserPatch, UpdateTenantMembershipPatch, UserEmployeeLink, UserProfile } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
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
export declare class IdentityAccessService {
    private readonly repository;
    constructor(repository: IdentityAccessRepository);
    private appendAccessAuditEvent;
    createPlatformUser(user: PlatformUser, profile?: UserProfile, actor?: ActorContext): Promise<CommandResult<PlatformUser>>;
    updatePlatformUser(params: {
        userId: string;
        patch: UpdatePlatformUserPatch;
    }, actor: ActorContext): Promise<CommandResult<PlatformUser>>;
    createTenantMembership(membership: TenantMembership, actor: ActorContext): Promise<CommandResult<TenantMembership>>;
    updateTenantMembership(params: {
        tenantId: string;
        membershipId: string;
        patch: UpdateTenantMembershipPatch;
    }, actor: ActorContext): Promise<CommandResult<TenantMembership>>;
    createUserEmployeeLink(link: UserEmployeeLink, actor: ActorContext): Promise<CommandResult<UserEmployeeLink>>;
    createRoleAssignment(roleAssignment: RoleAssignment, actor: ActorContext): Promise<CommandResult<RoleAssignment>>;
    createPermissionPolicySet(policySet: PermissionPolicySet, actor: ActorContext): Promise<CommandResult<PermissionPolicySet>>;
    createPermissionGrant(permissionGrant: PermissionGrant, actor: ActorContext): Promise<CommandResult<PermissionGrant>>;
    upsertPortalSessionPolicy(policy: PortalSessionPolicy): Promise<CommandResult<PortalSessionPolicy>>;
    upsertSsoConfiguration(configuration: SsoConfiguration): Promise<CommandResult<SsoConfiguration>>;
    createAccessPurposeRecord(record: AccessPurposeRecord): Promise<CommandResult<AccessPurposeRecord>>;
    upsertAuditAccessPolicy(policy: AuditAccessPolicy): Promise<CommandResult<AuditAccessPolicy>>;
    createOnboardingWorkspace(workspace: OnboardingWorkspace): Promise<CommandResult<OnboardingWorkspace>>;
    updateOnboardingWorkspace(params: {
        tenantId: string;
        patch: UpdateOnboardingWorkspacePatch;
    }): Promise<CommandResult<OnboardingWorkspace>>;
    createProvisioningInvite(invite: ProvisioningInvite): Promise<CommandResult<ProvisioningInvite>>;
    listTenantMemberships(tenantId: string): Promise<TenantMembership[]>;
    listRoleAssignments(tenantId: string, userId: string): Promise<RoleAssignment[]>;
    listProvisioningInvites(tenantId: string, filters?: {
        inviteStatus?: ProvisioningInvite["inviteStatus"];
    }): Promise<ProvisioningInvite[]>;
    listAccessPurposeRecords(tenantId: string, filters?: {
        userId?: string;
        employeeId?: string;
        lawfulBasis?: AccessPurposeRecord["lawfulBasis"];
    }): Promise<AccessPurposeRecord[]>;
    listAccessAuditEvents(tenantId: string, filters?: {
        userId?: string;
        resourceType?: string;
        lawfulBasis?: AccessPurposeRecord["lawfulBasis"];
    }): Promise<AccessAuditEvent[]>;
    getOnboardingWorkspace(tenantId: string): Promise<OnboardingWorkspace | null>;
    getAuditAccessPoliciesForUser(tenantId: string, userId: string): Promise<AuditAccessPolicy[]>;
    getEffectivePermissions(params: {
        tenantId: string;
        userId: string;
        resourceType: string;
        action: string;
        effectiveAt: string;
    }): Promise<EffectivePermissionDecision>;
    getEffectivePermissionSnapshots(params: {
        tenantId: string;
        userId: string;
        permissions: PermissionCheck[];
        effectiveAt: string;
    }): Promise<EffectivePermissionSnapshot[]>;
    getResolvedLocale(params: {
        userId: string;
        routeLocale?: PlatformUser["preferredLanguage"];
        tenantDefaultLanguage?: PlatformUser["preferredLanguage"];
        effectiveAt: string;
    }): Promise<import("../domain/types.js").TransparentLocale>;
    getOnboardingReadiness(tenantId: string): Promise<import("../domain/types.js").TransparentBoolean>;
    getPortalBootstrap(params: {
        tenantId: string;
        userId: string;
        routeLocale?: PlatformUser["preferredLanguage"];
        tenantDefaultLanguage?: PlatformUser["preferredLanguage"];
        permissions: PermissionCheck[];
        effectiveAt: string;
    }): Promise<PortalBootstrap>;
}

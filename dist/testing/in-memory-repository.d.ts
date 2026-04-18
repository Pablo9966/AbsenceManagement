import type { AccessAuditEvent, AccessPurposeRecord, AuditAccessPolicy, OnboardingWorkspace, PermissionGrant, PermissionPolicySet, PlatformUser, PortalSessionPolicy, ProvisioningInvite, RoleAssignment, SsoConfiguration, TenantMembership, UserEmployeeLink, UserProfile } from "../domain/types.js";
import type { IdentityAccessRepository, IdentityAccessRepositoryContext } from "../application/identity-access.service.js";
export interface IdentityAccessRepositorySnapshot {
    platformUsers: PlatformUser[];
    userProfiles: UserProfile[];
    tenantMemberships: TenantMembership[];
    userEmployeeLinks: UserEmployeeLink[];
    roleAssignments: RoleAssignment[];
    permissionPolicySets: PermissionPolicySet[];
    permissionGrants: PermissionGrant[];
    portalSessionPolicies: PortalSessionPolicy[];
    ssoConfigurations: SsoConfiguration[];
    accessPurposeRecords: AccessPurposeRecord[];
    auditAccessPolicies: AuditAccessPolicy[];
    onboardingWorkspaces: OnboardingWorkspace[];
    provisioningInvites: ProvisioningInvite[];
    accessAuditEvents: AccessAuditEvent[];
}
export declare class InMemoryIdentityAccessRepository implements IdentityAccessRepository {
    private platformUsers;
    private userProfiles;
    private tenantMemberships;
    private userEmployeeLinks;
    private roleAssignments;
    private permissionPolicySets;
    private permissionGrants;
    private portalSessionPolicies;
    private ssoConfigurations;
    private accessPurposeRecords;
    private auditAccessPolicies;
    private onboardingWorkspaces;
    private provisioningInvites;
    private accessAuditEvents;
    withTransaction<T>(operation: (repository: IdentityAccessRepositoryContext) => Promise<T>): Promise<T>;
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
    exportSnapshot(): IdentityAccessRepositorySnapshot;
    loadSnapshot(snapshot: IdentityAccessRepositorySnapshot): void;
}

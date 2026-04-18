const clone = (value) => JSON.parse(JSON.stringify(value));
const constraintError = (constraint, message) => {
    const error = new Error(message);
    error.constraint = constraint;
    return error;
};
const matches = (value, filters) => {
    if (!filters) {
        return true;
    }
    return Object.entries(filters).every(([key, expected]) => expected === undefined || value[key] === expected);
};
export class InMemoryIdentityAccessRepository {
    platformUsers = new Map();
    userProfiles = new Map();
    tenantMemberships = new Map();
    userEmployeeLinks = new Map();
    roleAssignments = new Map();
    permissionPolicySets = new Map();
    permissionGrants = new Map();
    portalSessionPolicies = new Map();
    ssoConfigurations = new Map();
    accessPurposeRecords = new Map();
    auditAccessPolicies = new Map();
    onboardingWorkspaces = new Map();
    provisioningInvites = new Map();
    accessAuditEvents = new Map();
    async withTransaction(operation) {
        return operation(this);
    }
    async createPlatformUser(user) {
        if ([...this.platformUsers.values()].some((candidate) => candidate.email === user.email)) {
            throw constraintError("platform_user_email_key", "Platform user email must be unique.");
        }
        this.platformUsers.set(user.id, clone(user));
        return clone(user);
    }
    async updatePlatformUser(user) {
        this.platformUsers.set(user.id, clone(user));
        return clone(user);
    }
    async getPlatformUserById(userId) {
        return clone(this.platformUsers.get(userId) ?? null);
    }
    async createUserProfile(profile) {
        this.userProfiles.set(profile.userId, clone(profile));
        return clone(profile);
    }
    async getUserProfileByUserId(userId) {
        return clone(this.userProfiles.get(userId) ?? null);
    }
    async createTenantMembership(membership) {
        if ([...this.tenantMemberships.values()].some((candidate) => candidate.tenantId === membership.tenantId &&
            candidate.userId === membership.userId &&
            candidate.leftAt === undefined &&
            candidate.membershipStatus !== "revoked")) {
            throw constraintError("uq_tenant_membership_active_user", "Only one active membership per tenant and user.");
        }
        this.tenantMemberships.set(membership.id, clone(membership));
        return clone(membership);
    }
    async updateTenantMembership(membership) {
        this.tenantMemberships.set(membership.id, clone(membership));
        return clone(membership);
    }
    async getTenantMembershipById(tenantId, membershipId) {
        const membership = this.tenantMemberships.get(membershipId);
        if (!membership || membership.tenantId !== tenantId) {
            return null;
        }
        return clone(membership);
    }
    async listTenantMemberships(tenantId) {
        return [...this.tenantMemberships.values()]
            .filter((membership) => membership.tenantId === tenantId)
            .map(clone);
    }
    async createUserEmployeeLink(link) {
        if ([...this.userEmployeeLinks.values()].some((candidate) => candidate.tenantId === link.tenantId &&
            candidate.userId === link.userId &&
            candidate.revokedAt === undefined)) {
            throw constraintError("uq_user_employee_link_active_user", "Only one active user employee link per tenant and user.");
        }
        this.userEmployeeLinks.set(link.id, clone(link));
        return clone(link);
    }
    async listUserEmployeeLinksByUser(tenantId, userId) {
        return [...this.userEmployeeLinks.values()]
            .filter((link) => link.tenantId === tenantId && link.userId === userId)
            .map(clone);
    }
    async createRoleAssignment(roleAssignment) {
        this.roleAssignments.set(roleAssignment.id, clone(roleAssignment));
        return clone(roleAssignment);
    }
    async listRoleAssignmentsByUser(tenantId, userId) {
        return [...this.roleAssignments.values()]
            .filter((assignment) => assignment.tenantId === tenantId && assignment.userId === userId)
            .map(clone);
    }
    async createPermissionPolicySet(policySet) {
        if ([...this.permissionPolicySets.values()].some((candidate) => candidate.tenantId === policySet.tenantId &&
            candidate.policyCode === policySet.policyCode &&
            candidate.policyVersion === policySet.policyVersion)) {
            throw constraintError("uq_permission_policy_set_code_version", "Policy version must be unique.");
        }
        if (policySet.activeFlag && [...this.permissionPolicySets.values()].some((candidate) => candidate.tenantId === policySet.tenantId &&
            candidate.policyCode === policySet.policyCode &&
            candidate.activeFlag)) {
            throw constraintError("uq_permission_policy_set_active_version", "Only one active policy version allowed.");
        }
        this.permissionPolicySets.set(policySet.id, clone(policySet));
        return clone(policySet);
    }
    async listPermissionPolicySets(tenantId) {
        return [...this.permissionPolicySets.values()]
            .filter((policySet) => policySet.tenantId === tenantId)
            .map(clone);
    }
    async createPermissionGrant(permissionGrant) {
        this.permissionGrants.set(permissionGrant.id, clone(permissionGrant));
        return clone(permissionGrant);
    }
    async listPermissionGrants(tenantId) {
        return [...this.permissionGrants.values()]
            .filter((grant) => grant.tenantId === tenantId)
            .map(clone);
    }
    async upsertPortalSessionPolicy(policy) {
        this.portalSessionPolicies.set(policy.tenantId, clone(policy));
        return clone(policy);
    }
    async getPortalSessionPolicy(tenantId) {
        return clone(this.portalSessionPolicies.get(tenantId) ?? null);
    }
    async upsertSsoConfiguration(configuration) {
        this.ssoConfigurations.set(configuration.id, clone(configuration));
        return clone(configuration);
    }
    async listSsoConfigurations(tenantId) {
        return [...this.ssoConfigurations.values()]
            .filter((configuration) => configuration.tenantId === tenantId)
            .map(clone);
    }
    async createAccessPurposeRecord(record) {
        this.accessPurposeRecords.set(record.id, clone(record));
        return clone(record);
    }
    async listAccessPurposeRecords(tenantId, filters) {
        return [...this.accessPurposeRecords.values()]
            .filter((record) => record.tenantId === tenantId)
            .filter((record) => matches(record, filters))
            .map(clone);
    }
    async upsertAuditAccessPolicy(policy) {
        const key = `${policy.tenantId}:${policy.roleCode}`;
        this.auditAccessPolicies.set(key, clone(policy));
        return clone(policy);
    }
    async getAuditAccessPolicyByRole(tenantId, roleCode) {
        return clone(this.auditAccessPolicies.get(`${tenantId}:${roleCode}`) ?? null);
    }
    async createOnboardingWorkspace(workspace) {
        if ([...this.onboardingWorkspaces.values()].some((candidate) => candidate.tenantId === workspace.tenantId)) {
            throw constraintError("uq_onboarding_workspace_tenant", "Only one onboarding workspace per tenant.");
        }
        this.onboardingWorkspaces.set(workspace.id, clone(workspace));
        return clone(workspace);
    }
    async updateOnboardingWorkspace(workspace) {
        this.onboardingWorkspaces.set(workspace.id, clone(workspace));
        return clone(workspace);
    }
    async getOnboardingWorkspace(tenantId) {
        return clone([...this.onboardingWorkspaces.values()].find((workspace) => workspace.tenantId === tenantId) ?? null);
    }
    async createProvisioningInvite(invite) {
        this.provisioningInvites.set(invite.id, clone(invite));
        return clone(invite);
    }
    async listProvisioningInvites(tenantId, filters) {
        return [...this.provisioningInvites.values()]
            .filter((invite) => invite.tenantId === tenantId)
            .filter((invite) => matches(invite, filters))
            .map(clone);
    }
    async createAccessAuditEvent(event) {
        this.accessAuditEvents.set(event.id, clone(event));
        return clone(event);
    }
    async listAccessAuditEvents(tenantId, filters) {
        return [...this.accessAuditEvents.values()]
            .filter((event) => event.tenantId === tenantId)
            .filter((event) => matches(event, filters))
            .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
            .map(clone);
    }
    exportSnapshot() {
        return {
            platformUsers: [...this.platformUsers.values()].map(clone),
            userProfiles: [...this.userProfiles.values()].map(clone),
            tenantMemberships: [...this.tenantMemberships.values()].map(clone),
            userEmployeeLinks: [...this.userEmployeeLinks.values()].map(clone),
            roleAssignments: [...this.roleAssignments.values()].map(clone),
            permissionPolicySets: [...this.permissionPolicySets.values()].map(clone),
            permissionGrants: [...this.permissionGrants.values()].map(clone),
            portalSessionPolicies: [...this.portalSessionPolicies.values()].map(clone),
            ssoConfigurations: [...this.ssoConfigurations.values()].map(clone),
            accessPurposeRecords: [...this.accessPurposeRecords.values()].map(clone),
            auditAccessPolicies: [...this.auditAccessPolicies.values()].map(clone),
            onboardingWorkspaces: [...this.onboardingWorkspaces.values()].map(clone),
            provisioningInvites: [...this.provisioningInvites.values()].map(clone),
            accessAuditEvents: [...this.accessAuditEvents.values()].map(clone),
        };
    }
    loadSnapshot(snapshot) {
        this.platformUsers = new Map(snapshot.platformUsers.map((item) => [item.id, clone(item)]));
        this.userProfiles = new Map(snapshot.userProfiles.map((item) => [item.userId, clone(item)]));
        this.tenantMemberships = new Map(snapshot.tenantMemberships.map((item) => [item.id, clone(item)]));
        this.userEmployeeLinks = new Map(snapshot.userEmployeeLinks.map((item) => [item.id, clone(item)]));
        this.roleAssignments = new Map(snapshot.roleAssignments.map((item) => [item.id, clone(item)]));
        this.permissionPolicySets = new Map(snapshot.permissionPolicySets.map((item) => [item.id, clone(item)]));
        this.permissionGrants = new Map(snapshot.permissionGrants.map((item) => [item.id, clone(item)]));
        this.portalSessionPolicies = new Map(snapshot.portalSessionPolicies.map((item) => [item.tenantId, clone(item)]));
        this.ssoConfigurations = new Map(snapshot.ssoConfigurations.map((item) => [item.id, clone(item)]));
        this.accessPurposeRecords = new Map(snapshot.accessPurposeRecords.map((item) => [item.id, clone(item)]));
        this.auditAccessPolicies = new Map(snapshot.auditAccessPolicies.map((item) => [`${item.tenantId}:${item.roleCode}`, clone(item)]));
        this.onboardingWorkspaces = new Map(snapshot.onboardingWorkspaces.map((item) => [item.id, clone(item)]));
        this.provisioningInvites = new Map(snapshot.provisioningInvites.map((item) => [item.id, clone(item)]));
        this.accessAuditEvents = new Map(snapshot.accessAuditEvents.map((item) => [item.id, clone(item)]));
    }
}
//# sourceMappingURL=in-memory-repository.js.map
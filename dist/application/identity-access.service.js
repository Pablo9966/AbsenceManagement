import { calculateEffectivePermissionAllowed, calculateOnboardingReadyForGoLive, calculateResolvedLocale, } from "../domain/formulas.js";
import { hasBlockingIssues, validateAccessPurposeRecord, validateOnboardingWorkspace, validateOnboardingWorkspacePatch, validatePermissionGrant, validatePermissionPolicySet, validatePlatformUser, validatePlatformUserPatch, validatePortalSessionPolicy, validateProvisioningInvite, validateRoleAssignment, validateSsoConfiguration, validateTenantMembership, validateTenantMembershipPatch, validateUserEmployeeLink, validateUserProfile, } from "../domain/validations.js";
const generateId = () => crypto.randomUUID();
const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000000";
const withOptional = (target, key, value) => value === undefined ? target : { ...target, [key]: value };
const isRepositoryConstraintError = (error) => typeof error === "object" &&
    error !== null &&
    "constraint" in error &&
    typeof error.constraint === "string";
const mapRepositoryErrorToIssue = (error) => {
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
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async appendAccessAuditEvent(repository, event) {
        return repository.createAccessAuditEvent({
            id: generateId(),
            ...event,
        });
    }
    async createPlatformUser(user, profile, actor) {
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
                    const event = withOptional(withOptional({
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
                    }, "actorId", actor.actorId), "correlationId", actor.correlationId);
                    await this.appendAccessAuditEvent(transaction, event);
                }
                return { data: createdUser, issues };
            });
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async updatePlatformUser(params, actor) {
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
            const event = withOptional(withOptional({
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
            }, "actorId", actor.actorId), "correlationId", actor.correlationId);
            await this.appendAccessAuditEvent(transaction, event);
            return { data: updated, issues };
        });
    }
    async createTenantMembership(membership, actor) {
        const issues = validateTenantMembership(membership);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const created = await transaction.createTenantMembership(membership);
                const event = withOptional(withOptional({
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
                }, "actorId", actor.actorId), "correlationId", actor.correlationId);
                await this.appendAccessAuditEvent(transaction, event);
                return { data: created, issues };
            });
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async updateTenantMembership(params, actor) {
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
            const event = withOptional(withOptional({
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
            }, "actorId", actor.actorId), "correlationId", actor.correlationId);
            await this.appendAccessAuditEvent(transaction, event);
            return { data: updated, issues };
        });
    }
    async createUserEmployeeLink(link, actor) {
        const issues = validateUserEmployeeLink(link);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const created = await transaction.createUserEmployeeLink(link);
                const event = withOptional(withOptional({
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
                }, "actorId", actor.actorId), "correlationId", actor.correlationId);
                await this.appendAccessAuditEvent(transaction, event);
                return { data: created, issues };
            });
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async createRoleAssignment(roleAssignment, actor) {
        const issues = validateRoleAssignment(roleAssignment);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        return this.repository.withTransaction(async (transaction) => {
            const created = await transaction.createRoleAssignment(roleAssignment);
            const event = withOptional(withOptional(withOptional({
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
            }, "actorId", actor.actorId), "correlationId", actor.correlationId), "userId", created.userId);
            await this.appendAccessAuditEvent(transaction, event);
            return { data: created, issues };
        });
    }
    async createPermissionPolicySet(policySet, actor) {
        const issues = validatePermissionPolicySet(policySet);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const created = await transaction.createPermissionPolicySet(policySet);
                const event = withOptional(withOptional({
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
                }, "actorId", actor.actorId), "correlationId", actor.correlationId);
                await this.appendAccessAuditEvent(transaction, event);
                return { data: created, issues };
            });
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async createPermissionGrant(permissionGrant, actor) {
        const issues = validatePermissionGrant(permissionGrant);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        return this.repository.withTransaction(async (transaction) => {
            const created = await transaction.createPermissionGrant(permissionGrant);
            const event = withOptional(withOptional({
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
            }, "actorId", actor.actorId), "correlationId", actor.correlationId);
            await this.appendAccessAuditEvent(transaction, event);
            return { data: created, issues };
        });
    }
    async upsertPortalSessionPolicy(policy) {
        const issues = validatePortalSessionPolicy(policy);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        const data = await this.repository.upsertPortalSessionPolicy(policy);
        return { data, issues };
    }
    async upsertSsoConfiguration(configuration) {
        const issues = validateSsoConfiguration(configuration);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        const data = await this.repository.upsertSsoConfiguration(configuration);
        return { data, issues };
    }
    async createAccessPurposeRecord(record) {
        const issues = validateAccessPurposeRecord(record);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        const data = await this.repository.createAccessPurposeRecord(record);
        return { data, issues };
    }
    async upsertAuditAccessPolicy(policy) {
        const data = await this.repository.upsertAuditAccessPolicy(policy);
        return { data, issues: [] };
    }
    async createOnboardingWorkspace(workspace) {
        const issues = validateOnboardingWorkspace(workspace);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            const data = await this.repository.createOnboardingWorkspace(workspace);
            return { data, issues };
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async updateOnboardingWorkspace(params) {
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
    async createProvisioningInvite(invite) {
        const issues = validateProvisioningInvite(invite);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        const data = await this.repository.createProvisioningInvite(invite);
        return { data, issues };
    }
    async listTenantMemberships(tenantId) {
        return this.repository.listTenantMemberships(tenantId);
    }
    async listProvisioningInvites(tenantId, filters) {
        return this.repository.listProvisioningInvites(tenantId, filters);
    }
    async listAccessPurposeRecords(tenantId, filters) {
        return this.repository.listAccessPurposeRecords(tenantId, filters);
    }
    async listAccessAuditEvents(tenantId, filters) {
        return this.repository.listAccessAuditEvents(tenantId, filters);
    }
    async getOnboardingWorkspace(tenantId) {
        return this.repository.getOnboardingWorkspace(tenantId);
    }
    async getAuditAccessPoliciesForUser(tenantId, userId) {
        const roleAssignments = await this.repository.listRoleAssignmentsByUser(tenantId, userId);
        const activeRoleCodes = [...new Set(roleAssignments
                .filter((assignment) => !assignment.revokedAt)
                .map((assignment) => assignment.roleCode))];
        const policies = await Promise.all(activeRoleCodes.map((roleCode) => this.repository.getAuditAccessPolicyByRole(tenantId, roleCode)));
        return policies.filter((policy) => policy !== null);
    }
    async getEffectivePermissions(params) {
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
    async getEffectivePermissionSnapshots(params) {
        return Promise.all(params.permissions.map(async (permission) => {
            const decision = await this.getEffectivePermissions({
                tenantId: params.tenantId,
                userId: params.userId,
                resourceType: permission.resourceType,
                action: permission.action,
                effectiveAt: params.effectiveAt,
            });
            return {
                ...permission,
                allowed: decision.allowed.value,
                decision,
            };
        }));
    }
    async getResolvedLocale(params) {
        const user = await this.repository.getPlatformUserById(params.userId);
        const localeInput = withOptional(withOptional(withOptional({ effectiveAt: params.effectiveAt }, "routeLocale", params.routeLocale), "userPreferredLanguage", user?.preferredLanguage), "tenantDefaultLanguage", params.tenantDefaultLanguage);
        return calculateResolvedLocale(localeInput);
    }
    async getOnboardingReadiness(tenantId) {
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
    async getPortalBootstrap(params) {
        const [user, profile, memberships, roleAssignments, locale, onboardingReadiness, effectivePermissions, auditAccessPolicies] = await Promise.all([
            this.repository.getPlatformUserById(params.userId),
            this.repository.getUserProfileByUserId(params.userId),
            this.repository.listTenantMemberships(params.tenantId),
            this.repository.listRoleAssignmentsByUser(params.tenantId, params.userId),
            this.getResolvedLocale({
                userId: params.userId,
                routeLocale: params.routeLocale,
                tenantDefaultLanguage: params.tenantDefaultLanguage,
                effectiveAt: params.effectiveAt,
            }),
            this.getOnboardingReadiness(params.tenantId),
            this.getEffectivePermissionSnapshots({
                tenantId: params.tenantId,
                userId: params.userId,
                permissions: params.permissions,
                effectiveAt: params.effectiveAt,
            }),
            this.getAuditAccessPoliciesForUser(params.tenantId, params.userId),
        ]);
        if (!user) {
            throw new Error(`Platform user ${params.userId} was not found.`);
        }
        return {
            user,
            profile,
            membership: memberships.find((membership) => membership.userId === params.userId &&
                membership.membershipStatus === "active" &&
                membership.leftAt === undefined) ?? null,
            locale,
            roleAssignments,
            effectivePermissions,
            auditAccessPolicies,
            onboardingReadiness,
        };
    }
}
//# sourceMappingURL=identity-access.service.js.map
import { getDemoIdentityAccessContext } from "./demo-context.js";
export const verifyDemoIdentityAccessContext = async () => {
    const context = await getDemoIdentityAccessContext();
    const employerBootstrap = await context.service.getPortalBootstrap({
        tenantId: context.tenants.employer.tenantId,
        userId: context.users.employerAdmin.userId,
        tenantDefaultLanguage: context.tenants.employer.defaultLocale,
        permissions: [
            { resourceType: "dashboard", action: "read" },
            { resourceType: "tenant_admin", action: "manage" },
        ],
        effectiveAt: "2026-04-18T08:00:00.000Z",
    });
    if (!employerBootstrap.membership || employerBootstrap.effectivePermissions.some((permission) => !permission.allowed)) {
        throw new Error("Employer demo bootstrap did not produce an active membership with expected permissions.");
    }
    const compliancePolicies = await context.service.getAuditAccessPoliciesForUser(context.tenants.internal.tenantId, context.users.internalCompliance.userId);
    if (compliancePolicies.length === 0 || !compliancePolicies.some((policy) => policy.canViewAuditFlag)) {
        throw new Error("Internal compliance demo user is missing expected audit access.");
    }
    const invites = await context.service.listProvisioningInvites(context.tenants.employer.tenantId);
    if (invites.length < 2) {
        throw new Error("Employer demo tenant is missing seeded provisioning invites.");
    }
};
//# sourceMappingURL=verify-demo-context.js.map
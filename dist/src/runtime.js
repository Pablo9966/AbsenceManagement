import { createPortalShellModel, filterVisibleNavigation, internalNavigation, internalRouteAccessRules, loadCatalog, resolveLocale, } from "./frontend.js";
import { getDemoIdentityAccessContext } from "../../../services/identity-access-service/src/testing/demo-context.js";
const internalClaimsPermissions = [
    { resourceType: "dashboard", action: "read_internal" },
    { resourceType: "claims_intake_workspace", action: "read" },
    { resourceType: "ktg_case", action: "read_internal" },
    { resourceType: "benefit_calculation", action: "read" },
];
const internalCompliancePermissions = [
    { resourceType: "dashboard", action: "read_internal" },
    { resourceType: "audit", action: "view" },
    { resourceType: "internal_admin", action: "manage" },
];
export const getInternalPortalRuntime = async (input) => {
    const demo = await getDemoIdentityAccessContext();
    const viewer = input?.viewer ?? "claims";
    const selectedUser = viewer === "compliance"
        ? demo.users.internalCompliance.userId
        : demo.users.internalClaims.userId;
    const permissions = viewer === "compliance"
        ? internalCompliancePermissions
        : internalClaimsPermissions;
    const bootstrap = await demo.service.getPortalBootstrap({
        tenantId: demo.tenants.internal.tenantId,
        userId: selectedUser,
        routeLocale: input?.routeLocale,
        tenantDefaultLanguage: demo.tenants.internal.defaultLocale,
        permissions,
        effectiveAt: "2026-04-18T08:00:00.000Z",
    });
    const locale = resolveLocale({
        routeLocale: input?.routeLocale,
        userPreferredLanguage: bootstrap.user.preferredLanguage,
        tenantDefaultLanguage: demo.tenants.internal.defaultLocale,
    });
    const messages = loadCatalog(locale);
    const userContext = {
        userId: bootstrap.user.id,
        tenantId: demo.tenants.internal.tenantId,
        locale,
        roleCodes: bootstrap.roleAssignments
            .filter((assignment) => !assignment.revokedAt)
            .map((assignment) => assignment.roleCode),
        effectivePermissions: bootstrap.effectivePermissions.map((permission) => ({
            resourceType: permission.resourceType,
            action: permission.action,
            allowed: permission.allowed,
        })),
    };
    const tenantContext = {
        tenantId: demo.tenants.internal.tenantId,
        tenantName: demo.tenants.internal.tenantName,
        defaultLocale: locale,
        featureFlags: demo.tenants.internal.featureFlags,
    };
    const navigation = filterVisibleNavigation(internalNavigation, userContext);
    const shell = createPortalShellModel({
        locale,
        portalTitleKey: "shell.internalPortal",
        messages,
        navigation,
        tenantContext,
        userContext,
    });
    return {
        locale,
        messages,
        userContext,
        tenantContext,
        shell,
        routeRules: internalRouteAccessRules,
        bootstrap,
        demoService: demo.service,
    };
};
//# sourceMappingURL=runtime.js.map
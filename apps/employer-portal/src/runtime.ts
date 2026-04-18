import {
  createPortalShellModel,
  employerNavigation,
  employerRouteAccessRules,
  filterVisibleNavigation,
  loadCatalog,
  resolveLocale,
  type LocaleCode,
  type PortalTenantContext,
  type PortalUserContext,
} from "./frontend.js";
import { getDemoIdentityAccessContext } from "../../../services/identity-access-service/src/testing/demo-context.js";
import type {
  EffectivePermissionSnapshot,
  PermissionCheck,
  RoleAssignment,
} from "../../../services/identity-access-service/src/domain/types.js";

const employerPortalPermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read" },
  { resourceType: "absence", action: "read" },
  { resourceType: "ktg_case", action: "read" },
  { resourceType: "document", action: "read" },
  { resourceType: "payment_instruction", action: "read" },
  { resourceType: "premium", action: "read" },
  { resourceType: "task", action: "read" },
  { resourceType: "tenant_admin", action: "manage" },
];

export const getEmployerPortalRuntime = async (routeLocale?: LocaleCode) => {
  const demo = await getDemoIdentityAccessContext();
  const bootstrap = await demo.service.getPortalBootstrap({
    tenantId: demo.tenants.employer.tenantId,
    userId: demo.users.employerAdmin.userId,
    routeLocale,
    tenantDefaultLanguage: demo.tenants.employer.defaultLocale,
    permissions: employerPortalPermissions,
    effectiveAt: "2026-04-18T08:00:00.000Z",
  });
  const locale = resolveLocale({
    routeLocale,
    userPreferredLanguage: bootstrap.user.preferredLanguage,
    tenantDefaultLanguage: demo.tenants.employer.defaultLocale,
  });
  const messages = loadCatalog(locale);
  const userContext: PortalUserContext = {
    userId: bootstrap.user.id,
    tenantId: demo.tenants.employer.tenantId,
    locale,
    roleCodes: bootstrap.roleAssignments
      .filter((assignment: RoleAssignment) => !assignment.revokedAt)
      .map((assignment: RoleAssignment) => assignment.roleCode),
    effectivePermissions: bootstrap.effectivePermissions.map((permission: EffectivePermissionSnapshot) => ({
      resourceType: permission.resourceType,
      action: permission.action,
      allowed: permission.allowed,
    })),
  };
  const tenantContext: PortalTenantContext = {
    tenantId: demo.tenants.employer.tenantId,
    tenantName: demo.tenants.employer.tenantName,
    defaultLocale: locale,
    featureFlags: demo.tenants.employer.featureFlags,
  };
  const navigation = filterVisibleNavigation(employerNavigation, userContext);
  const shell = createPortalShellModel({
    locale,
    portalTitleKey: "shell.employerPortal",
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
    routeRules: employerRouteAccessRules,
    bootstrap,
    demoService: demo.service,
  };
};

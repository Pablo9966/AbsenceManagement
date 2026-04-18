import {
  createPortalShellModel,
  employeeNavigation,
  employeeRouteAccessRules,
  filterVisibleNavigation,
  loadCatalog,
  resolveLocale,
  type LocaleCode,
  type PortalTenantContext,
  type PortalUserContext,
} from "./frontend.js";
import type {
  EffectivePermissionSnapshotDto,
  PermissionCheck,
  RoleAssignmentDto,
} from "@elipslife/identity-access-client";
import { createIdentityAccessClient } from "@elipslife/identity-access-client";

const identityAccessClient = createIdentityAccessClient({
  baseUrl: process.env.IDENTITY_ACCESS_SERVICE_BASE_URL ?? "http://127.0.0.1:4010",
});

const employeePortalConfig = {
  tenantId: process.env.EMPLOYEE_PORTAL_TENANT_ID ?? "tenant-employer-demo",
  tenantName: process.env.EMPLOYEE_PORTAL_TENANT_NAME ?? "elipsLife Demo Kunde",
  defaultLocale: "de-CH" as LocaleCode,
  signInEmail: process.env.EMPLOYEE_PORTAL_SIGN_IN_EMAIL ?? "employee@demo.elipslife.ch",
  featureFlags: ["dashboard-shell"],
};

const employeePortalPermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read" },
  { resourceType: "absence", action: "read" },
];

export const getEmployeePortalRuntime = async (routeLocale?: string) => {
  const session = await identityAccessClient.signIn({
    email: employeePortalConfig.signInEmail,
    tenantId: employeePortalConfig.tenantId,
  });
  const bootstrap = await identityAccessClient.getPortalBootstrap(session.sessionToken, {
    routeLocale: routeLocale as LocaleCode | undefined,
    permissions: employeePortalPermissions,
  });
  const locale = resolveLocale({
    routeLocale: routeLocale as LocaleCode | undefined,
    userPreferredLanguage: bootstrap.user.preferredLanguage,
    tenantDefaultLanguage: employeePortalConfig.defaultLocale,
  });
  const messages = loadCatalog(locale);
  
  // Hardcode ROLE_EMPLOYEE for mock
  const roleCodes = bootstrap.roleAssignments
    .filter((assignment: RoleAssignmentDto) => !assignment.revokedAt)
    .map((assignment: RoleAssignmentDto) => assignment.roleCode);
  if (!roleCodes.includes("ROLE_EMPLOYEE")) {
    roleCodes.push("ROLE_EMPLOYEE");
  }

  const userContext: PortalUserContext = {
    userId: bootstrap.user.id,
    tenantId: employeePortalConfig.tenantId,
    locale,
    roleCodes,
    effectivePermissions: bootstrap.effectivePermissions.map((permission: EffectivePermissionSnapshotDto) => ({
      resourceType: permission.resourceType,
      action: permission.action,
      allowed: permission.allowed,
    })),
  };
  const tenantContext: PortalTenantContext = {
    tenantId: employeePortalConfig.tenantId,
    tenantName: employeePortalConfig.tenantName,
    defaultLocale: locale,
    featureFlags: employeePortalConfig.featureFlags,
  };
  const navigation = filterVisibleNavigation(employeeNavigation, userContext);
  const shell = createPortalShellModel({
    locale,
    portalTitleKey: "shell.employeePortal",
    messages,
    navigation,
    tenantContext,
    userContext,
  });
  shell.portalTitle = "Employee Portal";
  shell.appName = "elipsLife Employee";

  return {
    locale,
    messages,
    userContext,
    tenantContext,
    shell,
    routeRules: employeeRouteAccessRules,
    bootstrap,
    client: identityAccessClient,
    sessionToken: session.sessionToken,
  };
};

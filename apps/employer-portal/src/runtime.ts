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
import type {
  EffectivePermissionSnapshotDto,
  PermissionCheck,
  RoleAssignmentDto,
} from "@elipslife/identity-access-client";
import { createIdentityAccessClient } from "@elipslife/identity-access-client";

const identityAccessClient = createIdentityAccessClient({
  baseUrl: process.env.IDENTITY_ACCESS_SERVICE_BASE_URL ?? "http://127.0.0.1:4010",
});

const employerPortalConfig = {
  tenantId: process.env.EMPLOYER_PORTAL_TENANT_ID ?? "tenant-employer-demo",
  tenantName: process.env.EMPLOYER_PORTAL_TENANT_NAME ?? "elipsLife Demo Kunde",
  defaultLocale: "de-CH" as LocaleCode,
  signInEmail: process.env.EMPLOYER_PORTAL_SIGN_IN_EMAIL ?? "hr.admin@demo.elipslife.ch",
  featureFlags: ["dashboard-shell", "admin-shell", "phase-2a-api-bootstrap"],
};

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

export const getEmployerPortalRuntime = async (routeLocale?: string) => {
  const session = await identityAccessClient.signIn({
    email: employerPortalConfig.signInEmail,
    tenantId: employerPortalConfig.tenantId,
  });
  const bootstrap = await identityAccessClient.getPortalBootstrap(session.sessionToken, {
    routeLocale: routeLocale as LocaleCode | undefined,
    permissions: employerPortalPermissions,
  });
  const locale = resolveLocale({
    routeLocale: routeLocale as LocaleCode | undefined,
    userPreferredLanguage: bootstrap.user.preferredLanguage,
    tenantDefaultLanguage: employerPortalConfig.defaultLocale,
  });
  const messages = loadCatalog(locale);
  const userContext: PortalUserContext = {
    userId: bootstrap.user.id,
    tenantId: employerPortalConfig.tenantId,
    locale,
    roleCodes: bootstrap.roleAssignments
      .filter((assignment: RoleAssignmentDto) => !assignment.revokedAt)
      .map((assignment: RoleAssignmentDto) => assignment.roleCode),
    effectivePermissions: bootstrap.effectivePermissions.map((permission: EffectivePermissionSnapshotDto) => ({
      resourceType: permission.resourceType,
      action: permission.action,
      allowed: permission.allowed,
    })),
  };
  const tenantContext: PortalTenantContext = {
    tenantId: employerPortalConfig.tenantId,
    tenantName: employerPortalConfig.tenantName,
    defaultLocale: locale,
    featureFlags: employerPortalConfig.featureFlags,
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
    client: identityAccessClient,
    sessionToken: session.sessionToken,
  };
};

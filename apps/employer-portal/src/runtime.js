import {
  createPortalShellModel,
  employerNavigation,
  employerRouteAccessRules,
  filterVisibleNavigation,
  loadCatalog,
  resolveLocale,
} from "./frontend.js";
import { createIdentityAccessClient } from "../../../packages/identity-access-client/src/client.js";

const identityAccessClient = createIdentityAccessClient({
  baseUrl: process.env.IDENTITY_ACCESS_SERVICE_BASE_URL ?? "http://127.0.0.1:4010",
});

const employerPortalConfig = {
  tenantId: process.env.EMPLOYER_PORTAL_TENANT_ID ?? "tenant-employer-demo",
  tenantName: process.env.EMPLOYER_PORTAL_TENANT_NAME ?? "elipsLife Demo Kunde",
  defaultLocale: "de-CH",
  signInEmail: process.env.EMPLOYER_PORTAL_SIGN_IN_EMAIL ?? "hr.admin@demo.elipslife.ch",
  featureFlags: ["dashboard-shell", "admin-shell", "phase-2a-api-bootstrap"],
};

const employerPortalPermissions = [
  { resourceType: "dashboard", action: "read" },
  { resourceType: "absence", action: "read" },
  { resourceType: "ktg_case", action: "read" },
  { resourceType: "document", action: "read" },
  { resourceType: "payment_instruction", action: "read" },
  { resourceType: "premium", action: "read" },
  { resourceType: "task", action: "read" },
  { resourceType: "tenant_admin", action: "manage" },
];

export const getEmployerPortalRuntime = async (routeLocale) => {
  const session = await identityAccessClient.signIn({
    email: employerPortalConfig.signInEmail,
    tenantId: employerPortalConfig.tenantId,
  });
  const bootstrap = await identityAccessClient.getPortalBootstrap(session.sessionToken, {
    routeLocale,
    permissions: employerPortalPermissions,
  });
  const locale = resolveLocale({
    routeLocale,
    userPreferredLanguage: bootstrap.user.preferredLanguage,
    tenantDefaultLanguage: employerPortalConfig.defaultLocale,
  });
  const messages = loadCatalog(locale);
  const userContext = {
    userId: bootstrap.user.id,
    tenantId: employerPortalConfig.tenantId,
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

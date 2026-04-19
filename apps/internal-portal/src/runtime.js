import {
  createPortalShellModel,
  filterVisibleNavigation,
  internalNavigation,
  internalRouteAccessRules,
  loadCatalog,
  resolveLocale,
} from "./frontend.js";
import { cookies } from "next/headers";
import { createIdentityAccessClient } from "../../../packages/identity-access-client/src/client.js";
import { createPortalWorkflowClient } from "../../../packages/portal-workflow-client/src/client.js";
import {
  LOCAL_TEST_PERSONA_COOKIE,
  resolveLocalTestPersona,
} from "../../../packages/frontend-platform/src/local-testing.js";

const identityAccessClient = createIdentityAccessClient({
  baseUrl: process.env.IDENTITY_ACCESS_SERVICE_BASE_URL ?? "http://127.0.0.1:4010",
});
const portalWorkflowClient = createPortalWorkflowClient({
  baseUrl: process.env.PORTAL_WORKFLOW_SERVICE_BASE_URL ?? "http://127.0.0.1:4020",
});

const internalPortalConfig = {
  tenantId: process.env.INTERNAL_PORTAL_TENANT_ID ?? "tenant-internal-demo",
  tenantName: process.env.INTERNAL_PORTAL_TENANT_NAME ?? "elipsLife Intern",
  defaultLocale: "de-CH",
  claimsSignInEmail: process.env.INTERNAL_PORTAL_CLAIMS_EMAIL ?? "claims.handler@elipslife.ch",
  complianceSignInEmail: process.env.INTERNAL_PORTAL_COMPLIANCE_EMAIL ?? "compliance.user@elipslife.ch",
  featureFlags: ["dashboard-shell", "compliance-shell", "phase-2a-api-bootstrap"],
};

const internalClaimsPermissions = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "claims_intake_workspace", action: "read" },
  { resourceType: "ktg_case", action: "read_internal" },
  { resourceType: "uvg_case", action: "read_internal" },
  { resourceType: "uvg_case", action: "write_internal" },
  { resourceType: "benefit_calculation", action: "read" },
  { resourceType: "payment_run", action: "read_internal" },
  { resourceType: "reconciliation", action: "read_internal" },
];

const internalCompliancePermissions = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "audit", action: "view" },
  { resourceType: "internal_admin", action: "manage" },
];

export const getInternalPortalRuntime = async (input) => {
  const viewer = input?.viewer ?? "claims";
  const permissions = viewer === "compliance"
    ? internalCompliancePermissions
    : internalClaimsPermissions;
  const cookieStore = await cookies();
  const selectedPersona = resolveLocalTestPersona(cookieStore.get(LOCAL_TEST_PERSONA_COOKIE)?.value);
  if (selectedPersona && !selectedPersona.portalSessions.internal) {
    throw new Error(`${selectedPersona.label} does not support the internal portal.`);
  }
  const portalSession = selectedPersona?.portalSessions.internal;
  const session = await identityAccessClient.signIn({
    email: portalSession?.signInEmail ?? (viewer === "compliance" ? internalPortalConfig.complianceSignInEmail : internalPortalConfig.claimsSignInEmail),
    tenantId: portalSession?.tenantId ?? internalPortalConfig.tenantId,
  });
  const bootstrap = await identityAccessClient.getPortalBootstrap(session.sessionToken, {
    routeLocale: input?.routeLocale,
    permissions,
  });
  const locale = resolveLocale({
    routeLocale: input?.routeLocale,
    userPreferredLanguage: bootstrap.user.preferredLanguage,
    tenantDefaultLanguage: internalPortalConfig.defaultLocale,
  });
  const messages = loadCatalog(locale);
  const userContext = {
    userId: bootstrap.user.id,
    tenantId: portalSession?.tenantId ?? internalPortalConfig.tenantId,
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
    tenantId: portalSession?.tenantId ?? internalPortalConfig.tenantId,
    tenantName: internalPortalConfig.tenantName,
    defaultLocale: locale,
    featureFlags: internalPortalConfig.featureFlags,
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
    client: identityAccessClient,
    workflowClient: portalWorkflowClient,
    sessionToken: session.sessionToken,
  };
};

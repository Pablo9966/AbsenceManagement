import {
  createPortalShellModel,
  filterVisibleNavigation,
  internalNavigation,
  internalRouteAccessRules,
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
import { createPortalWorkflowClient } from "@elipslife/portal-workflow-client";

const identityAccessClient = createIdentityAccessClient({
  baseUrl: process.env.IDENTITY_ACCESS_SERVICE_BASE_URL ?? "http://127.0.0.1:4010",
});
const portalWorkflowClient = createPortalWorkflowClient({
  baseUrl: process.env.PORTAL_WORKFLOW_SERVICE_BASE_URL ?? "http://127.0.0.1:4020",
});

const internalPortalConfig = {
  tenantId: process.env.INTERNAL_PORTAL_TENANT_ID ?? "tenant-internal-demo",
  tenantName: process.env.INTERNAL_PORTAL_TENANT_NAME ?? "elipsLife Intern",
  defaultLocale: "de-CH" as LocaleCode,
  claimsSignInEmail: process.env.INTERNAL_PORTAL_CLAIMS_EMAIL ?? "claims.handler@elipslife.ch",
  complianceSignInEmail: process.env.INTERNAL_PORTAL_COMPLIANCE_EMAIL ?? "compliance.user@elipslife.ch",
  featureFlags: ["dashboard-shell", "compliance-shell", "phase-2a-api-bootstrap"],
};

const internalClaimsPermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "claims_intake_workspace", action: "read" },
  { resourceType: "ktg_case", action: "read_internal" },
  { resourceType: "benefit_calculation", action: "read" },
];

const internalCompliancePermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "audit", action: "view" },
  { resourceType: "internal_admin", action: "manage" },
];

export const getInternalPortalRuntime = async (input?: {
  routeLocale?: string;
  viewer?: "claims" | "compliance";
}) => {
  const viewer = input?.viewer ?? "claims";
  const permissions = viewer === "compliance"
    ? internalCompliancePermissions
    : internalClaimsPermissions;
  const session = await identityAccessClient.signIn({
    email: viewer === "compliance" ? internalPortalConfig.complianceSignInEmail : internalPortalConfig.claimsSignInEmail,
    tenantId: internalPortalConfig.tenantId,
  });
  const bootstrap = await identityAccessClient.getPortalBootstrap(session.sessionToken, {
    routeLocale: input?.routeLocale as LocaleCode | undefined,
    permissions,
  });
  const locale = resolveLocale({
    routeLocale: input?.routeLocale as LocaleCode | undefined,
    userPreferredLanguage: bootstrap.user.preferredLanguage,
    tenantDefaultLanguage: internalPortalConfig.defaultLocale,
  });
  const messages = loadCatalog(locale);
  const userContext: PortalUserContext = {
    userId: bootstrap.user.id,
    tenantId: internalPortalConfig.tenantId,
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
    tenantId: internalPortalConfig.tenantId,
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

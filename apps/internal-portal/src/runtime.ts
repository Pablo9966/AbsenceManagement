import {
  createPortalBootstrapRuntime,
  filterVisibleNavigation,
  internalNavigation,
  internalRouteAccessRules,
  type LocaleCode,
} from "./frontend.js";
import type {
  PermissionCheck,
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
  { resourceType: "payment_run", action: "read_internal" },
  { resourceType: "reconciliation", action: "read_internal" },
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
  return createPortalBootstrapRuntime({
    identityAccessClient,
    workflowClient: portalWorkflowClient,
    routeLocale: input?.routeLocale,
    config: {
      tenantId: internalPortalConfig.tenantId,
      tenantName: internalPortalConfig.tenantName,
      defaultLocale: internalPortalConfig.defaultLocale,
      signInEmail: viewer === "compliance" ? internalPortalConfig.complianceSignInEmail : internalPortalConfig.claimsSignInEmail,
      featureFlags: internalPortalConfig.featureFlags,
      portalTitleKey: "shell.internalPortal",
      navigation: internalNavigation,
      routeRules: internalRouteAccessRules,
      requestedPermissions: permissions,
    },
  });
};

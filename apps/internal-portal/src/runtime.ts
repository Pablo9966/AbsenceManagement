import {
  createPortalBootstrapRuntime,
  filterVisibleNavigation,
  internalNavigation,
  internalRouteAccessRules,
  type LocaleCode,
} from "./frontend.js";
import { cookies } from "next/headers";
import type {
  PermissionCheck,
} from "@elipslife/identity-access-client";
import { createIdentityAccessClient } from "@elipslife/identity-access-client";
import { createPortalWorkflowClient } from "@elipslife/portal-workflow-client";
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
  defaultLocale: "de-CH" as LocaleCode,
  claimsSignInEmail: process.env.INTERNAL_PORTAL_CLAIMS_EMAIL ?? "claims.handler@elipslife.ch",
  complianceSignInEmail: process.env.INTERNAL_PORTAL_COMPLIANCE_EMAIL ?? "compliance.user@elipslife.ch",
  featureFlags: ["dashboard-shell", "compliance-shell", "phase-2a-api-bootstrap"],
};

const internalClaimsPermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "claims_intake_workspace", action: "read" },
  { resourceType: "ktg_case", action: "read_internal" },
  { resourceType: "uvg_case", action: "read_internal" },
  { resourceType: "uvg_case", action: "write_internal" },
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
  const cookieStore = await cookies();
  const selectedPersona = resolveLocalTestPersona(cookieStore.get(LOCAL_TEST_PERSONA_COOKIE)?.value);
  if (selectedPersona && !selectedPersona.portalSessions.internal) {
    throw new Error(`${selectedPersona.label} does not support the internal portal.`);
  }
  const portalSession = selectedPersona?.portalSessions.internal;

  return createPortalBootstrapRuntime({
    identityAccessClient,
    workflowClient: portalWorkflowClient,
    routeLocale: input?.routeLocale,
    config: {
      tenantId: portalSession?.tenantId ?? internalPortalConfig.tenantId,
      tenantName: internalPortalConfig.tenantName,
      defaultLocale: internalPortalConfig.defaultLocale,
      signInEmail: portalSession?.signInEmail ?? (viewer === "compliance" ? internalPortalConfig.complianceSignInEmail : internalPortalConfig.claimsSignInEmail),
      featureFlags: internalPortalConfig.featureFlags,
      portalTitleKey: "shell.internalPortal",
      navigation: internalNavigation,
      routeRules: internalRouteAccessRules,
      requestedPermissions: permissions,
    },
  });
};

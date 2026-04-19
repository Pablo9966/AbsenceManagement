import {
  createPortalBootstrapRuntime,
  employerNavigation,
  employerRouteAccessRules,
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
  { resourceType: "uvg_case", action: "read" },
  { resourceType: "uvg_case", action: "write" },
  { resourceType: "document", action: "read" },
  { resourceType: "payment_instruction", action: "read" },
  { resourceType: "premium", action: "read" },
  { resourceType: "premium", action: "write" },
  { resourceType: "task", action: "read" },
  { resourceType: "tenant_admin", action: "manage" },
];

export const getEmployerPortalRuntime = async (routeLocale?: string) => {
  const cookieStore = await cookies();
  const selectedPersona = resolveLocalTestPersona(cookieStore.get(LOCAL_TEST_PERSONA_COOKIE)?.value);
  if (selectedPersona && !selectedPersona.portalSessions.employer) {
    throw new Error(`${selectedPersona.label} does not support the employer portal.`);
  }
  const portalSession = selectedPersona?.portalSessions.employer;

  return createPortalBootstrapRuntime({
    identityAccessClient,
    workflowClient: portalWorkflowClient,
    routeLocale,
    config: {
      tenantId: portalSession?.tenantId ?? employerPortalConfig.tenantId,
      tenantName: employerPortalConfig.tenantName,
      defaultLocale: employerPortalConfig.defaultLocale,
      signInEmail: portalSession?.signInEmail ?? employerPortalConfig.signInEmail,
      featureFlags: employerPortalConfig.featureFlags,
      portalTitleKey: "shell.employerPortal",
      navigation: employerNavigation,
      routeRules: employerRouteAccessRules,
      requestedPermissions: employerPortalPermissions,
    },
  });
};

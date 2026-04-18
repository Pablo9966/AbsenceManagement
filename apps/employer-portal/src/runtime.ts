import {
  createPortalBootstrapRuntime,
  employerNavigation,
  employerRouteAccessRules,
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
  return createPortalBootstrapRuntime({
    identityAccessClient,
    workflowClient: portalWorkflowClient,
    routeLocale,
    config: {
      tenantId: employerPortalConfig.tenantId,
      tenantName: employerPortalConfig.tenantName,
      defaultLocale: employerPortalConfig.defaultLocale,
      signInEmail: employerPortalConfig.signInEmail,
      featureFlags: employerPortalConfig.featureFlags,
      portalTitleKey: "shell.employerPortal",
      navigation: employerNavigation,
      routeRules: employerRouteAccessRules,
      requestedPermissions: employerPortalPermissions,
    },
  });
};

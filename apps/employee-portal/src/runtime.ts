import {
  createPortalBootstrapRuntime,
  employeeNavigation,
  employeeRouteAccessRules,
  type LocaleCode,
} from "./frontend.js";
import type {
  PermissionCheck,
  UserEmployeeLinkDto,
} from "../../../packages/identity-access-client/src/types.js";
import { createIdentityAccessClient } from "../../../packages/identity-access-client/src/client.js";
import { createPortalWorkflowClient } from "../../../packages/portal-workflow-client/src/client.js";

const identityAccessClient = createIdentityAccessClient({
  baseUrl: process.env.IDENTITY_ACCESS_SERVICE_BASE_URL ?? "http://127.0.0.1:4010",
});
const portalWorkflowClient = createPortalWorkflowClient({
  baseUrl: process.env.PORTAL_WORKFLOW_SERVICE_BASE_URL ?? "http://127.0.0.1:4020",
});

const employeePortalConfig = {
  tenantId: process.env.EMPLOYEE_PORTAL_TENANT_ID ?? "tenant-employer-demo",
  tenantName: process.env.EMPLOYEE_PORTAL_TENANT_NAME ?? "elipsLife Demo Kunde",
  defaultLocale: "de-CH" as LocaleCode,
  signInEmail: process.env.EMPLOYEE_PORTAL_SIGN_IN_EMAIL ?? "employee@demo.elipslife.ch",
  featureFlags: ["dashboard-shell", "employee-self-service"],
};

const employeePortalPermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read" },
  { resourceType: "absence", action: "read" },
  { resourceType: "absence", action: "write" },
  { resourceType: "document", action: "read" },
  { resourceType: "document", action: "write" },
];

export const getEmployeePortalRuntime = async (routeLocale?: string) => {
  const runtime = await createPortalBootstrapRuntime({
    identityAccessClient,
    workflowClient: portalWorkflowClient,
    routeLocale,
    config: {
      tenantId: employeePortalConfig.tenantId,
      tenantName: employeePortalConfig.tenantName,
      defaultLocale: employeePortalConfig.defaultLocale,
      signInEmail: employeePortalConfig.signInEmail,
      featureFlags: employeePortalConfig.featureFlags,
      portalTitleKey: "shell.employeePortal",
      navigation: employeeNavigation,
      routeRules: employeeRouteAccessRules,
      requestedPermissions: employeePortalPermissions,
    },
  });
  const employeeLink = runtime.bootstrap.employeeLink as UserEmployeeLinkDto | null;
  const hasEmployeeRole = runtime.userContext.roleCodes.includes("employee_self_service");
  if (!employeeLink || employeeLink.linkType !== "employee_self_service" || !hasEmployeeRole) {
    throw new Error("Employee portal requires an active employee self-service link.");
  }

  return {
    ...runtime,
    employeeLink,
  };
};

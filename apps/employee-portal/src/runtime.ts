import {
  createPortalBootstrapRuntime,
  employeeNavigation,
  employeeRouteAccessRules,
  type LocaleCode,
} from "./frontend.js";
import { cookies } from "next/headers";
import type {
  PermissionCheck,
  UserEmployeeLinkDto,
} from "../../../packages/identity-access-client/src/types.js";
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
  const cookieStore = await cookies();
  const selectedPersona = resolveLocalTestPersona(cookieStore.get(LOCAL_TEST_PERSONA_COOKIE)?.value);
  if (selectedPersona && !selectedPersona.portalSessions.employee) {
    throw new Error(`${selectedPersona.label} does not support the employee portal.`);
  }
  const portalSession = selectedPersona?.portalSessions.employee;

  const runtime = await createPortalBootstrapRuntime({
    identityAccessClient,
    workflowClient: portalWorkflowClient,
    routeLocale,
    config: {
      tenantId: portalSession?.tenantId ?? employeePortalConfig.tenantId,
      tenantName: employeePortalConfig.tenantName,
      defaultLocale: employeePortalConfig.defaultLocale,
      signInEmail: portalSession?.signInEmail ?? employeePortalConfig.signInEmail,
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

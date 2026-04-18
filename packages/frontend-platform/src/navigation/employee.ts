import type { NavigationItemConfig, RouteAccessRule } from "./types.js";

export const employeeNavigation: NavigationItemConfig[] = [
  {
    app: "employee",
    key: "nav.employee.dashboard",
    labelKey: "nav.dashboard",
    routePattern: "/[locale]",
  },
  {
    app: "employee",
    key: "nav.employee.report_absence",
    labelKey: "nav.reportAbsence",
    routePattern: "/[locale]/report-absence",
  },
  {
    app: "employee",
    key: "nav.employee.upload_certificate",
    labelKey: "nav.uploadCertificate",
    routePattern: "/[locale]/upload-certificate",
  },
  {
    app: "employee",
    key: "nav.employee.return_to_work",
    labelKey: "nav.returnToWork",
    routePattern: "/[locale]/return-to-work",
  },
];

export const employeeRouteAccessRules: RouteAccessRule[] = [
  {
    routePattern: "/[locale]",
    resourceType: "dashboard",
    action: "read",
    fallbackBehavior: "redirect_dashboard",
  },
  {
    routePattern: "/[locale]/report-absence",
    resourceType: "absence",
    action: "read",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/upload-certificate",
    resourceType: "document",
    action: "read",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/return-to-work",
    resourceType: "absence",
    action: "read",
    fallbackBehavior: "permission_denied",
  },
];

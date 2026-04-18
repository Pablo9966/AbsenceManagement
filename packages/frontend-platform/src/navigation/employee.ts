import type { NavigationItemConfig, RouteAccessRule } from "./types.js";

export const employeeNavigation: NavigationItemConfig[] = [
  {
    app: "employer",
    key: "nav.employee.dashboard",
    labelKey: "nav.dashboard",
    routePattern: "/[locale]/dashboard",
  },
  {
    app: "employer",
    key: "nav.employee.report_absence",
    labelKey: "nav.report_absence",
    routePattern: "/[locale]/report-absence",
  },
  {
    app: "employer",
    key: "nav.employee.upload_certificate",
    labelKey: "nav.upload_certificate",
    routePattern: "/[locale]/upload-certificate",
  },
  {
    app: "employer",
    key: "nav.employee.return_to_work",
    labelKey: "nav.return_to_work",
    routePattern: "/[locale]/return-to-work",
  }
];

export const employeeRouteAccessRules: RouteAccessRule[] = [
  {
    routePattern: "/[locale]/dashboard",
    resourceType: "employee_dashboard",
    action: "read",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/report-absence",
    resourceType: "absence_report",
    action: "create",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/upload-certificate",
    resourceType: "document",
    action: "upload",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/return-to-work",
    resourceType: "absence",
    action: "confirm_return",
    fallbackBehavior: "permission_denied",
  }
];

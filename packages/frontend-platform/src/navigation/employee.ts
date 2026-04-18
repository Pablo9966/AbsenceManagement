import type { NavigationItem, RouteAccessRule } from "./types.js";

export const employeeNavigation: NavigationItem[] = [
  {
    key: "nav.employee.dashboard",
    labelKey: "nav.dashboard",
    label: "Dashboard",
    href: "/{locale}/dashboard",
    requiredPermissions: [],
  },
  {
    key: "nav.employee.report_absence",
    labelKey: "nav.report_absence",
    label: "Report Absence",
    href: "/{locale}/report-absence",
    requiredPermissions: [],
  },
  {
    key: "nav.employee.upload_certificate",
    labelKey: "nav.upload_certificate",
    label: "Upload Certificate",
    href: "/{locale}/upload-certificate",
    requiredPermissions: [],
  },
  {
    key: "nav.employee.return_to_work",
    labelKey: "nav.return_to_work",
    label: "Return to Work",
    href: "/{locale}/return-to-work",
    requiredPermissions: [],
  }
];

export const employeeRouteAccessRules: RouteAccessRule[] = [
  {
    routePattern: "/[locale]/dashboard",
    allowRoles: ["ROLE_EMPLOYEE"],
  },
  {
    routePattern: "/[locale]/report-absence",
    allowRoles: ["ROLE_EMPLOYEE"],
  },
  {
    routePattern: "/[locale]/upload-certificate",
    allowRoles: ["ROLE_EMPLOYEE"],
  },
  {
    routePattern: "/[locale]/return-to-work",
    allowRoles: ["ROLE_EMPLOYEE"],
  }
];

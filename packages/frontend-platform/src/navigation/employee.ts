import type { NavigationItemConfig, RouteAccessRule } from "./types.js";

export const employeeNavigation: NavigationItemConfig[] = [
  {
    app: "employee",
    key: "nav.employee.dashboard",
    labelKey: "nav.dashboard",
    routePattern: "/[locale]/dashboard",
  },
  {
    app: "employee",
    key: "nav.employee.status",
    labelKey: "nav.status",
    routePattern: "/[locale]/status",
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
    routePattern: "/[locale]/documents/upload",
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
    routePattern: "/[locale]/dashboard",
    resourceType: "dashboard",
    action: "read",
    fallbackBehavior: "redirect_dashboard",
  },
  {
    routePattern: "/[locale]/status",
    resourceType: "absence",
    action: "read",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/report-absence",
    resourceType: "absence",
    action: "write",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/documents/upload",
    resourceType: "document",
    action: "write",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/documents/[documentId]",
    resourceType: "document",
    action: "read",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/absences/[episodeId]",
    resourceType: "absence",
    action: "read",
    fallbackBehavior: "permission_denied",
  },
  {
    routePattern: "/[locale]/return-to-work",
    resourceType: "absence",
    action: "write",
    fallbackBehavior: "permission_denied",
  },
];

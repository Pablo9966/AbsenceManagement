import type { NavigationItemConfig, RouteAccessRule } from "./types.js";

export const employerNavigation: NavigationItemConfig[] = [
  { app: "employer", key: "dashboard", labelKey: "nav.dashboard", routePattern: "/[locale]/dashboard" },
  { app: "employer", key: "absences", labelKey: "nav.absences", routePattern: "/[locale]/absences", requiredPermission: { resourceType: "absence", action: "read" } },
  { app: "employer", key: "cases", labelKey: "nav.cases", routePattern: "/[locale]/cases", requiredPermission: { resourceType: "ktg_case", action: "read" } },
  { app: "employer", key: "documents", labelKey: "nav.documents", routePattern: "/[locale]/documents", requiredPermission: { resourceType: "document", action: "read" } },
  { app: "employer", key: "payments", labelKey: "nav.payments", routePattern: "/[locale]/payments", requiredPermission: { resourceType: "payment_instruction", action: "read" } },
  { app: "employer", key: "premium", labelKey: "nav.premium", routePattern: "/[locale]/premium", requiredPermission: { resourceType: "premium", action: "read" } },
  { app: "employer", key: "analytics", labelKey: "nav.analytics", routePattern: "/[locale]/analytics", requiredPermission: { resourceType: "dashboard", action: "read" } },
  { app: "employer", key: "tasks", labelKey: "nav.tasks", routePattern: "/[locale]/tasks", requiredPermission: { resourceType: "task", action: "read" } },
  { app: "employer", key: "admin", labelKey: "nav.admin", routePattern: "/[locale]/admin", requiredPermission: { resourceType: "tenant_admin", action: "manage" } },
  { app: "employer", key: "admin-users", labelKey: "nav.adminUsers", routePattern: "/[locale]/admin/users", requiredPermission: { resourceType: "tenant_admin", action: "manage" } },
  { app: "employer", key: "admin-onboarding", labelKey: "nav.adminOnboarding", routePattern: "/[locale]/admin/onboarding", requiredPermission: { resourceType: "tenant_admin", action: "manage" } }
];

export const employerRouteAccessRules: RouteAccessRule[] = [
  { routePattern: "/[locale]/dashboard", resourceType: "dashboard", action: "read", fallbackBehavior: "redirect_dashboard" },
  { routePattern: "/[locale]/absences", resourceType: "absence", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/absences/[episodeId]", resourceType: "absence", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/cases", resourceType: "ktg_case", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/cases/[caseId]", resourceType: "ktg_case", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/documents", resourceType: "document", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/payments", resourceType: "payment_instruction", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/premium", resourceType: "premium", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/analytics", resourceType: "dashboard", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/tasks", resourceType: "task", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/admin", resourceType: "tenant_admin", action: "manage", fallbackBehavior: "redirect_dashboard" },
  { routePattern: "/[locale]/admin/users", resourceType: "tenant_admin", action: "manage", fallbackBehavior: "redirect_dashboard" },
  { routePattern: "/[locale]/admin/onboarding", resourceType: "tenant_admin", action: "manage", fallbackBehavior: "redirect_dashboard" }
];

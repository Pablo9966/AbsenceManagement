import type { NavigationItemConfig, RouteAccessRule } from "./types.js";

export const internalNavigation: NavigationItemConfig[] = [
  { app: "internal", key: "dashboard", labelKey: "nav.dashboard", routePattern: "/[locale]/dashboard" },
  { app: "internal", key: "intake", labelKey: "nav.intake", routePattern: "/[locale]/intake", requiredPermission: { resourceType: "claims_intake_workspace", action: "read" } },
  { app: "internal", key: "cases", labelKey: "nav.cases", routePattern: "/[locale]/ktg-cases", requiredPermission: { resourceType: "ktg_case", action: "read_internal" } },
  { app: "internal", key: "benefits", labelKey: "nav.benefits", routePattern: "/[locale]/benefits", requiredPermission: { resourceType: "benefit_calculation", action: "read" } },
  { app: "internal", key: "compliance", labelKey: "nav.compliance", routePattern: "/[locale]/compliance", requiredPermission: { resourceType: "audit", action: "view" } },
  { app: "internal", key: "admin", labelKey: "nav.admin", routePattern: "/[locale]/admin", requiredPermission: { resourceType: "internal_admin", action: "manage" } }
];

export const internalRouteAccessRules: RouteAccessRule[] = [
  { routePattern: "/[locale]/dashboard", resourceType: "dashboard", action: "read_internal", fallbackBehavior: "redirect_dashboard" },
  { routePattern: "/[locale]/intake", resourceType: "claims_intake_workspace", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/intake/[workspaceId]", resourceType: "claims_intake_workspace", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/ktg-cases", resourceType: "ktg_case", action: "read_internal", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/ktg-cases/[caseId]", resourceType: "ktg_case", action: "read_internal", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/benefits", resourceType: "benefit_calculation", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/benefits/[calculationId]", resourceType: "benefit_calculation", action: "read", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/compliance", resourceType: "audit", action: "view", fallbackBehavior: "permission_denied" },
  { routePattern: "/[locale]/admin", resourceType: "internal_admin", action: "manage", fallbackBehavior: "redirect_dashboard" }
];

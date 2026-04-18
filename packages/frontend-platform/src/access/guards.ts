import type { NavigationItemConfig, RouteAccessRule } from "../navigation/types.js";

export interface PortalUserContext {
  userId: string;
  tenantId: string;
  locale: string;
  roleCodes: string[];
  effectivePermissions: Array<{
    resourceType: string;
    action: string;
    allowed: boolean;
  }>;
}

export interface PortalTenantContext {
  tenantId: string;
  tenantName: string;
  defaultLocale: string;
  featureFlags: string[];
}

export const hasPermission = (
  userContext: PortalUserContext,
  permission?: NavigationItemConfig["requiredPermission"],
): boolean => {
  if (!permission) {
    return true;
  }

  return userContext.effectivePermissions.some(
    (candidate) =>
      candidate.resourceType === permission.resourceType &&
      candidate.action === permission.action &&
      candidate.allowed,
  );
};

export const filterVisibleNavigation = (
  navigation: NavigationItemConfig[],
  userContext: PortalUserContext,
): NavigationItemConfig[] => navigation.filter((item) => hasPermission(userContext, item.requiredPermission));

export const resolveRouteAccess = (
  rule: RouteAccessRule | undefined,
  userContext: PortalUserContext,
): "allow" | RouteAccessRule["fallbackBehavior"] => {
  if (!rule) {
    return "allow";
  }

  return hasPermission(userContext, { resourceType: rule.resourceType, action: rule.action })
    ? "allow"
    : rule.fallbackBehavior;
};


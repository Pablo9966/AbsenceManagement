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
export declare const hasPermission: (userContext: PortalUserContext, permission?: NavigationItemConfig["requiredPermission"]) => boolean;
export declare const filterVisibleNavigation: (navigation: NavigationItemConfig[], userContext: PortalUserContext) => NavigationItemConfig[];
export declare const resolveRouteAccess: (rule: RouteAccessRule | undefined, userContext: PortalUserContext) => "allow" | RouteAccessRule["fallbackBehavior"];

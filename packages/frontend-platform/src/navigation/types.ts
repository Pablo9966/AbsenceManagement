export type PortalApp = "employer" | "internal" | "employee";

export interface NavigationItemConfig {
  app: PortalApp;
  key: string;
  labelKey: string;
  routePattern: string;
  requiredPermission?: {
    resourceType: string;
    action: string;
  };
}

export interface RouteAccessRule {
  routePattern: string;
  resourceType: string;
  action: string;
  fallbackBehavior: "redirect_dashboard" | "permission_denied";
}


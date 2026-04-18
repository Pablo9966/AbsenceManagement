export interface AppFeatureFlag {
  app: "employer" | "internal";
  featureKey: string;
  enabledFlag: boolean;
}

export interface PortalAuditSurfaceConfig {
  routePattern: string;
  requiredPermission: {
    resourceType: string;
    action: string;
  };
}


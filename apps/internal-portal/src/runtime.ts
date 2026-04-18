import {
  createPortalShellModel,
  filterVisibleNavigation,
  internalNavigation,
  internalRouteAccessRules,
  loadCatalog,
  resolveLocale,
  type LocaleCode,
  type PortalTenantContext,
  type PortalUserContext,
} from "@elipslife/frontend-platform";

const mockUserContextBase: Omit<PortalUserContext, "locale"> = {
  userId: "placeholder-user",
  tenantId: "placeholder-tenant",
  roleCodes: ["claims_handler"],
  effectivePermissions: [
    { resourceType: "dashboard", action: "read_internal", allowed: true },
    { resourceType: "claims_intake_workspace", action: "read", allowed: true },
    { resourceType: "ktg_case", action: "read_internal", allowed: true },
    { resourceType: "benefit_calculation", action: "read", allowed: true },
    { resourceType: "audit", action: "view", allowed: true },
    { resourceType: "internal_admin", action: "manage", allowed: true },
  ],
};

const mockTenantContextBase: PortalTenantContext = {
  tenantId: "placeholder-tenant",
  tenantName: "elipsLife Intern",
  defaultLocale: "de-CH",
  featureFlags: ["dashboard-shell", "compliance-shell"],
};

export const getInternalPortalRuntime = (routeLocale?: LocaleCode) => {
  const locale = resolveLocale({ routeLocale, tenantDefaultLanguage: mockTenantContextBase.defaultLocale as LocaleCode });
  const messages = loadCatalog(locale);
  const userContext: PortalUserContext = { ...mockUserContextBase, locale };
  const tenantContext: PortalTenantContext = { ...mockTenantContextBase, defaultLocale: locale };
  const navigation = filterVisibleNavigation(internalNavigation, userContext);
  const shell = createPortalShellModel({
    locale,
    portalTitleKey: "shell.internalPortal",
    messages,
    navigation,
    tenantContext,
    userContext,
  });

  return {
    locale,
    messages,
    userContext,
    tenantContext,
    shell,
    routeRules: internalRouteAccessRules,
  };
};

import {
  createPortalShellModel,
  employerNavigation,
  employerRouteAccessRules,
  filterVisibleNavigation,
  loadCatalog,
  resolveLocale,
  type LocaleCode,
  type PortalTenantContext,
  type PortalUserContext,
} from "@elipslife/frontend-platform";

const mockUserContextBase: Omit<PortalUserContext, "locale"> = {
  userId: "placeholder-user",
  tenantId: "placeholder-tenant",
  roleCodes: ["hr_manager"],
  effectivePermissions: [
    { resourceType: "dashboard", action: "read", allowed: true },
    { resourceType: "absence", action: "read", allowed: true },
    { resourceType: "ktg_case", action: "read", allowed: true },
    { resourceType: "document", action: "read", allowed: true },
    { resourceType: "payment_instruction", action: "read", allowed: true },
    { resourceType: "premium", action: "read", allowed: true },
    { resourceType: "task", action: "read", allowed: true },
    { resourceType: "tenant_admin", action: "manage", allowed: true },
  ],
};

const mockTenantContextBase: PortalTenantContext = {
  tenantId: "placeholder-tenant",
  tenantName: "elipsLife Demo Kunde",
  defaultLocale: "de-CH",
  featureFlags: ["dashboard-shell", "admin-shell"],
};

export const getEmployerPortalRuntime = (routeLocale?: LocaleCode) => {
  const locale = resolveLocale({ routeLocale, tenantDefaultLanguage: mockTenantContextBase.defaultLocale as LocaleCode });
  const messages = loadCatalog(locale);
  const userContext: PortalUserContext = { ...mockUserContextBase, locale };
  const tenantContext: PortalTenantContext = { ...mockTenantContextBase, defaultLocale: locale };
  const navigation = filterVisibleNavigation(employerNavigation, userContext);
  const shell = createPortalShellModel({
    locale,
    portalTitleKey: "shell.employerPortal",
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
    routeRules: employerRouteAccessRules,
  };
};

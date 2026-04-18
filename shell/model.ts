import type { LocaleCode, MessageCatalog } from "../i18n/types.js";
import type { NavigationItemConfig } from "../navigation/types.js";
import type { PortalTenantContext, PortalUserContext } from "../access/guards.js";

export interface PortalShellModel {
  appName: string;
  portalTitle: string;
  locale: LocaleCode;
  navigation: Array<{
    key: string;
    label: string;
    href: string;
  }>;
  tenantName: string;
  featureFlags: string[];
  userId: string;
}

export const buildNavigationHref = (routePattern: string, locale: LocaleCode): string =>
  routePattern.replace("[locale]", locale);

export const createPortalShellModel = (input: {
  locale: LocaleCode;
  portalTitleKey: string;
  messages: MessageCatalog;
  navigation: NavigationItemConfig[];
  tenantContext: PortalTenantContext;
  userContext: PortalUserContext;
}): PortalShellModel => ({
  appName: input.messages["common.appName"] ?? "elipsLife Absence Management",
  portalTitle: input.messages[input.portalTitleKey] ?? input.portalTitleKey,
  locale: input.locale,
  navigation: input.navigation.map((item) => ({
    key: item.key,
    label: input.messages[item.labelKey] ?? item.labelKey,
    href: buildNavigationHref(item.routePattern, input.locale),
  })),
  tenantName: input.tenantContext.tenantName,
  featureFlags: input.tenantContext.featureFlags,
  userId: input.userContext.userId,
});

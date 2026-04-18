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
export declare const buildNavigationHref: (routePattern: string, locale: LocaleCode) => string;
export declare const createPortalShellModel: (input: {
    locale: LocaleCode;
    portalTitleKey: string;
    messages: MessageCatalog;
    navigation: NavigationItemConfig[];
    tenantContext: PortalTenantContext;
    userContext: PortalUserContext;
}) => PortalShellModel;

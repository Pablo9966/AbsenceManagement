import { type LocaleCode, type PortalTenantContext, type PortalUserContext } from "./frontend.js";
export declare const getInternalPortalRuntime: (input?: {
    routeLocale?: LocaleCode;
    viewer?: "claims" | "compliance";
}) => Promise<{
    locale: LocaleCode;
    messages: import("packages/frontend-platform/src/i18n/types.js").MessageCatalog;
    userContext: PortalUserContext;
    tenantContext: PortalTenantContext;
    shell: import("packages/frontend-platform/src/shell/model.js").PortalShellModel;
    routeRules: import("packages/frontend-platform/src/navigation/types.js").RouteAccessRule[];
    bootstrap: import("../../../services/identity-access-service/src/domain/types.js").PortalBootstrap;
    demoService: import("services/identity-access-service/src/application/identity-access.service.js").IdentityAccessService;
}>;

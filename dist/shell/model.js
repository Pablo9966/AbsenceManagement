export const buildNavigationHref = (routePattern, locale) => routePattern.replace("[locale]", locale);
export const createPortalShellModel = (input) => ({
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
//# sourceMappingURL=model.js.map
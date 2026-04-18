import { appLocaleConfig } from "./config.js";
export const resolveLocale = (input) => input.routeLocale ??
    input.userPreferredLanguage ??
    input.tenantDefaultLanguage ??
    appLocaleConfig.fallbackLocale;
export const isSupportedLocale = (locale) => appLocaleConfig.supportedLocales.includes(locale);
//# sourceMappingURL=resolve-locale.js.map
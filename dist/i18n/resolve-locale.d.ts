import type { LocaleCode } from "./types.js";
export declare const resolveLocale: (input: {
    routeLocale?: LocaleCode;
    userPreferredLanguage?: LocaleCode;
    tenantDefaultLanguage?: LocaleCode;
}) => LocaleCode;
export declare const isSupportedLocale: (locale: string) => locale is LocaleCode;

import { appLocaleConfig } from "./config.js";
import type { LocaleCode } from "./types.js";

export const resolveLocale = (input: {
  routeLocale?: LocaleCode;
  userPreferredLanguage?: LocaleCode;
  tenantDefaultLanguage?: LocaleCode;
}): LocaleCode =>
  input.routeLocale ??
  input.userPreferredLanguage ??
  input.tenantDefaultLanguage ??
  appLocaleConfig.fallbackLocale;

export const isSupportedLocale = (locale: string): locale is LocaleCode =>
  appLocaleConfig.supportedLocales.includes(locale as LocaleCode);


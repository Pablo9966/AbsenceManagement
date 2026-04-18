export type LocaleCode = "de-CH" | "en-CH" | "fr-CH" | "it-CH";

export interface AppLocaleConfig {
  supportedLocales: LocaleCode[];
  implementedLocales: LocaleCode[];
  defaultLocale: LocaleCode;
  fallbackLocale: LocaleCode;
}

export type MessageCatalog = Record<string, string>;


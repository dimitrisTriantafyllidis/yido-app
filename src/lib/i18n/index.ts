import { translations, type Locale, type TranslationKey } from "./translations";

export type { Locale, TranslationKey };
export { translations };

export function t(locale: Locale, key: TranslationKey): string {
  const entry = translations[key];
  return entry[locale] || entry.en;
}

export function getLocaleFromCookie(cookieValue: string | undefined): Locale {
  if (cookieValue === "en" || cookieValue === "el") return cookieValue;
  return "el"; // default to Greek
}

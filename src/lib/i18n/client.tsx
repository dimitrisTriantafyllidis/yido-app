"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "el",
  setLocale: () => {},
  t: (key) => translations[key].el,
});

export function I18nProvider({
  children,
  initialLocale = "el",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `yido-locale=${newLocale};path=/;max-age=${365 * 24 * 60 * 60}`;
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      const entry = translations[key];
      return entry[locale] || entry.en;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useTranslation() {
  const { t, locale } = useContext(I18nContext);
  return { t, locale };
}

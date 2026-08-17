"use client";

import { useI18n } from "@/lib/i18n/client";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "el" ? "en" : "el")}
      className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors cursor-pointer min-h-[32px]"
      title={locale === "el" ? "Switch to English" : "Αλλαγή σε Ελληνικά"}
    >
      {locale === "el" ? "EN" : "ΕΛ"}
    </button>
  );
}

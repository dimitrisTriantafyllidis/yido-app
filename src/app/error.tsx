"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold-50)] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-foreground mb-2">
          {t("error.somethingWrong")}
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {t("error.somethingWrong")}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-xl transition-all cursor-pointer min-h-[44px]"
        >
          {t("error.tryAgain")}
        </button>
      </div>
    </div>
  );
}

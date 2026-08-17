"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const consent = localStorage.getItem("yido-cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("yido-cookie-consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("yido-cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border shadow-[var(--shadow-elevated)] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          {t("cookies.message")}{" "}
          <Link
            href="/cookies"
            className="text-primary hover:text-[var(--color-primary-hover)] font-medium"
          >
            {t("cookies.learnMore")}
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            {t("cookies.decline")}
          </Button>
          <Button size="sm" onClick={accept}>
            {t("cookies.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { PackageTier } from "@/lib/types";
import { PACKAGES } from "@/lib/types";
import { getUpgradeTier } from "@/lib/package-limits";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n/client";

export function UpgradePrompt({
  eventId,
  currentTier,
  feature,
}: {
  eventId: string;
  currentTier: PackageTier;
  feature: string;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const upgradeTier = getUpgradeTier(currentTier);
  if (!upgradeTier) return null;

  const pkg = PACKAGES.find((p) => p.tier === upgradeTier);
  if (!pkg) return null;

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, packageTier: upgradeTier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to start checkout");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <Alert className="bg-gradient-to-r from-primary/5 to-[var(--color-secondary)]/5 border-primary/20">
      <Sparkles className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {t("upgrade.unlockFeature").replace("{pkg}", pkg.name).replace("{feature}", feature)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("upgrade.startingAt")} &euro;{pkg.price}/event
          </p>
        </div>
        <Button
          onClick={handleUpgrade}
          disabled={loading}
          size="sm"
        >
          {loading ? "..." : t("upgrade.button")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

"use client";

import { useState } from "react";
import type { PackageTier } from "@/lib/types";
import { PACKAGES } from "@/lib/types";
import { getUpgradeTier } from "@/lib/package-limits";
import { CreditCard, CheckCircle, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/client";

export function PaymentStatus({
  eventId,
  packageTier,
  isPaid,
}: {
  eventId: string;
  packageTier: PackageTier;
  isPaid: boolean;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const currentPkg = PACKAGES.find((p) => p.tier === packageTier);
  const upgradeTier = getUpgradeTier(packageTier);
  const upgradePkg = upgradeTier ? PACKAGES.find((p) => p.tier === upgradeTier) : null;

  async function handleCheckout(tier: PackageTier) {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, packageTier: tier }),
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
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-primary" />
          {t("payment.title")}
        </h2>

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
            {currentPkg?.name}
          </Badge>
          {isPaid ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle size={12} />
              {t("payment.paid")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700">
              {t("payment.paymentPending")}
            </Badge>
          )}
        </div>

        {!isPaid && (
          <Button
            onClick={() => handleCheckout(packageTier)}
            disabled={loading}
            className="mb-3"
          >
            <CreditCard size={15} />
            {loading ? t("common.loading") : `${t("payment.pay")} \u20AC${currentPkg?.price || 0}`}
          </Button>
        )}

        {upgradePkg && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              {t("payment.upgrade")}
            </p>
            <Button
              variant="link"
              onClick={() => handleCheckout(upgradePkg.tier)}
              disabled={loading}
              className="p-0 h-auto text-primary"
            >
              {t("payment.upgradeTo")} {upgradePkg.name} (&euro;{upgradePkg.price})
              <ArrowUpRight size={14} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

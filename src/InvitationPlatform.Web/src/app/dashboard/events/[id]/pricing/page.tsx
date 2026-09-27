"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface FeatureInfo {
  key: string;
  name: string;
  description: string | null;
  valueType: string;
  category: string;
  booleanValue: boolean | null;
  integerValue: number | null;
  stringValue: string | null;
}

interface PackageInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tier: string;
  priceAmount: number;
  priceCurrency: string;
  features: FeatureInfo[];
}

interface SubscriptionInfo {
  id: string;
  packageName: string;
  packageTier: string;
  status: string;
  paidAmount: number | null;
  activatedAt: string | null;
  expiresAt: string | null;
}

const CARD_FEATURE_KEYS = [
  "guest_photo_uploads",
  "rsvp_full",
  "background_audio",
  "max_guests",
  "premium_templates",
  "custom_slug",
] as const;

const COMPARISON_KEYS = [
  "rsvp_full",
  "background_audio",
  "video_section",
  "custom_slug",
  "gallery",
  "premium_templates",
  "seating_plan",
] as const;

const FEATURE_LABELS: Record<string, string> = {
  custom_slug: "Προσαρμοσμένο URL",
  rsvp_full: "Πλήρες RSVP",
  max_guests: "Μέγιστος αριθμός καλεσμένων",
  guest_photo_uploads: "Φωτογραφίες καλεσμένων (QR)",
  gallery: "Γκαλερί φωτογραφιών",
  max_photos: "Μέγιστος αριθμός φωτογραφιών",
  video_section: "Ενότητα βίντεο",
  background_audio: "Μουσική υπόκρουση",
  premium_templates: "Premium πρότυπα",
  seating_plan: "Κατανομή τραπεζιών",
};

function featureIncluded(f: FeatureInfo | undefined): boolean {
  if (!f) return false;
  if (f.valueType === "Boolean") return f.booleanValue === true;
  if (f.valueType === "Integer") return (f.integerValue ?? 0) > 0;
  if (f.valueType === "String") return f.stringValue !== "none";
  return false;
}

function formatBoolean(value: boolean): string {
  return value ? "Ναι" : "Όχι";
}

function formatCardFeatureValue(f: FeatureInfo | undefined, key: string, tier: string): string {
  if (!f) return "—";

  if (key === "guest_photo_uploads") {
    if (!f.booleanValue) return "Όχι";
    return tier === "Video" ? "Απεριόριστες" : "Ναι";
  }

  if (key === "max_guests") {
    if (f.integerValue === -1) return "Απεριόριστο";
    return f.integerValue?.toString() ?? "—";
  }

  if (f.valueType === "Boolean") return formatBoolean(f.booleanValue === true);
  if (f.valueType === "Integer") {
    if (f.integerValue === -1) return "Απεριόριστο";
    return f.integerValue?.toString() ?? "—";
  }

  return f.stringValue ?? "—";
}

function formatComparisonValue(
  f: FeatureInfo | undefined,
  key: string,
  tier: string
): string {
  if (key === "gallery") {
    if (tier === "Video" && featureIncluded(f)) return "Premium με Video";
    if (tier === "Digital" && featureIncluded(f)) return "Premium";
    if (tier === "Mini") return "Βασική";
    return featureIncluded(f) ? "Premium" : "Όχι";
  }

  if (!f) return "—";
  if (f.valueType === "Boolean") return formatBoolean(f.booleanValue === true);
  if (f.valueType === "Integer") {
    if (f.integerValue === -1) return "Απεριόριστο";
    return f.integerValue?.toString() ?? "—";
  }
  if (f.stringValue === "limited") return "Βασικές";
  if (f.stringValue === "full") return "Πλήρεις";
  if (f.stringValue === "none") return "Όχι";
  return f.stringValue ?? "—";
}

export default function PricingPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [pkgs, sub] = await Promise.all([
        api<PackageInfo[]>("/api/v1/packages"),
        api<SubscriptionInfo>(`/api/v1/subscriptions/event/${eventId}`).catch(() => null),
      ]);
      setPackages(pkgs.sort((a, b) => a.priceAmount - b.priceAmount));
      setSubscription(sub);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handlePurchase(packageId: string) {
    setPurchasing(packageId);
    try {
      const result = await api<{ checkoutUrl?: string; message?: string }>(
        "/api/v1/checkout/create-session",
        {
          method: "POST",
          body: JSON.stringify({ eventId, packageId }),
        }
      );
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      await fetchData();
    } catch {
      alert("Σφάλμα κατά την αγορά. Δοκιμάστε ξανά.");
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-8 px-4 py-8 pb-12 sm:px-6 md:px-12 md:py-10">
      <section className="flex flex-col gap-3">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C4993D] hover:underline"
        >
          <ArrowLeftIcon />
          Πίσω στην εκδήλωση
        </Link>
        <div>
          <h1 className="font-display text-4xl text-[#1C1516]">Επιλογή Πακέτου</h1>
          <p className="mt-1 text-[15px] text-[#6E6263]">
            Επιλέξτε το πακέτο που ταιριάζει στις ανάγκες σας.
          </p>
        </div>
      </section>

      {subscription ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#1B5E3A]/15 bg-[#E3F3EA] p-4 text-sm text-[#1B5E3A]">
          <span className="size-2 shrink-0 rounded-full bg-[#1B5E3A]" aria-hidden />
          <p>
            <span className="font-bold">Ενεργή Συνδρομή:</span> {subscription.packageName}
            {" · "}
            <span className="font-bold">Κατάσταση:</span>{" "}
            {subscription.status === "Active" ? "Ενεργή" : subscription.status}
            {subscription.expiresAt ? (
              <>
                {" · "}
                <span className="font-bold">Λήξη:</span>{" "}
                {new Date(subscription.expiresAt).toLocaleDateString("el-GR")}
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {packages.map((pkg) => {
          const isActive =
            subscription?.packageTier === pkg.tier && subscription?.status === "Active";
          const isPopular = pkg.tier === "Digital";

          return (
            <PricingCard
              key={pkg.id}
              pkg={pkg}
              isActive={isActive}
              isPopular={isPopular}
              purchasing={purchasing === pkg.id}
              disabled={!!purchasing || (!!subscription && !isActive)}
              onSelect={() => handlePurchase(pkg.id)}
            />
          );
        })}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#EDE8E3] bg-white">
        <div className="border-b border-[#EDE8E3] px-6 py-5">
          <h2 className="font-display text-xl text-[#1C1516]">Σύγκριση Χαρακτηριστικών</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="border-b border-[#EDE8E3] bg-[#F9F8F6]">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9C9293]">
                  Χαρακτηριστικό
                </th>
                {packages.map((pkg) => (
                  <th
                    key={pkg.id}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#9C9293]"
                  >
                    {pkg.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_KEYS.map((key, rowIndex) => (
                <tr
                  key={key}
                  className={`border-b border-[#EDE8E3] last:border-0 ${
                    rowIndex % 2 === 1 ? "bg-[#F9F8F6]" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-3 font-medium text-[#1C1516]">
                    {FEATURE_LABELS[key] ?? key}
                  </td>
                  {packages.map((pkg) => {
                    const f = pkg.features.find((feat) => feat.key === key);
                    return (
                      <td key={pkg.id} className="px-4 py-3 text-center text-[#6E6263]">
                        {formatComparisonValue(f, key, pkg.tier)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function PricingCard({
  pkg,
  isActive,
  isPopular,
  purchasing,
  disabled,
  onSelect,
}: {
  pkg: PackageInfo;
  isActive: boolean;
  isPopular: boolean;
  purchasing: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={`flex flex-col justify-between rounded-2xl bg-white p-7 ${
        isPopular
          ? "border-2 border-[#C4993D] shadow-[0_8px_12px_rgba(196,153,61,0.1)]"
          : "border border-[#EDE8E3]"
      }`}
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-[28px] text-[#1C1516]">{pkg.displayName}</h2>
          {isPopular ? (
            <span className="shrink-0 rounded border border-[#C4993D] bg-[#FAF3DF] px-2.5 py-1 text-[10px] font-bold uppercase text-[#A87D2C]">
              Δημοφιλές
            </span>
          ) : null}
        </div>

        <p className="text-[13px] leading-relaxed text-[#6E6263]">{pkg.description}</p>

        <div className="flex items-baseline gap-1">
          <span className="text-[40px] font-extrabold leading-none text-[#1C1516]">
            {pkg.priceAmount}€
          </span>
          <span className="text-base text-[#9C9293]">/ εκδήλωση</span>
        </div>

        <div className="h-px bg-[#EDE8E3]" />

        <ul className="space-y-2.5">
          {CARD_FEATURE_KEYS.map((key) => {
            const f = pkg.features.find((feat) => feat.key === key);
            const included = featureIncluded(f);
            const value = formatCardFeatureValue(f, key, pkg.tier);

            return (
              <li key={key} className="flex items-start gap-2 text-xs">
                {included ? (
                  <CheckIcon className="mt-0.5 shrink-0 text-[#C4993D]" />
                ) : (
                  <XIcon className="mt-0.5 shrink-0 text-[#CFC5BC]" />
                )}
                <span className="text-[#6E6263]">
                  {FEATURE_LABELS[key]}:{" "}
                  <span className="font-semibold text-[#1C1516]">{value}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-6">
        {isActive ? (
          <button
            type="button"
            disabled
            className="h-12 w-full cursor-not-allowed rounded-lg border border-[#EDE8E3] bg-[#F9F8F6] text-sm font-semibold text-[#9C9293]"
          >
            Τρέχον πακέτο
          </button>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            className={`h-12 w-full rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isPopular
                ? "bg-[#C4993D] text-white shadow-[0_4px_6px_rgba(196,153,61,0.15)] hover:bg-[#B38935]"
                : "border border-[#C4993D] bg-white text-[#C4993D] hover:bg-[#FAF3DF]"
            }`}
          >
            {purchasing ? "Αγορά..." : "Επιλογή"}
          </button>
        )}
      </div>
    </article>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" aria-hidden>
      <path
        d="M19 12H5M5 12l6-6M5 12l6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-3.5 ${className ?? ""}`} fill="none" aria-hidden>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-3.5 ${className ?? ""}`} fill="none" aria-hidden>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

const FEATURE_LABELS: Record<string, string> = {
  custom_slug: "Προσαρμοσμένο URL",
  rsvp_full: "Πλήρες RSVP (γεύμα, ερωτήσεις, +1)",
  max_guests: "Μέγιστος αριθμός καλεσμένων",
  guest_photo_uploads: "Φωτογραφίες καλεσμένων (QR)",
  gallery: "Γκαλερί φωτογραφιών",
  max_photos: "Μέγιστος αριθμός φωτογραφιών",
  video_section: "Ενότητα βίντεο",
  background_audio: "Μουσική υπόκρουση",
  qr_code: "QR Code πρόσκλησης",
  gift_list: "Λίστα δώρων",
  custom_colors: "Προσαρμοσμένα χρώματα",
  custom_fonts: "Προσαρμοσμένες γραμματοσειρές",
  premium_templates: "Premium πρότυπα",
  printable_upload: "Ανέβασμα εκτυπώσιμου",
  excel_export: "Εξαγωγή Excel",
  max_emails: "Email προσκλήσεις",
  event_duration_months: "Διάρκεια εκδήλωσης (μήνες)",
};

function formatFeatureValue(f: FeatureInfo): string {
  if (f.valueType === "Boolean") {
    return f.booleanValue ? "Ναι" : "Όχι";
  }
  if (f.valueType === "Integer") {
    if (f.integerValue === -1) return "Απεριόριστο";
    return f.integerValue?.toString() ?? "—";
  }
  if (f.valueType === "String") {
    if (f.stringValue === "none") return "Όχι";
    if (f.stringValue === "limited") return "Βασικές";
    if (f.stringValue === "full") return "Πλήρης";
    return f.stringValue ?? "—";
  }
  return "—";
}

function featureIncluded(f: FeatureInfo): boolean {
  if (f.valueType === "Boolean") return f.booleanValue === true;
  if (f.valueType === "Integer") return (f.integerValue ?? 0) > 0;
  if (f.valueType === "String") return f.stringValue !== "none";
  return false;
}

export default function PricingPage() {
  const params = useParams();
  const router = useRouter();
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
      setPackages(pkgs);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Φόρτωση πακέτων...</div>
      </div>
    );
  }

  // Gather all unique feature keys across packages for comparison table
  const allFeatureKeys: string[] = [];
  for (const pkg of packages) {
    for (const f of pkg.features) {
      if (!allFeatureKeys.includes(f.key)) allFeatureKeys.push(f.key);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="text-sm text-[#2E5A4C] hover:underline"
        >
          &larr; Πίσω στην εκδήλωση
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Επιλογή Πακέτου</h1>
      <p className="text-gray-600 mb-8">
        Επιλέξτε το πακέτο που ταιριάζει στις ανάγκες σας.
      </p>

      {subscription && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            <span className="font-semibold text-green-800">
              Ενεργή Συνδρομή: {subscription.packageName}
            </span>
          </div>
          <p className="text-sm text-green-700">
            Κατάσταση: {subscription.status === "Active" ? "Ενεργή" : subscription.status}
            {subscription.expiresAt && (
              <> &middot; Λήξη: {new Date(subscription.expiresAt).toLocaleDateString("el")}</>
            )}
          </p>
        </div>
      )}

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {packages.map((pkg) => {
          const isActive = subscription?.packageTier === pkg.tier && subscription?.status === "Active";
          const isPopular = pkg.tier === "Digital";

          return (
            <div
              key={pkg.id}
              className={`relative border rounded-xl p-6 flex flex-col ${
                isPopular
                  ? "border-[#2E5A4C] ring-2 ring-[#2E5A4C]/20"
                  : "border-gray-200"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E5A4C] text-white text-xs px-3 py-1 rounded-full font-medium">
                  Δημοφιλές
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-900 mb-1">{pkg.displayName}</h2>
              <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">{pkg.priceAmount}€</span>
                <span className="text-gray-500 text-sm ml-1">/ εκδήλωση</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {pkg.features.map((f) => (
                  <li key={f.key} className="flex items-center gap-2 text-sm">
                    <span
                      className={`text-base ${
                        featureIncluded(f) ? "text-green-600" : "text-gray-300"
                      }`}
                    >
                      {featureIncluded(f) ? "\u2713" : "\u2717"}
                    </span>
                    <span className={featureIncluded(f) ? "text-gray-700" : "text-gray-400"}>
                      {FEATURE_LABELS[f.key] ?? f.name}
                      {f.valueType === "Integer" && featureIncluded(f) && (
                        <span className="text-gray-500 ml-1">
                          ({f.integerValue === -1 ? "Απεριόριστο" : f.integerValue})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed"
                >
                  Τρέχον πακέτο
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={!!purchasing || !!subscription}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                    isPopular
                      ? "bg-[#2E5A4C] text-white hover:bg-[#234a3d]"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {purchasing === pkg.id ? "Αγορά..." : "Επιλογή"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Σύγκριση Χαρακτηριστικών</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Χαρακτηριστικό</th>
              {packages.map((pkg) => (
                <th key={pkg.id} className="text-center py-3 px-4 font-semibold text-gray-900">
                  {pkg.displayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatureKeys.map((key) => (
              <tr key={key} className="border-b border-gray-100">
                <td className="py-2.5 px-4 text-gray-700">
                  {FEATURE_LABELS[key] ?? key}
                </td>
                {packages.map((pkg) => {
                  const f = pkg.features.find((feat) => feat.key === key);
                  return (
                    <td key={pkg.id} className="text-center py-2.5 px-4">
                      {f ? (
                        <span
                          className={featureIncluded(f) ? "text-gray-900" : "text-gray-400"}
                        >
                          {formatFeatureValue(f)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

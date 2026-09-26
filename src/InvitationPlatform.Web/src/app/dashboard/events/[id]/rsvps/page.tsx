"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";
import { api } from "@/lib/api";

interface RsvpData {
  id: string;
  guestName: string | null;
  guestEmail: string | null;
  attendingCeremony: boolean | null;
  attendingReception: boolean | null;
  adultCount: number;
  childrenCount: number;
  plusOneName: string | null;
  mealPreference: string | null;
  dietaryNotes: string | null;
  notes: string | null;
  source: string;
  submittedAt: string;
}

interface RsvpStats {
  totalGuests: number;
  totalRsvps: number;
  confirmed: number;
  declined: number;
  pending: number;
  publicRsvps: number;
  totalAdults: number;
  totalChildren: number;
  mealPreferences: { preference: string; count: number }[];
}

const RSVP_STATUS = {
  attending: {
    pill: "bg-[#E3F3EA] text-[#1B5E3A]",
    label: "Θα έρθω",
  },
  declined: {
    pill: "bg-[#FDF0F0] text-[#A82020]",
    label: "Δεν θα έρθω",
  },
} as const;

function getInitials(name: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatPeopleCount(adultCount: number, childrenCount: number): string {
  const total = adultCount + childrenCount;
  if (childrenCount > 0) {
    return `${total} (${adultCount} ενήλ. + ${childrenCount} παιδ${childrenCount === 1 ? "ί" : "ιά"})`;
  }
  if (adultCount > 1) {
    return `${total} (${adultCount} ενήλικες)`;
  }
  return `${total}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSource(source: string): string {
  if (source === "Online") return "Digital";
  if (source === "Manual") return "Χειροκίνητη";
  return source;
}

function formatResponse(attending: boolean | null): { pill: string; label: string } | null {
  if (attending === true) return RSVP_STATUS.attending;
  if (attending === false) return RSVP_STATUS.declined;
  return null;
}

export default function RsvpsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [rsvps, setRsvps] = useState<RsvpData[]>([]);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("Εκδήλωση");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rsvpData, statsData, eventData] = await Promise.all([
        api<RsvpData[]>(`/api/v1/events/${eventId}/rsvps`),
        api<RsvpStats>(`/api/v1/events/${eventId}/rsvps/statistics`),
        api<{ title: string }>(`/api/v1/events/${eventId}`).catch(() => null),
      ]);
      setRsvps(rsvpData);
      setStats(statsData);
      if (eventData?.title) setEventTitle(eventData.title);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = () => {
    const headers = [
      "Όνομα",
      "Email",
      "Απάντηση",
      "Ενήλικες",
      "Παιδιά",
      "Γεύμα",
      "Σημειώσεις",
      "Πηγή",
      "Ημ/νία",
    ];
    const rows = rsvps.map((r) => [
      r.guestName ?? "",
      r.guestEmail ?? "",
      r.attendingReception === true
        ? "Θα έρθω"
        : r.attendingReception === false
          ? "Δεν θα έρθω"
          : "",
      r.adultCount,
      r.childrenCount,
      r.mealPreference ?? "",
      r.notes ?? r.dietaryNotes ?? "",
      formatSource(r.source),
      formatDate(r.submittedAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col gap-8 px-6 py-10 pb-12 md:px-12">
      <section className="flex flex-col gap-1.5">
        <nav className="flex flex-wrap items-center gap-1 text-xs">
          <Link href="/dashboard" className="text-[#6E5B5D] hover:text-[#1C1516]">
            Εκδηλώσεις
          </Link>
          <DashboardIcon name="chevron-right" className="size-3 text-[#6E5B5D]" />
          <Link
            href={`/dashboard/events/${eventId}`}
            className="text-[#6E5B5D] hover:text-[#1C1516]"
          >
            {eventTitle}
          </Link>
          <DashboardIcon name="chevron-right" className="size-3 text-[#6E5B5D]" />
          <span className="font-medium text-[#7A1C2E]">Στατιστικά RSVP</span>
        </nav>
        <h1 className="font-display text-[32px] text-[#1C1516]">Απαντήσεις RSVP</h1>
      </section>

      {stats ? (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <RsvpStatCard
            label="Επιβεβαιωμένοι"
            value={stats.confirmed}
            hint="Θα παρευρεθούν"
          />
          <RsvpStatCard label="Αρνήθηκαν" value={stats.declined} hint="Δεν θα έρθουν" />
          <RsvpStatCard
            label="Εκκρεμούν (λίστα)"
            value={stats.pending}
            hint="Δεν έχουν απαντήσει"
            valueClass="text-[#A87D2C]"
            badge="ΛΙΣΤΑ"
          />
          <RsvpStatCard
            label="Δημόσια RSVP"
            value={stats.publicRsvps}
            hint={`Σύνολο απαντήσεων: ${stats.totalRsvps}`}
          />
          <RsvpStatCard
            label="Σύνολο ατόμων"
            value={stats.totalAdults + stats.totalChildren}
            hint={`${stats.totalAdults} ενήλ. + ${stats.totalChildren} παιδ.`}
          />
        </section>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-[#EDE8E3] bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-[#1C1516]">
            Απαντήσεις RSVP ({rsvps.length})
          </h2>
          <button
            type="button"
            onClick={exportCsv}
            disabled={rsvps.length === 0}
            className="flex items-center gap-2 rounded-lg border border-[#EDE8E3] px-4 py-2 text-[13px] font-medium text-[#6E6263] transition-colors hover:text-[#1C1516] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DashboardIcon name="download" className="size-3.5" />
            Εξαγωγή CSV
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
          </div>
        ) : rsvps.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#9C9293]">Δεν υπάρχουν απαντήσεις ακόμα.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              <div className="flex gap-3 rounded-lg bg-[#F9F8F6] px-4 py-3 text-xs font-semibold text-[#7A1C2E]">
                <span className="w-[180px] shrink-0">Όνομα</span>
                <span className="w-[110px] shrink-0">Απάντηση</span>
                <span className="w-[120px] shrink-0">Άτομα</span>
                <span className="w-[120px] shrink-0">Γεύμα</span>
                <span className="min-w-0 flex-1">Σημειώσεις</span>
                <span className="w-[100px] shrink-0">Πηγή</span>
                <span className="w-[140px] shrink-0">Ημ/νία</span>
              </div>

              {rsvps.map((r) => {
                const response = formatResponse(r.attendingReception);
                const notes = r.notes || r.dietaryNotes;

                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 border-b border-[#EADFCB] px-4 py-4 last:border-0"
                  >
                    <div className="flex w-[180px] shrink-0 items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-[14px] bg-[#F9F8F6] text-xs font-semibold text-[#7A1C2E]">
                        {getInitials(r.guestName)}
                      </span>
                      <span className="truncate text-[13px] font-medium text-[#1C1516]">
                        {r.guestName || "—"}
                      </span>
                    </div>

                    <span className="w-[110px] shrink-0">
                      {response ? (
                        <span
                          className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${response.pill}`}
                        >
                          {response.label}
                        </span>
                      ) : (
                        <span className="text-[13px] text-[#9C9293]">—</span>
                      )}
                    </span>

                    <span className="w-[120px] shrink-0 text-[13px] text-[#1F1617]">
                      {formatPeopleCount(r.adultCount, r.childrenCount)}
                    </span>

                    <span className="w-[120px] shrink-0 text-[13px] text-[#6E5B5D]">
                      {r.mealPreference || "—"}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-[13px] text-[#6E5B5D]">
                      {notes || "—"}
                    </span>

                    <span className="flex w-[100px] shrink-0 items-center gap-1 text-[13px] text-[#6E5B5D]">
                      <DashboardIcon name="globe" className="size-3" />
                      {formatSource(r.source)}
                    </span>

                    <span className="w-[140px] shrink-0 text-[13px] text-[#6E5B5D]">
                      {formatDate(r.submittedAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function RsvpStatCard({
  label,
  value,
  hint,
  valueClass = "text-[#1C1516]",
  badge,
}: {
  label: string;
  value: ReactNode;
  hint: string;
  valueClass?: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#EDE8E3] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6263]">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
        {badge ? (
          <span className="rounded bg-[#FAF3DF] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#A87D2C]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="text-[11px] text-[#9C9293]">{hint}</p>
    </div>
  );
}

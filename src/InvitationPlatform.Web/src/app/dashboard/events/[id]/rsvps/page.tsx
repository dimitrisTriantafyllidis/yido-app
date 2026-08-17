"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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

export default function RsvpsPage() {
  const params = useParams();
  const { logout } = useAuth();
  const eventId = params.id as string;

  const [rsvps, setRsvps] = useState<RsvpData[]>([]);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rsvpData, statsData] = await Promise.all([
        api<RsvpData[]>(`/api/v1/events/${eventId}/rsvps`),
        api<RsvpStats>(`/api/v1/events/${eventId}/rsvps/statistics`),
      ]);
      setRsvps(rsvpData);
      setStats(statsData);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("el-GR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-display text-lg font-semibold text-text-primary"
            >
              YIDO
            </Link>
            <span className="text-text-muted">/</span>
            <Link
              href={`/dashboard/events/${eventId}`}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Εκδήλωση
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-sm text-text-primary font-medium">
              Απαντήσεις RSVP
            </span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-text-muted hover:text-text-primary cursor-pointer"
          >
            Αποσύνδεση
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="p-5 bg-surface border border-border rounded-lg">
              <p className="text-sm text-text-muted">Επιβεβαιωμένοι</p>
              <p className="mt-1 font-display text-3xl font-semibold text-success">
                {stats.confirmed}
              </p>
            </div>
            <div className="p-5 bg-surface border border-border rounded-lg">
              <p className="text-sm text-text-muted">Αρνήθηκαν</p>
              <p className="mt-1 font-display text-3xl font-semibold text-destructive">
                {stats.declined}
              </p>
            </div>
            <div className="p-5 bg-surface border border-border rounded-lg">
              <p className="text-sm text-text-muted">Εκκρεμούν (λίστα)</p>
              <p className="mt-1 font-display text-3xl font-semibold text-warning">
                {stats.pending}
              </p>
            </div>
            <div className="p-5 bg-surface border border-border rounded-lg">
              <p className="text-sm text-text-muted">Δημόσια RSVP</p>
              <p className="mt-1 font-display text-3xl font-semibold text-text-primary">
                {stats.publicRsvps}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Σύνολο απαντήσεων: {stats.totalRsvps}
              </p>
            </div>
            <div className="p-5 bg-surface border border-border rounded-lg">
              <p className="text-sm text-text-muted">
                Σύνολο ατόμων
              </p>
              <p className="mt-1 font-display text-3xl font-semibold text-accent">
                {stats.totalAdults + stats.totalChildren}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {stats.totalAdults} ενήλ. + {stats.totalChildren} παιδ.
              </p>
            </div>
          </div>
        )}

        <h1 className="font-display text-xl font-semibold text-text-primary mb-6">
          Απαντήσεις RSVP ({rsvps.length})
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : rsvps.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-xl">
            <p className="text-text-muted">
              Δεν υπάρχουν απαντήσεις ακόμα.
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Όνομα
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-text-secondary">
                    Απάντηση
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-text-secondary">
                    Άτομα
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Γεύμα
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Σημειώσεις
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Πηγή
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Ημ/νία
                  </th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-0 hover:bg-bg/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">
                        {r.guestName || "—"}
                      </p>
                      {r.guestEmail && (
                        <p className="text-xs text-text-muted">
                          {r.guestEmail}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.attendingReception ? (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-success-light text-success">
                          Ναι
                        </span>
                      ) : r.attendingReception === false ? (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-destructive-light text-destructive">
                          Όχι
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">
                      {r.adultCount}
                      {r.childrenCount > 0 && `+${r.childrenCount}`}
                      {r.plusOneName && (
                        <span className="block text-xs text-text-muted">
                          +{r.plusOneName}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {r.mealPreference || "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">
                      {r.notes || r.dietaryNotes || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted">
                        {r.source === "Online" ? "Online" : "Χειροκίνητη"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {formatDate(r.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

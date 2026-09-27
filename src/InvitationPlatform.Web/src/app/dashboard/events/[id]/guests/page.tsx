"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  isCeremonyOnly: boolean;
  isReceptionEligible: boolean;
  allowedPlusOnes: number;
  tags: string | null;
  notes: string | null;
  inviteToken: string | null;
  groupName: string | null;
  guestGroupId: string | null;
  rsvpStatus: {
    attendingReception: boolean | null;
    adultCount: number;
    childrenCount: number;
  } | null;
}

interface GuestGroupData {
  id: string;
  name: string;
  inviteToken: string;
  guestCount: number;
}

interface SubscriptionSummary {
  packageName: string;
  status: string;
}

const RSVP_STYLES = {
  pending: {
    pill: "bg-[#FFF3E0] text-[#B65F00]",
    dot: "bg-[#B65F00]",
    label: "Εκκρεμεί",
  },
  confirmed: {
    pill: "bg-[#E3F3EA] text-[#1B5E3A]",
    dot: "bg-[#1B5E3A]",
    label: "Ναι",
  },
  declined: {
    pill: "bg-[#FDF0F0] text-[#A82020]",
    dot: "bg-[#A82020]",
    label: "Όχι",
  },
} as const;

export default function GuestsPage() {
  const params = useParams();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [guests, setGuests] = useState<GuestData[]>([]);
  const [groups, setGroups] = useState<GuestGroupData[]>([]);
  const [eventSlug, setEventSlug] = useState<string | null>(null);
  const [subscriptionLabel, setSubscriptionLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const tenantName = user?.currentTenant?.name ?? "—";

  const loadGuests = useCallback(async () => {
    try {
      const [data, groupData, evt, subscriptions] = await Promise.all([
        api<GuestData[]>(`/api/v1/events/${eventId}/guests`),
        api<GuestGroupData[]>(`/api/v1/events/${eventId}/guest-groups`).catch(
          () => [] as GuestGroupData[]
        ),
        api<{ slug: string | null }>(`/api/v1/events/${eventId}`).catch(() => null),
        api<SubscriptionSummary[]>("/api/v1/subscriptions").catch(
          () => [] as SubscriptionSummary[]
        ),
      ]);
      setGuests(data);
      setGroups(groupData);
      setEventSlug(evt?.slug ?? null);
      const active = subscriptions.find((s) => s.status === "Active");
      setSubscriptionLabel(active?.packageName ?? null);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const inviteLink = (token: string) =>
    eventSlug
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/e/${eventSlug}?t=${token}`
      : "";

  const copyInvite = async (token: string) => {
    const link = inviteLink(token);
    if (!link) {
      alert("Δημοσιεύστε την πρόσκληση για να δημιουργηθεί σύνδεσμος.");
      return;
    }
    await navigator.clipboard.writeText(link);
    alert("Ο σύνδεσμος αντιγράφηκε.");
  };

  const exportExcel = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/events/${eventId}/guests/export.xlsx`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guests-${eventId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Η εξαγωγή απέτυχε (ελέγξτε το πακέτο excel_export).");
    }
  };

  const addGroup = async () => {
    if (!newGroupName.trim()) return;
    await api(`/api/v1/events/${eventId}/guest-groups`, {
      method: "POST",
      body: JSON.stringify({ name: newGroupName.trim() }),
    });
    setNewGroupName("");
    loadGuests();
  };

  const deleteGuest = async (guestId: string) => {
    if (!confirm("Διαγραφή καλεσμένου;")) return;
    await api(`/api/v1/events/${eventId}/guests/${guestId}`, {
      method: "DELETE",
    });
    loadGuests();
  };

  const confirmed = guests.filter((g) => g.rsvpStatus?.attendingReception === true);
  const declined = guests.filter((g) => g.rsvpStatus?.attendingReception === false);
  const pending = guests.filter((g) => g.rsvpStatus === null);
  const totalAdults = confirmed.reduce((s, g) => s + (g.rsvpStatus?.adultCount ?? 0), 0);
  const totalChildren = confirmed.reduce(
    (s, g) => s + (g.rsvpStatus?.childrenCount ?? 0),
    0
  );

  const packageDisplay = subscriptionLabel
    ? subscriptionLabel.toUpperCase() === "DIGITAL"
      ? "Premium"
      : subscriptionLabel.charAt(0).toUpperCase() + subscriptionLabel.slice(1).toLowerCase()
    : null;

  return (
    <main className="flex flex-col gap-8 px-4 py-8 pb-12 sm:px-6 md:px-12 md:py-10">
      <section className="flex flex-col gap-3">
        <nav className="flex items-center gap-2 text-xs">
          <Link href="/dashboard" className="font-medium text-[#9C9293] hover:text-[#1C1516]">
            YIDO
          </Link>
          <span className="text-[#9C9293]">/</span>
          <Link
            href={`/dashboard/events/${eventId}`}
            className="font-medium text-[#9C9293] hover:text-[#1C1516]"
          >
            Εκδήλωση
          </Link>
          <span className="text-[#9C9293]">/</span>
          <span className="font-semibold text-[#C4993D]">Καλεσμένοι</span>
        </nav>

        <div>
          <h1 className="text-[28px] font-bold text-[#1C1516]">Διαχείριση Καλεσμένων</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[#6E6263]">
            <span>
              Διαχειριστής:{" "}
              <span className="font-semibold text-[#1C1516]">{tenantName}</span>
            </span>
            {packageDisplay ? (
              <>
                <span className="size-1 rounded-full bg-[#9C9293]" aria-hidden />
                <span className="text-[#9C9293]">{packageDisplay} Συνδρομή</span>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <GuestStatCard label="ΣΥΝΟΛΟ" value={guests.length} />
        <GuestStatCard
          label="ΕΠΙΒΕΒΑΙΩΜΕΝΟΙ"
          value={confirmed.length}
          dotColor="bg-[#1B5E3A]"
          valueClass="text-[#1B5E3A]"
        />
        <GuestStatCard
          label="ΑΡΝΗΘΗΚΑΝ"
          value={declined.length}
          dotColor="bg-[#A82020]"
          valueClass="text-[#A82020]"
        />
        <GuestStatCard
          label="ΕΚΚΡΕΜΟΥΝ"
          value={pending.length}
          dotColor="bg-[#B65F00]"
          valueClass="text-[#B65F00]"
        />
        <GuestStatCard
          label="ΑΤΟΜΑ (ΕΝΗΛ. + ΠΑΙΔ.)"
          value={
            <>
              {totalAdults}{" "}
              <span className="text-base font-normal text-[#9C9293]">+ {totalChildren}</span>
            </>
          }
        />
      </section>

      <section className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <aside className="w-full shrink-0 xl:w-[320px]">
          <div className="rounded-2xl border border-[#EDE8E3] bg-white p-6">
            <h2 className="text-base font-semibold text-[#1C1516]">Ομάδες</h2>

            <div className="mt-5 space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="group-name" className="block text-xs font-medium text-[#6E6263]">
                  Όνομα ομάδας
                </label>
                <input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGroup();
                    }
                  }}
                  placeholder="Νέα ομάδα..."
                  className="h-10 w-full rounded-md border border-[#EDE8E3] bg-[#F9F8F6] px-3 text-[13px] text-[#1C1516] placeholder:text-[#9C9293] outline-none focus:border-[#C4993D] focus:ring-1 focus:ring-[#C4993D]"
                />
              </div>
              <button
                type="button"
                onClick={addGroup}
                className="h-10 w-full rounded-md bg-[#C4993D] text-[13px] font-semibold text-white transition-colors hover:bg-[#B38935]"
              >
                Προσθήκη
              </button>
            </div>

            <div className="my-5 h-px bg-[#EDE8E3]" />

            {groups.length === 0 ? (
              <p className="text-[13px] text-[#9C9293]">Δεν υπάρχουν ομάδες ακόμα.</p>
            ) : (
              <ul className="space-y-1">
                {groups.map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center justify-between py-2 text-[13px]"
                  >
                    <span className="text-[#6E6263]">{g.name}</span>
                    <span className="text-xs text-[#9C9293]">
                      {g.guestCount} καλεσμέν{g.guestCount === 1 ? "ος" : "οι"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#EDE8E3] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE8E3] p-5">
            <h2 className="text-base font-semibold text-[#1C1516]">Καλεσμένοι</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={exportExcel}
                className="rounded-md border border-[#EDE8E3] px-3.5 py-2 text-[13px] font-semibold text-[#6E6263] transition-colors hover:text-[#1C1516]"
              >
                Εξαγωγή Excel
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="rounded-md bg-[#C4993D] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#B38935]"
              >
                + Προσθήκη
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
            </div>
          ) : guests.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="mb-4 text-[#9C9293]">Δεν υπάρχουν καλεσμένοι ακόμα.</p>
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="rounded-md bg-[#C4993D] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#B38935]"
              >
                + Προσθήκη πρώτου καλεσμένου
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="flex gap-3 border-b border-[#EDE8E3] bg-[#F9F8F6] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#9C9293]">
                  <span className="min-w-[140px] flex-1">Όνομα</span>
                  <span className="w-[160px] shrink-0">Email</span>
                  <span className="w-[110px] shrink-0">Τηλέφωνο</span>
                  <span className="w-[100px] shrink-0">Ομάδα</span>
                  <span className="w-[100px] shrink-0">RSVP</span>
                  <span className="w-[70px] shrink-0">Άτομα</span>
                  <span className="w-[90px] shrink-0">Πρόσκληση</span>
                  <span className="w-[100px] shrink-0 text-right">Ενέργειες</span>
                </div>

                {guests.map((g) => {
                  const rsvp =
                    g.rsvpStatus === null
                      ? RSVP_STYLES.pending
                      : g.rsvpStatus.attendingReception
                        ? RSVP_STYLES.confirmed
                        : RSVP_STYLES.declined;

                  return (
                    <div
                      key={g.id}
                      className="flex items-center gap-3 border-b border-[#EDE8E3] px-5 py-4 last:border-0"
                    >
                      <span className="min-w-[140px] flex-1 truncate text-sm font-semibold text-[#1C1516]">
                        {g.firstName} {g.lastName}
                      </span>
                      <span className="w-[160px] shrink-0 truncate text-[13px] text-[#6E6263]">
                        {g.email ?? "—"}
                      </span>
                      <span className="w-[110px] shrink-0 text-[13px] text-[#6E6263]">
                        {g.phone ?? "—"}
                      </span>
                      <span className="w-[100px] shrink-0 truncate text-[13px] text-[#9C9293]">
                        {g.groupName ?? "—"}
                      </span>
                      <span className="w-[100px] shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${rsvp.pill}`}
                        >
                          <span className={`size-1.5 rounded-full ${rsvp.dot}`} />
                          {rsvp.label}
                        </span>
                      </span>
                      <span className="w-[70px] shrink-0 text-[13px] text-[#9C9293]">
                        {g.rsvpStatus
                          ? `${g.rsvpStatus.adultCount} + ${g.rsvpStatus.childrenCount}`
                          : "—"}
                      </span>
                      <span className="w-[90px] shrink-0">
                        {g.inviteToken ? (
                          <button
                            type="button"
                            onClick={() => copyInvite(g.inviteToken!)}
                            className="rounded-md border border-[#EDE8E3] px-2 py-1 text-[11px] font-semibold text-[#6E6263] hover:text-[#1C1516]"
                          >
                            Αντιγραφή
                          </button>
                        ) : (
                          <span className="text-[13px] text-[#9C9293]">—</span>
                        )}
                      </span>
                      <span className="flex w-[100px] shrink-0 items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingGuest(g)}
                          className="flex size-[26px] items-center justify-center rounded-md border border-[#EDE8E3] text-[#6E6263] hover:text-[#1C1516]"
                          aria-label="Επεξεργασία"
                        >
                          <DashboardIcon name="edit" className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGuest(g.id)}
                          className="flex size-[26px] items-center justify-center rounded-md bg-[#FDF0F0] text-[#A82020] hover:bg-[#FBE4E4]"
                          aria-label="Διαγραφή"
                        >
                          <DashboardIcon name="trash" className="size-3.5" />
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {showAdd ? (
        <GuestFormModal
          eventId={eventId}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            loadGuests();
          }}
        />
      ) : null}
      {editingGuest ? (
        <GuestFormModal
          eventId={eventId}
          guest={editingGuest}
          onClose={() => setEditingGuest(null)}
          onSaved={() => {
            setEditingGuest(null);
            loadGuests();
          }}
        />
      ) : null}
    </main>
  );
}

function GuestStatCard({
  label,
  value,
  dotColor,
  valueClass = "text-[#1C1516]",
}: {
  label: string;
  value: ReactNode;
  dotColor?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-[#EDE8E3] bg-white p-4">
      <div className="flex items-center gap-1.5">
        {dotColor ? <span className={`size-1.5 rounded-full ${dotColor}`} aria-hidden /> : null}
        <p className="text-xs font-medium uppercase tracking-wide text-[#6E6263]">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function GuestFormModal({
  eventId,
  guest,
  onClose,
  onSaved,
}: {
  eventId: string;
  guest?: GuestData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    firstName: guest?.firstName ?? "",
    lastName: guest?.lastName ?? "",
    email: guest?.email ?? "",
    phone: guest?.phone ?? "",
    isCeremonyOnly: guest?.isCeremonyOnly ?? false,
    isReceptionEligible: guest?.isReceptionEligible ?? true,
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || null,
        phone: form.phone || null,
        isCeremonyOnly: form.isCeremonyOnly,
        isReceptionEligible: form.isReceptionEligible,
      };
      if (guest) {
        await api(`/api/v1/events/${eventId}/guests/${guest.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await api(`/api/v1/events/${eventId}/guests`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border border-[#EDE8E3] bg-[#F9F8F6] px-3.5 text-sm text-[#1C1516] outline-none focus:border-[#C4993D] focus:ring-1 focus:ring-[#C4993D]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#EDE8E3] bg-white p-8 shadow-[0_8px_24px_rgba(28,21,22,0.08)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-[#1C1516]">
            {guest ? "Επεξεργασία καλεσμένου" : "Νέος καλεσμένος"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg text-[#9C9293] hover:text-[#1C1516]"
            aria-label="Κλείσιμο"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1516]">Όνομα</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1C1516]">Επώνυμο</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1C1516]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1C1516]">Τηλέφωνο</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#6E6263]">
            <input
              type="checkbox"
              checked={form.isCeremonyOnly}
              onChange={(e) => update("isCeremonyOnly", e.target.checked)}
              className="size-[18px] rounded border-[#EDE8E3] accent-[#C4993D]"
            />
            Μόνο τελετή
          </label>
          <label className="flex items-center gap-2 text-sm text-[#6E6263]">
            <input
              type="checkbox"
              checked={form.isReceptionEligible}
              onChange={(e) => update("isReceptionEligible", e.target.checked)}
              className="size-[18px] rounded border-[#EDE8E3] accent-[#C4993D]"
            />
            Δεξίωση
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#EDE8E3] px-4 py-2.5 text-sm font-medium text-[#1C1516] hover:bg-[#F9F8F6]"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#C4993D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B38935] disabled:opacity-50"
            >
              {submitting ? "Αποθήκευση..." : guest ? "Αποθήκευση" : "Προσθήκη"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

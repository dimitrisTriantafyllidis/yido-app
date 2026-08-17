"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function GuestsPage() {
  const params = useParams();
  const { logout } = useAuth();
  const eventId = params.id as string;

  const [guests, setGuests] = useState<GuestData[]>([]);
  const [groups, setGroups] = useState<GuestGroupData[]>([]);
  const [eventSlug, setEventSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const loadGuests = useCallback(async () => {
    try {
      const [data, groupData, evt] = await Promise.all([
        api<GuestData[]>(`/api/v1/events/${eventId}/guests`),
        api<GuestGroupData[]>(`/api/v1/events/${eventId}/guest-groups`).catch(
          () => [] as GuestGroupData[]
        ),
        api<{ slug: string | null }>(`/api/v1/events/${eventId}`).catch(() => null),
      ]);
      setGuests(data);
      setGroups(groupData);
      setEventSlug(evt?.slug ?? null);
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

  const confirmed = guests.filter(
    (g) => g.rsvpStatus?.attendingReception === true
  );
  const declined = guests.filter(
    (g) => g.rsvpStatus?.attendingReception === false
  );
  const pending = guests.filter((g) => g.rsvpStatus === null);
  const totalAdults = confirmed.reduce(
    (s, g) => s + (g.rsvpStatus?.adultCount ?? 0),
    0
  );
  const totalChildren = confirmed.reduce(
    (s, g) => s + (g.rsvpStatus?.childrenCount ?? 0),
    0
  );

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
              Καλεσμένοι
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Σύνολο", value: guests.length, color: "text-text-primary" },
            { label: "Επιβεβαιωμένοι", value: confirmed.length, color: "text-success" },
            { label: "Αρνήθηκαν", value: declined.length, color: "text-destructive" },
            { label: "Εκκρεμούν", value: pending.length, color: "text-warning" },
            {
              label: "Άτομα (ενήλ. + παιδ.)",
              value: `${totalAdults} + ${totalChildren}`,
              color: "text-accent",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 bg-surface border border-border rounded-lg"
            >
              <p className="text-xs text-text-muted">{stat.label}</p>
              <p
                className={`mt-1 font-display text-2xl font-semibold ${stat.color}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h1 className="font-display text-xl font-semibold text-text-primary">
            Καλεσμένοι
          </h1>
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg transition-colors cursor-pointer"
            >
              Εξαγωγή Excel
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
            >
              + Προσθήκη
            </button>
          </div>
        </div>

        <div className="mb-8 p-4 bg-surface border border-border rounded-xl">
          <h2 className="text-sm font-medium text-text-primary mb-3">Ομάδες</h2>
          <div className="flex gap-2 mb-3">
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Νέα ομάδα"
              className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
            <button
              onClick={addGroup}
              className="px-3 py-2 text-sm bg-accent text-white rounded-lg cursor-pointer"
            >
              Προσθήκη
            </button>
          </div>
          {groups.length > 0 && (
            <ul className="space-y-1 text-sm text-text-secondary">
              {groups.map((g) => (
                <li key={g.id} className="flex justify-between gap-2">
                  <span>
                    {g.name} ({g.guestCount})
                  </span>
                  <button
                    type="button"
                    onClick={() => copyInvite(g.inviteToken)}
                    className="text-accent text-xs cursor-pointer"
                  >
                    Αντιγραφή συνδέσμου
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : guests.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-xl">
            <p className="text-text-muted mb-4">
              Δεν υπάρχουν καλεσμένοι ακόμα.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
            >
              + Προσθήκη πρώτου καλεσμένου
            </button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Όνομα
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Τηλέφωνο
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Ομάδα
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-text-secondary">
                    RSVP
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-text-secondary">
                    Άτομα
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-text-secondary">
                    Πρόσκληση
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary" />
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-border last:border-0 hover:bg-bg/50"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {g.firstName} {g.lastName}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {g.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {g.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {g.groupName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {g.rsvpStatus === null ? (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-warning-light text-warning">
                          Εκκρεμεί
                        </span>
                      ) : g.rsvpStatus.attendingReception ? (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-success-light text-success">
                          Ναι
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-destructive-light text-destructive">
                          Όχι
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">
                      {g.rsvpStatus
                        ? `${g.rsvpStatus.adultCount}+${g.rsvpStatus.childrenCount}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {g.inviteToken ? (
                        <button
                          type="button"
                          onClick={() => copyInvite(g.inviteToken!)}
                          className="text-xs text-accent cursor-pointer"
                        >
                          Αντιγραφή
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => setEditingGuest(g)}
                        className="text-xs text-accent hover:text-accent-hover cursor-pointer"
                      >
                        Επεξεργασία
                      </button>
                      <button
                        onClick={() => deleteGuest(g.id)}
                        className="text-xs text-destructive hover:text-destructive/80 cursor-pointer"
                      >
                        Διαγραφή
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showAdd && (
          <GuestFormModal
            eventId={eventId}
            onClose={() => setShowAdd(false)}
            onSaved={() => {
              setShowAdd(false);
              loadGuests();
            }}
          />
        )}
        {editingGuest && (
          <GuestFormModal
            eventId={eventId}
            guest={editingGuest}
            onClose={() => setEditingGuest(null)}
            onSaved={() => {
              setEditingGuest(null);
              loadGuests();
            }}
          />
        )}
      </main>
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
    "w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            {guest ? "Επεξεργασία καλεσμένου" : "Νέος καλεσμένος"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Όνομα
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Επώνυμο
              </label>
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
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Τηλέφωνο
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.isCeremonyOnly}
              onChange={(e) => update("isCeremonyOnly", e.target.checked)}
            />
            Μόνο τελετή
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.isReceptionEligible}
              onChange={(e) => update("isReceptionEligible", e.target.checked)}
            />
            Δεξίωση
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-bg transition-colors cursor-pointer"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? "Αποθήκευση..." : guest ? "Αποθήκευση" : "Προσθήκη"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

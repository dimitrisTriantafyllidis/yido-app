"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface EventSummary {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  slug: string | null;
  locale: string;
  description: string | null;
  publishedAt: string | null;
  createdAt: string;
  venueCount: number;
  personCount: number;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  Wedding: "Γάμος",
  Baptism: "Βάπτιση",
  Birthday: "Γενέθλια",
  Engagement: "Αρραβώνας",
  Anniversary: "Επέτειος",
  Corporate: "Εταιρική",
  Other: "Άλλο",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  Draft: {
    label: "Πρόχειρη",
    className: "bg-warning-light text-warning",
  },
  Published: {
    label: "Δημοσιευμένη",
    className: "bg-success-light text-success",
  },
  Archived: {
    label: "Αρχειοθετημένη",
    className: "bg-bg text-text-muted",
  },
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const data = await api<EventSummary[]>("/api/v1/events");
      setEvents(data);
    } catch {
      // handled silently - empty list shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("el-GR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-semibold text-text-primary"
          >
            YIDO
          </Link>
          <div className="flex items-center gap-4">
            {user?.isSystemAdmin && (
              <Link
                href="/admin"
                className="text-xs px-2.5 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Admin
              </Link>
            )}
            <span className="text-sm text-text-secondary">
              {user?.firstName}
            </span>
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-sm font-medium">
              {user?.firstName?.charAt(0)}
            </div>
            <button
              onClick={logout}
              className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Αποσύνδεση
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary">
              Οι εκδηλώσεις μου
            </h1>
            {user?.currentTenant && (
              <p className="mt-1 text-sm text-text-secondary">
                {user.currentTenant.name}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
          >
            + Νέα εκδήλωση
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="font-display text-xl font-semibold text-text-primary mb-2">
              Καλωσήρθατε στο YIDO!
            </h2>
            <p className="text-text-secondary mb-6">
              Δημιουργήστε την πρώτη σας ψηφιακή πρόσκληση
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
            >
              + Νέα εκδήλωση
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => {
              const status = STATUS_LABELS[evt.status] ?? {
                label: evt.status,
                className: "bg-bg text-text-muted",
              };
              return (
                <Link
                  key={evt.id}
                  href={`/dashboard/events/${evt.id}`}
                  className="block bg-surface border border-border rounded-xl p-6 hover:border-accent/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      {EVENT_TYPE_LABELS[evt.eventType] ?? evt.eventType}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-text-primary mb-1">
                    {evt.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    {formatDate(evt.eventDate)}
                  </p>
                  <div className="flex gap-4 text-xs text-text-muted">
                    <span>{evt.venueCount} τοποθεσίες</span>
                    <span>{evt.personCount} πρόσωπα</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Create event modal */}
        {showCreate && (
          <CreateEventModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              loadEvents();
            }}
          />
        )}
      </main>
    </div>
  );
}

function CreateEventModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    eventType: "Wedding",
    eventDate: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api("/api/v1/events", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          eventType: form.eventType,
          eventDate: form.eventDate || null,
          description: form.description || null,
          locale: "el",
        }),
      });
      onCreated();
    } catch {
      setError("Σφάλμα δημιουργίας. Δοκιμάστε ξανά.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Νέα εκδήλωση
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive-light px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Τίτλος
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
              placeholder="π.χ. Γάμος Μαρίας & Γιώργου"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Τύπος εκδήλωσης
            </label>
            <select
              value={form.eventType}
              onChange={(e) => update("eventType", e.target.value)}
              className={inputClass}
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Ημερομηνία
            </label>
            <input
              type="datetime-local"
              value={form.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Περιγραφή{" "}
              <span className="text-text-muted font-normal">
                (προαιρετικό)
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Σύντομη περιγραφή..."
            />
          </div>

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
              {submitting ? "Δημιουργία..." : "Δημιουργία"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

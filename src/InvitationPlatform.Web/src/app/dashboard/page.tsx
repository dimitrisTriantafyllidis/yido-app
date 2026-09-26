"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";

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
  guestCount: number;
  confirmedRsvpCount: number;
  packageName: string | null;
}

interface SubscriptionSummary {
  packageName: string;
  packageTier: string;
  status: string;
}

type EventFilter = "all" | "active" | "drafts";

const PAGE_SIZE = 7;

const EVENT_TYPE_LABELS: Record<string, string> = {
  Wedding: "ΓΑΜΟΣ",
  Baptism: "ΒΑΠΤΙΣΗ",
  Party: "ΠΑΡΤΙ",
  Engagement: "ΑΡΡΑΒΩΝΑΣ",
  Corporate: "ΕΤΑΙΡΙΚΗ",
  Custom: "ΑΛΛΟ",
};

const EVENT_TYPE_STYLES: Record<string, { chip: string; text: string }> = {
  Wedding: { chip: "bg-[#F8EFF0]", text: "text-[#5C1A1B]" },
  Baptism: { chip: "bg-[#EFF6F8]", text: "text-[#1A4E5C]" },
  Party: { chip: "bg-[#FDF8EF]", text: "text-[#8A661C]" },
  Engagement: { chip: "bg-[#F8EFF0]", text: "text-[#5C1A1B]" },
  Corporate: { chip: "bg-[#EFF6F8]", text: "text-[#1A4E5C]" },
  Custom: { chip: "bg-[#F0ECE6]", text: "text-[#5E5654]" },
};

const STATUS_STYLES: Record<string, { label: string; pill: string; dot: string; text: string }> = {
  Published: {
    label: "Δημοσιευμένη",
    pill: "bg-[#E3F3EA]",
    dot: "bg-[#1B5E3A]",
    text: "text-[#1B5E3A]",
  },
  Draft: {
    label: "Πρόχειρη",
    pill: "bg-[#F0ECE6]",
    dot: "bg-[#9C9293]",
    text: "text-[#5E5654]",
  },
  Archived: {
    label: "Αρχειοθετημένη",
    pill: "bg-[#F0ECE6]",
    dot: "bg-[#9C9293]",
    text: "text-[#5E5654]",
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<EventFilter>("all");
  const [page, setPage] = useState(0);
  const [subscriptionLabel, setSubscriptionLabel] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const [data, subscriptions] = await Promise.all([
        api<EventSummary[]>("/api/v1/events"),
        api<SubscriptionSummary[]>("/api/v1/subscriptions").catch(() => [] as SubscriptionSummary[]),
      ]);
      setEvents(data);
      const active = subscriptions.find((s) => s.status === "Active");
      setSubscriptionLabel(active?.packageName ?? null);
    } catch {
      // empty list shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  const filteredEvents = useMemo(() => {
    if (filter === "active") return events.filter((e) => e.status === "Published");
    if (filter === "drafts") return events.filter((e) => e.status === "Draft");
    return events;
  }, [events, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const pageEvents = filteredEvents.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const stats = useMemo(() => {
    const drafts = events.filter((e) => e.status === "Draft").length;
    const completed = events.filter((e) => e.status !== "Draft").length;
    const published = events.filter((e) => e.status === "Published").length;
    const totalGuests = events.reduce((sum, e) => sum + (e.guestCount ?? 0), 0);
    const confirmedRsvps = events.reduce((sum, e) => sum + (e.confirmedRsvpCount ?? 0), 0);
    return { drafts, completed, published, totalGuests, confirmedRsvps };
  }, [events]);

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("el-GR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatEventId = (id: string, createdAt: string) => {
    const year = new Date(createdAt).getFullYear();
    const suffix = id.replace(/-/g, "").slice(-4).toUpperCase();
    return `YD-${year}-${suffix}`;
  };

  const packageBadge = (name: string | null) => {
    if (!name) return null;
    const upper = name.toUpperCase();
    if (upper === "DIGITAL") return "PREMIUM";
    return upper;
  };

  const tenantName = user?.currentTenant?.name ?? "—";
  const firstName = user?.firstName ?? "χρήστη";

  return (
    <main className="flex flex-col gap-8 px-6 py-10 md:px-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1516]">Καλώς ήρθες, {firstName}</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[#6E6263]">
            <span>
              Διαχειριστής: <span className="font-semibold text-[#1C1516]">{tenantName}</span>
            </span>
            {subscriptionLabel ? (
              <>
                <span className="size-1 rounded-full bg-[#9C9293]" />
                <span className="text-[#9C9293]">{subscriptionLabel} Συνδρομή</span>
              </>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#EDE8E3] bg-[#C4993D] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_6px_rgba(196,153,61,0.2)] transition-colors hover:bg-[#B38935]"
        >
          <DashboardIcon name="plus" className="size-3.5 text-white" />
          Νέα εκδήλωση
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Συνολικές εκδηλώσεις"
          value={events.length}
          hint={`${stats.drafts} σε σχεδίαση • ${stats.completed} ολοκληρωμένες`}
          icon="calendar-check"
        />
        <StatCard
          label="Δημοσιευμένες προσκλήσεις"
          value={stats.published}
          hint="Ενεργά URL προσκλητηρίων"
          icon="chrome"
        />
        <StatCard
          label="Συνολικοί καλεσμένοι"
          value={stats.totalGuests}
          hint={`${stats.confirmedRsvps} Επιβεβαιωμένα RSVP`}
          icon="users"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#EDE8E3] bg-white shadow-[0_2px_8px_rgba(28,21,22,0.02)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDE8E3] p-5">
          <h2 className="text-base font-semibold text-[#1C1516]">Οι Εκδηλώσεις σας</h2>
          <div className="flex gap-2">
            {(
              [
                ["all", "Όλες"],
                ["active", "Ενεργές"],
                ["drafts", "Πρόχειρες"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === key
                    ? "bg-[#F9F8F6] font-semibold text-[#1C1516]"
                    : "text-[#9C9293] hover:text-[#1C1516]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="px-5 py-20 text-center">
            <p className="font-display text-xl font-semibold text-[#1C1516]">Δεν υπάρχουν εκδηλώσεις</p>
            <p className="mt-2 text-sm text-[#6E6263]">
              {filter === "all"
                ? "Δημιουργήστε την πρώτη σας ψηφιακή πρόσκληση."
                : "Δεν βρέθηκαν εκδηλώσεις με αυτό το φίλτρο."}
            </p>
            {filter === "all" ? (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C4993D] px-5 py-3 text-sm font-semibold text-white"
              >
                <DashboardIcon name="plus" className="size-3.5 text-white" />
                Νέα εκδήλωση
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <div className="grid grid-cols-[minmax(240px,1fr)_110px_140px_110px_130px_110px] gap-4 border-b border-[#EDE8E3] bg-[#F9F8F6] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#9C9293]">
                <span>Όνομα εκδήλωσης</span>
                <span>Τύπος</span>
                <span>Ημερομηνία</span>
                <span>Καλεσμένοι</span>
                <span>Κατάσταση</span>
                <span className="text-right">Ενέργειες</span>
              </div>
              {pageEvents.map((evt) => (
                <EventRow
                  key={evt.id}
                  event={evt}
                  formatShortDate={formatShortDate}
                  formatEventId={formatEventId}
                  packageBadge={packageBadge}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 p-4 lg:hidden">
              {pageEvents.map((evt) => (
                <EventCardMobile
                  key={evt.id}
                  event={evt}
                  formatShortDate={formatShortDate}
                  formatEventId={formatEventId}
                  packageBadge={packageBadge}
                />
              ))}
            </div>
          </>
        )}

        {!loading && filteredEvents.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDE8E3] px-5 py-4 text-sm">
            <p className="text-[#9C9293]">
              Εμφάνιση {pageEvents.length} από {filteredEvents.length} εκδηλώσεων
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="font-semibold text-[#9C9293] disabled:opacity-40 hover:text-[#1C1516]"
              >
                Προηγούμενη
              </button>
              <button
                type="button"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => p + 1)}
                className="font-semibold text-[#1C1516] disabled:opacity-40"
              >
                Επόμενη
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {showCreate ? (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadEvents();
          }}
        />
      ) : null}
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: "calendar-check" | "chrome" | "users";
}) {
  return (
    <article className="rounded-xl border border-[#EDE8E3] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium uppercase tracking-wide text-[#6E6263]">{label}</p>
        <span className="rounded-lg bg-[#F9F8F6] p-2 text-[#6E6263]">
          <DashboardIcon name={icon} className="size-4" />
        </span>
      </div>
      <p className="mt-4 text-[28px] font-bold text-[#1C1516]">{value}</p>
      <p className="mt-1 text-xs text-[#9C9293]">{hint}</p>
    </article>
  );
}

function EventRow({
  event,
  formatShortDate,
  formatEventId,
  packageBadge,
}: {
  event: EventSummary;
  formatShortDate: (d: string | null) => string;
  formatEventId: (id: string, createdAt: string) => string;
  packageBadge: (name: string | null) => string | null;
}) {
  const typeStyle = EVENT_TYPE_STYLES[event.eventType] ?? EVENT_TYPE_STYLES.Custom;
  const status = STATUS_STYLES[event.status] ?? STATUS_STYLES.Draft;
  const badge = packageBadge(event.packageName);

  return (
    <div className="grid grid-cols-[minmax(240px,1fr)_110px_140px_110px_130px_110px] items-center gap-4 border-b border-[#EDE8E3] px-5 py-3.5 last:border-b-0">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[15px] font-semibold text-[#1C1516]">{event.title}</p>
          {badge ? (
            <span className="shrink-0 rounded border border-[#EADFCB] bg-[#FAF3DF] px-1.5 py-0.5 text-[10px] font-semibold text-[#C4993D]">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-[#9C9293]">ID: {formatEventId(event.id, event.createdAt)}</p>
      </div>

      <div>
        <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold ${typeStyle.chip} ${typeStyle.text}`}>
          {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[13px] font-medium text-[#6E6263]">
        <DashboardIcon name="calendar" className="size-3.5" />
        {formatShortDate(event.eventDate)}
      </div>

      <div className="flex items-center gap-2 text-[13px] text-[#6E6263]">
        <DashboardIcon name="users" className="size-3.5" />
        <span className="font-semibold">{event.guestCount ?? 0}</span>
        <span className="font-normal text-[#9C9293]">άτομα</span>
      </div>

      <div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.pill} ${status.text}`}>
          <span className={`size-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href={`/dashboard/events/${event.id}/editor`}
          className="rounded-md bg-[#F9F8F6] p-2 text-[#6E6263] transition-colors hover:text-[#1C1516]"
          aria-label="Επεξεργασία"
        >
          <DashboardIcon name="edit" className="size-3.5" />
        </Link>
        <Link
          href={`/dashboard/events/${event.id}`}
          className="rounded-md bg-[#F9F8F6] p-2 text-[#6E6263] transition-colors hover:text-[#1C1516]"
          aria-label="Ρυθμίσεις εκδήλωσης"
        >
          <DashboardIcon name="settings-row" className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function EventCardMobile({
  event,
  formatShortDate,
  formatEventId,
  packageBadge,
}: {
  event: EventSummary;
  formatShortDate: (d: string | null) => string;
  formatEventId: (id: string, createdAt: string) => string;
  packageBadge: (name: string | null) => string | null;
}) {
  const typeStyle = EVENT_TYPE_STYLES[event.eventType] ?? EVENT_TYPE_STYLES.Custom;
  const status = STATUS_STYLES[event.status] ?? STATUS_STYLES.Draft;
  const badge = packageBadge(event.packageName);

  return (
    <article className="rounded-xl border border-[#EDE8E3] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[#1C1516]">{event.title}</h3>
            {badge ? (
              <span className="rounded border border-[#EADFCB] bg-[#FAF3DF] px-1.5 py-0.5 text-[10px] font-semibold text-[#C4993D]">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[#9C9293]">ID: {formatEventId(event.id, event.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.pill} ${status.text}`}>
          <span className={`size-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm text-[#6E6263]">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${typeStyle.chip} ${typeStyle.text}`}>
          {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
        </span>
        <span>{formatShortDate(event.eventDate)}</span>
        <span>{event.guestCount ?? 0} καλεσμένοι</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/dashboard/events/${event.id}/editor`}
          className="flex-1 rounded-lg border border-[#EDE8E3] py-2 text-center text-sm font-medium"
        >
          Επεξεργασία
        </Link>
        <Link
          href={`/dashboard/events/${event.id}`}
          className="flex-1 rounded-lg bg-[#3A1112] py-2 text-center text-sm font-medium text-white"
        >
          Ρυθμίσεις
        </Link>
      </div>
    </article>
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
    "w-full rounded-lg border border-[#EDE8E3] bg-white px-3.5 py-2.5 text-sm text-[#1C1516] placeholder:text-[#9C9293] outline-none focus:border-[#C4993D] focus:ring-1 focus:ring-[#C4993D]";

  const eventTypeOptions: Record<string, string> = {
    Wedding: "Γάμος",
    Baptism: "Βάπτιση",
    Party: "Γενέθλια / Πάρτι",
    Engagement: "Αρραβώνας",
    Corporate: "Εταιρική",
    Custom: "Άλλο",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#EDE8E3] bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[#1C1516]">Νέα εκδήλωση</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg text-[#9C9293] hover:text-[#1C1516]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1C1516]">Τίτλος</label>
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
            <label className="mb-1.5 block text-sm font-medium text-[#1C1516]">Τύπος εκδήλωσης</label>
            <select
              value={form.eventType}
              onChange={(e) => update("eventType", e.target.value)}
              className={inputClass}
            >
              {Object.entries(eventTypeOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1C1516]">Ημερομηνία</label>
            <input
              type="datetime-local"
              value={form.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1C1516]">
              Περιγραφή <span className="font-normal text-[#9C9293]">(προαιρετικό)</span>
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
              className="flex-1 rounded-lg border border-[#EDE8E3] px-4 py-2.5 text-sm font-medium text-[#1C1516] hover:bg-[#F9F8F6]"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#C4993D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#B38935] disabled:opacity-50"
            >
              {submitting ? "Δημιουργία..." : "Δημιουργία"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

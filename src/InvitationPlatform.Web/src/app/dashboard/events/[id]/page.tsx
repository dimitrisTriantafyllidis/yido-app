"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";
import { EventDetailTabs } from "@/components/dashboard/event-detail-tabs";
import { EventManageSections } from "@/components/dashboard/event-manage-sections";
import { api, ApiError, getApiErrorMessage } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const PUBLIC_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface Venue {
  id: string;
  name: string;
  venueType: string;
  address: string | null;
  city: string | null;
  googleMapsUrl: string | null;
  time: string | null;
  notes: string | null;
  sortOrder: number;
}

interface Person {
  id: string;
  role: string;
  displayName: string;
  side: string | null;
  sortOrder: number;
  photoUrl: string | null;
}

interface EventDetail {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  eventEndDate: string | null;
  status: string;
  slug: string | null;
  locale: string;
  coverImageUrl: string | null;
  description: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  venues: Venue[];
  persons: Person[];
}

interface RsvpStats {
  totalGuests: number;
  confirmed: number;
  pending: number;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  Wedding: "Γάμος",
  Baptism: "Βάπτιση",
  Party: "Γενέθλια / Πάρτι",
  Engagement: "Αρραβώνας",
  Corporate: "Εταιρική",
  Custom: "Άλλο",
};

const LOCALE_LABELS: Record<string, string> = {
  el: "Ελληνικά",
  en: "English",
};

const VENUE_TYPE_LABELS: Record<string, string> = {
  Church: "Εκκλησία",
  Reception: "Δεξίωση",
  Ceremony: "Τελετή",
  Party: "Πάρτι",
  Custom: "Άλλο",
};

const PERSON_ROLE_LABELS: Record<string, string> = {
  Bride: "Νύφη",
  Groom: "Γαμπρός",
  Father: "Πατέρας",
  Mother: "Μητέρα",
  BestMan: "Κουμπάρος",
  MaidOfHonor: "Κουμπάρα",
  Godparent: "Νονός/Νονά",
  Sponsor: "Ανάδοχος",
  Organizer: "Οργανωτής",
  Custom: "Άλλο",
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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishError, setPublishError] = useState("");
  const [publishSlug, setPublishSlug] = useState<string | null>(null);
  const [showManage, setShowManage] = useState(false);

  const eventId = params.id as string;

  const loadEvent = useCallback(async () => {
    try {
      const [data, rsvpStats] = await Promise.all([
        api<EventDetail>(`/api/v1/events/${eventId}`),
        api<{
          totalGuests: number;
          confirmed: number;
          pending: number;
        }>(`/api/v1/events/${eventId}/rsvps/statistics`).catch(() => null),
      ]);
      setEvent(data);
      if (rsvpStats) {
        setStats({
          totalGuests: rsvpStats.totalGuests,
          confirmed: rsvpStats.confirmed,
          pending: rsvpStats.pending,
        });
      }
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handlePublish = async () => {
    setPublishError("");
    setPublishSlug(null);
    try {
      try {
        await api(`/api/v1/events/${eventId}/invitation`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          router.push(`/dashboard/events/${eventId}/editor`);
          return;
        }
        throw err;
      }
      const result = await api<{ slug: string }>(
        `/api/v1/events/${eventId}/invitation/publish`,
        { method: "POST" }
      );
      setPublishSlug(result.slug);
      await loadEvent();
    } catch (err) {
      if (err instanceof ApiError) {
        setPublishError(
          getApiErrorMessage(err, "Η δημοσίευση απέτυχε. Επιλέξτε πρότυπο στον επεξεργαστή πρώτα.")
        );
      } else {
        setPublishError("Η δημοσίευση απέτυχε.");
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εκδήλωση;")) return;
    await api(`/api/v1/events/${eventId}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  const downloadQr = async (target: "invitation" | "upload") => {
    try {
      const qs = target === "upload" ? "?target=upload" : "";
      const res = await fetch(`${API_BASE}/api/v1/events/${eventId}/qr${qs}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = target === "upload" ? "guest-upload-qr.png" : "invitation-qr.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(
        target === "upload"
          ? "QR φωτογραφιών: απαιτεί Video ή add-on φωτογραφιών καλεσμένων."
          : "Δεν ήταν δυνατή η λήψη QR (απαιτείται πακέτο με qr_code)."
      );
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("el-GR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const summarizeVenues = (venues: Venue[]) => {
    if (venues.length === 0) return "Καμία καταχωρημένη";
    const labels = venues.map((v) => VENUE_TYPE_LABELS[v.venueType] ?? v.venueType);
    const unique = [...new Set(labels)];
    return `${venues.length} καταχωρημένες (${unique.join(", ")})`;
  };

  const summarizePersons = (persons: Person[]) => {
    if (persons.length === 0) return "Κανένα καταχωρημένο";
    const roles = persons.map((p) => PERSON_ROLE_LABELS[p.role] ?? p.role);
    const unique = [...new Set(roles)].slice(0, 3);
    return `${persons.length} (${unique.join(", ")}${roles.length > unique.length ? "…" : ""})`;
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
      </div>
    );
  }

  if (!event) return null;

  const status = STATUS_STYLES[event.status] ?? STATUS_STYLES.Draft;
  const slug = publishSlug ?? event.slug;
  const publicUrl = slug ? `${PUBLIC_BASE.replace(/\/$/, "")}/e/${slug}` : null;

  return (
    <main className="flex flex-col gap-8 px-6 py-10 md:px-12">
      <section className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-[13px]">
          <Link href="/dashboard" className="font-medium text-[#9C9293] hover:text-[#1C1516]">
            Εκδηλώσεις
          </Link>
          <DashboardIcon name="chevron-right" className="size-3 text-[#9C9293]" />
          <span className="font-semibold text-[#1C1516]">{event.title}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-display text-4xl text-[#1C1516]">{event.title}</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.pill} ${status.text}`}
            >
              <span className={`size-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#6E6263]">
            <DashboardIcon name="calendar" className="size-4" />
            {formatDate(event.eventDate)}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#EDE8E3] bg-white p-3">
        <div className="flex flex-wrap gap-3">
          {event.status === "Draft" ? (
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center gap-2 rounded-md border border-[#C4993D] bg-[#FAF3DF] px-4 py-2 text-[13px] font-semibold text-[#8A661C]"
            >
              Δημοσίευση
            </button>
          ) : null}
          {slug ? (
            <>
              <Link
                href={`/e/${slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-md border border-[#EDE8E3] bg-[#F9F8F6] px-4 py-2 text-[13px] font-semibold text-[#6E6263] hover:text-[#1C1516]"
              >
                <DashboardIcon name="eye" className="size-3.5" />
                Προεπισκόπηση
              </Link>
              <button
                type="button"
                onClick={() => downloadQr("invitation")}
                className="inline-flex items-center gap-2 rounded-md border border-[#EDE8E3] bg-[#F9F8F6] px-4 py-2 text-[13px] font-semibold text-[#6E6263] hover:text-[#1C1516]"
              >
                <DashboardIcon name="qr-code" className="size-3.5" />
                QR πρόσκλησης
              </button>
              <button
                type="button"
                onClick={() => downloadQr("upload")}
                className="inline-flex items-center gap-2 rounded-md border border-[#EDE8E3] bg-[#F9F8F6] px-4 py-2 text-[13px] font-semibold text-[#6E6263] hover:text-[#1C1516]"
              >
                <DashboardIcon name="images" className="size-3.5" />
                QR φωτογραφιών
              </button>
            </>
          ) : null}
          <Link
            href={`/dashboard/events/${eventId}/editor`}
            className="inline-flex items-center gap-2 rounded-md border border-[#EDE8E3] bg-[#F9F8F6] px-4 py-2 text-[13px] font-semibold text-[#6E6263] hover:text-[#1C1516]"
          >
            <DashboardIcon name="edit" className="size-3.5" />
            Επεξεργασία πρόσκλησης
          </Link>
          <Link
            href={`/dashboard/events/${eventId}/seating`}
            className="inline-flex items-center gap-2 rounded-md border border-[#EDE8E3] bg-[#F9F8F6] px-4 py-2 text-[13px] font-semibold text-[#6E6263] hover:text-[#1C1516]"
          >
            <DashboardIcon name="users" className="size-3.5" />
            Τραπέζια
          </Link>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-md bg-[#FDF2F2] px-4 py-2 text-[13px] font-semibold text-[#C43D41]"
        >
          <DashboardIcon name="trash" className="size-3.5" />
          Διαγραφή
        </button>
      </section>

      {publishError ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {publishError}{" "}
          <Link href={`/dashboard/events/${eventId}/editor`} className="font-medium underline">
            Άνοιγμα επεξεργαστή
          </Link>
        </div>
      ) : null}
      {publishSlug ? (
        <div className="rounded-lg bg-[#E3F3EA] px-4 py-3 text-sm text-[#1B5E3A]">
          Δημοσιεύτηκε:{" "}
          <Link href={`/e/${publishSlug}`} target="_blank" className="font-medium underline">
            /e/{publishSlug}
          </Link>
        </div>
      ) : null}

      <EventDetailTabs eventId={eventId} guestCount={stats?.totalGuests ?? 0} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1">
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-[#9C9293]">
            Λεπτομέρειες πρόσκλησης
          </h2>
          <div className="overflow-hidden rounded-xl border border-[#EDE8E3]">
            <InfoRow icon="heart" label="Τύπος Εκδήλωσης" value={EVENT_TYPE_LABELS[event.eventType] ?? event.eventType} />
            <InfoRow icon="languages" label="Γλώσσα" value={LOCALE_LABELS[event.locale] ?? event.locale} />
            <InfoRow
              icon="link"
              label="Ψηφιακός Σύνδεσμος"
              value={
                publicUrl ? (
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C4993D] underline">
                    {publicUrl.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="text-[#9C9293]">Δεν έχει δημοσιευτεί ακόμα</span>
                )
              }
            />
            <InfoRow icon="map-pin" label="Τοποθεσίες" value={summarizeVenues(event.venues)} />
            <InfoRow icon="user" label="Πρόσωπα" value={summarizePersons(event.persons)} border={false} />
          </div>

          {event.description ? (
            <div className="mt-6 rounded-xl border border-[#EDE8E3] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#1C1516]">Περιγραφή</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6E6263] whitespace-pre-wrap">{event.description}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setShowManage((v) => !v)}
            className="mt-6 text-sm font-medium text-[#C4993D] hover:underline"
          >
            {showManage ? "Απόκρυψη διαχείρισης τοποθεσιών & προσώπων" : "Διαχείριση τοποθεσιών & προσώπων"}
          </button>
          {showManage ? (
            <EventManageSections eventId={eventId} event={event} onUpdated={loadEvent} />
          ) : null}
        </section>

        <aside className="w-full shrink-0 rounded-xl border border-[#EDE8E3] bg-white p-6 shadow-[0_2px_6px_rgba(28,21,22,0.02)] lg:w-[340px]">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#9C9293]">Κατάσταση RSVP</h2>
          <div className="mt-6 flex flex-col gap-4">
            <StatLine dotClass="bg-[#1B5E3A]" label="Επιβεβαιωμένοι" value={stats?.confirmed ?? 0} />
            <StatLine dotClass="bg-[#C4993D]" label="Σε αναμονή" value={stats?.pending ?? 0} />
            <div className="h-px bg-[#EDE8E3]" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1C1516]">Σύνολο καλεσμένων</span>
              <span className="text-lg font-bold text-[#1C1516]">{stats?.totalGuests ?? 0}</span>
            </div>
          </div>
          <Link
            href={`/dashboard/events/${eventId}/rsvps`}
            className="mt-6 block text-center text-sm font-medium text-[#C4993D] hover:underline"
          >
            Προβολή απαντήσεων →
          </Link>
          <Link
            href={`/dashboard/events/${eventId}/wishes`}
            className="mt-3 block text-center text-sm font-medium text-[#C4993D] hover:underline"
          >
            Προβολή ευχών →
          </Link>
        </aside>
      </div>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
  border = true,
}: {
  icon: "heart" | "languages" | "link" | "map-pin" | "user";
  label: string;
  value: ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 bg-white px-5 py-5 ${
        border ? "border-b border-[#EDE8E3]" : ""
      }`}
    >
      <div className="flex items-center gap-3 text-sm font-medium text-[#6E6263]">
        <DashboardIcon name={icon} className="size-4 shrink-0" />
        {label}
      </div>
      <div className="text-right text-sm font-semibold text-[#1C1516]">{value}</div>
    </div>
  );
}

function StatLine({
  dotClass,
  label,
  value,
}: {
  dotClass: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-[#6E6263]">
        <span className={`size-2 rounded-full ${dotClass}`} />
        {label}
      </div>
      <span className="text-base font-bold text-[#1C1516]">{value}</span>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, getApiErrorMessage } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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

const VENUE_TYPES = ["Church", "Reception", "Ceremony", "Party", "Custom"] as const;
const PERSON_ROLES = [
  "Bride",
  "Groom",
  "Father",
  "Mother",
  "BestMan",
  "MaidOfHonor",
  "Godparent",
  "Sponsor",
  "Organizer",
  "Custom",
] as const;

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

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  Draft: { label: "Πρόχειρη", className: "bg-warning-light text-warning" },
  Published: { label: "Δημοσιευμένη", className: "bg-success-light text-success" },
  Archived: { label: "Αρχειοθετημένη", className: "bg-bg text-text-muted" },
};

const emptyVenue = {
  name: "",
  venueType: "Church",
  address: "",
  city: "",
  googleMapsUrl: "",
  time: "",
  notes: "",
};

const emptyPerson = {
  displayName: "",
  role: "Bride",
  side: "",
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "venues" | "persons">("overview");
  const [venueForm, setVenueForm] = useState(emptyVenue);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [personForm, setPersonForm] = useState(emptyPerson);
  const [saving, setSaving] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishSlug, setPublishSlug] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPersonId, setPhotoPersonId] = useState<string | null>(null);

  const eventId = params.id as string;

  const loadEvent = useCallback(async () => {
    try {
      const data = await api<EventDetail>(`/api/v1/events/${eventId}`);
      setEvent(data);
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
      // Check invitation exists first
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
          getApiErrorMessage(
            err,
            "Η δημοσίευση απέτυχε. Επιλέξτε πρότυπο στον επεξεργαστή πρώτα."
          )
        );
      } else {
        setPublishError("Η δημοσίευση απέτυχε.");
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εκδήλωση;"))
      return;
    await api(`/api/v1/events/${eventId}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  const saveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: venueForm.name,
        venueType: venueForm.venueType,
        address: venueForm.address || null,
        city: venueForm.city || null,
        googleMapsUrl: venueForm.googleMapsUrl || null,
        time: venueForm.time || null,
        notes: venueForm.notes || null,
      };
      if (editingVenueId) {
        await api(`/api/v1/events/${eventId}/venues/${editingVenueId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await api(`/api/v1/events/${eventId}/venues`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setVenueForm(emptyVenue);
      setEditingVenueId(null);
      await loadEvent();
    } finally {
      setSaving(false);
    }
  };

  const startEditVenue = (v: Venue) => {
    setEditingVenueId(v.id);
    setVenueForm({
      name: v.name,
      venueType: v.venueType,
      address: v.address ?? "",
      city: v.city ?? "",
      googleMapsUrl: v.googleMapsUrl ?? "",
      time: v.time ?? "",
      notes: v.notes ?? "",
    });
  };

  const cancelEditVenue = () => {
    setEditingVenueId(null);
    setVenueForm(emptyVenue);
  };

  const deleteVenue = async (venueId: string) => {
    if (!confirm("Διαγραφή τοποθεσίας;")) return;
    await api(`/api/v1/events/${eventId}/venues/${venueId}`, { method: "DELETE" });
    loadEvent();
  };

  const addPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api(`/api/v1/events/${eventId}/persons`, {
        method: "POST",
        body: JSON.stringify({
          displayName: personForm.displayName,
          role: personForm.role,
          side: personForm.side || null,
        }),
      });
      setPersonForm(emptyPerson);
      await loadEvent();
    } finally {
      setSaving(false);
    }
  };

  const deletePerson = async (personId: string) => {
    if (!confirm("Διαγραφή προσώπου;")) return;
    await api(`/api/v1/events/${eventId}/persons/${personId}`, { method: "DELETE" });
    loadEvent();
  };

  const uploadPhoto = async (personId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(
      `${API_BASE}/api/v1/events/${eventId}/persons/${personId}/photo`,
      { method: "POST", credentials: "include", body: formData }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      alert(body?.message ?? "Αποτυχία ανεβάσματος");
      return;
    }
    loadEvent();
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!event) return null;

  const status = STATUS_LABELS[event.status] ?? {
    label: event.status,
    className: "bg-bg text-text-muted",
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-lg font-semibold text-text-primary">
              YIDO
            </Link>
            <span className="text-text-muted">/</span>
            <Link
              href="/dashboard"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Εκδηλώσεις
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user?.firstName}</span>
            <button
              onClick={logout}
              className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Αποσύνδεση
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary">
              {event.title}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {formatDate(event.eventDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${status.className}`}
            >
              {status.label}
            </span>
            {event.status === "Draft" && (
              <button
                onClick={handlePublish}
                className="px-4 py-2 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent-light transition-colors cursor-pointer"
              >
                Δημοσίευση
              </button>
            )}
            {(event.status === "Published" || publishSlug) && (event.slug || publishSlug) && (
              <>
                <Link
                  href={`/e/${publishSlug ?? event.slug}`}
                  target="_blank"
                  className="px-4 py-2 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent-light transition-colors"
                >
                  Προεπισκόπηση
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/api/v1/events/${eventId}/qr`, {
                        credentials: "include",
                      });
                      if (!res.ok) throw new Error();
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "invitation-qr.png";
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch {
                      alert("Δεν ήταν δυνατή η λήψη QR (απαιτείται πακέτο με qr_code).");
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg transition-colors cursor-pointer"
                >
                  QR πρόσκλησης
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `${API_BASE}/api/v1/events/${eventId}/qr?target=upload`,
                        { credentials: "include" }
                      );
                      if (!res.ok) throw new Error();
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "guest-upload-qr.png";
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch {
                      alert(
                        "QR ανεβάσματος: απαιτεί Video ή add-on φωτογραφιών καλεσμένων + δημοσίευση."
                      );
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg transition-colors cursor-pointer"
                >
                  QR φωτογραφιών
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-lg hover:bg-destructive-light transition-colors cursor-pointer"
            >
              Διαγραφή
            </button>
          </div>
        </div>

        {publishError && (
          <div className="mb-4 rounded-lg bg-destructive-light px-4 py-3 text-sm text-destructive">
            {publishError}{" "}
            <Link
              href={`/dashboard/events/${eventId}/editor`}
              className="underline font-medium"
            >
              Άνοιγμα επεξεργαστή
            </Link>
          </div>
        )}
        {publishSlug && (
          <div className="mb-4 rounded-lg bg-success-light px-4 py-3 text-sm text-success">
            Δημοσιεύτηκε:{" "}
            <Link href={`/e/${publishSlug}`} target="_blank" className="underline font-medium">
              /e/{publishSlug}
            </Link>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={`/dashboard/events/${eventId}/editor`}
            className="px-4 py-2 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent-light transition-colors"
          >
            Επεξεργασία πρόσκλησης
          </Link>
          <Link
            href={`/dashboard/events/${eventId}/guests`}
            className="px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg transition-colors"
          >
            Καλεσμένοι
          </Link>
          <Link
            href={`/dashboard/events/${eventId}/rsvps`}
            className="px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg transition-colors"
          >
            Απαντήσεις RSVP
          </Link>
          <Link
            href={`/dashboard/events/${eventId}/gallery`}
            className="px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg transition-colors"
          >
            Γκαλερί
          </Link>
          <Link
            href={`/dashboard/events/${eventId}/pricing`}
            className="px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg transition-colors"
          >
            Πακέτο & Τιμολόγηση
          </Link>
        </div>

        <div className="flex gap-1 mb-8 border-b border-border">
          {(
            [
              ["overview", "Επισκόπηση"],
              ["venues", "Τοποθεσίες"],
              ["persons", "Πρόσωπα"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer -mb-px border-b-2 ${
                tab === key
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {label}
              {key === "venues" && ` (${event.venues.length})`}
              {key === "persons" && ` (${event.persons.length})`}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold text-text-primary mb-4">
                Πληροφορίες
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Τύπος</dt>
                  <dd className="text-text-primary font-medium">{event.eventType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Ημερομηνία</dt>
                  <dd className="text-text-primary">{formatDate(event.eventDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Γλώσσα</dt>
                  <dd className="text-text-primary">{event.locale}</dd>
                </div>
                {event.slug && (
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">Σύνδεσμος</dt>
                    <dd className="text-accent font-medium">/e/{event.slug}</dd>
                  </div>
                )}
              </dl>
            </div>
            {event.description && (
              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-text-primary mb-4">
                  Περιγραφή
                </h2>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "venues" && (
          <div className="space-y-6">
            <form
              onSubmit={saveVenue}
              className="bg-surface border border-border rounded-xl p-6 grid md:grid-cols-2 gap-4"
            >
              <h2 className="md:col-span-2 font-display text-lg font-semibold text-text-primary">
                {editingVenueId ? "Επεξεργασία τοποθεσίας" : "Νέα τοποθεσία"}
              </h2>
              <input
                required
                placeholder="Όνομα"
                value={venueForm.name}
                onChange={(e) => setVenueForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <select
                value={venueForm.venueType}
                onChange={(e) => setVenueForm((f) => ({ ...f, venueType: e.target.value }))}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                {VENUE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {VENUE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <input
                placeholder="Διεύθυνση"
                value={venueForm.address}
                onChange={(e) => setVenueForm((f) => ({ ...f, address: e.target.value }))}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="Πόλη"
                value={venueForm.city}
                onChange={(e) => setVenueForm((f) => ({ ...f, city: e.target.value }))}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="Ώρα (HH:mm)"
                value={venueForm.time}
                onChange={(e) => setVenueForm((f) => ({ ...f, time: e.target.value }))}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="Google Maps URL"
                value={venueForm.googleMapsUrl}
                onChange={(e) =>
                  setVenueForm((f) => ({ ...f, googleMapsUrl: e.target.value }))
                }
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover disabled:opacity-50 cursor-pointer"
                >
                  {editingVenueId ? "Αποθήκευση" : "Προσθήκη τοποθεσίας"}
                </button>
                {editingVenueId && (
                  <button
                    type="button"
                    onClick={cancelEditVenue}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-lg cursor-pointer"
                  >
                    Ακύρωση
                  </button>
                )}
              </div>
            </form>

            {event.venues.length === 0 ? (
              <p className="text-center py-10 text-text-muted text-sm">
                Δεν υπάρχουν τοποθεσίες ακόμα.
              </p>
            ) : (
              event.venues.map((v) => (
                <div
                  key={v.id}
                  className="bg-surface border border-border rounded-xl p-6 flex items-start justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      {VENUE_TYPE_LABELS[v.venueType] ?? v.venueType}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-text-primary mt-1">
                      {v.name}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {[v.address, v.city].filter(Boolean).join(", ")}
                    </p>
                    {v.time && (
                      <p className="text-sm text-text-muted mt-1">{v.time}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {v.googleMapsUrl && (
                      <a
                        href={v.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:text-accent-hover"
                      >
                        Χάρτης
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => startEditVenue(v)}
                      className="text-sm text-accent cursor-pointer"
                    >
                      Επεξεργασία
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteVenue(v.id)}
                      className="text-sm text-destructive cursor-pointer"
                    >
                      Διαγραφή
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "persons" && (
          <div className="space-y-6">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && photoPersonId) uploadPhoto(photoPersonId, file);
                e.target.value = "";
                setPhotoPersonId(null);
              }}
            />

            <form
              onSubmit={addPerson}
              className="bg-surface border border-border rounded-xl p-6 grid md:grid-cols-3 gap-4"
            >
              <h2 className="md:col-span-3 font-display text-lg font-semibold text-text-primary">
                Νέο πρόσωπο
              </h2>
              <input
                required
                placeholder="Ονοματεπώνυμο"
                value={personForm.displayName}
                onChange={(e) =>
                  setPersonForm((f) => ({ ...f, displayName: e.target.value }))
                }
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <select
                value={personForm.role}
                onChange={(e) => setPersonForm((f) => ({ ...f, role: e.target.value }))}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                {PERSON_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {PERSON_ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <select
                value={personForm.side}
                onChange={(e) => setPersonForm((f) => ({ ...f, side: e.target.value }))}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Πλευρά (προαιρετικό)</option>
                <option value="Bride">Νύφη</option>
                <option value="Groom">Γαμπρός</option>
              </select>
              <button
                type="submit"
                disabled={saving}
                className="md:col-span-3 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover disabled:opacity-50 cursor-pointer"
              >
                Προσθήκη προσώπου
              </button>
            </form>

            {event.persons.length === 0 ? (
              <p className="text-center py-10 text-text-muted text-sm">
                Δεν υπάρχουν πρόσωπα ακόμα.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {event.persons.map((p) => (
                  <div
                    key={p.id}
                    className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-bg flex-shrink-0 flex items-center justify-center">
                      {p.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.photoUrl}
                          alt={p.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-accent">
                          {p.displayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {PERSON_ROLE_LABELS[p.role] ?? p.role}
                      </span>
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {p.displayName}
                      </h3>
                      <div className="flex gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPersonId(p.id);
                            photoInputRef.current?.click();
                          }}
                          className="text-xs text-accent cursor-pointer"
                        >
                          {p.photoUrl ? "Αλλαγή φωτο" : "Ανέβασμα φωτο"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePerson(p.id)}
                          className="text-xs text-destructive cursor-pointer"
                        >
                          Διαγραφή
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

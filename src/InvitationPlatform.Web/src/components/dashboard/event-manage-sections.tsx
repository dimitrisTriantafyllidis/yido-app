"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";

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

export function EventManageSections({
  eventId,
  event,
  onUpdated,
}: {
  eventId: string;
  event: EventDetail;
  onUpdated: () => void;
}) {
  const [venueForm, setVenueForm] = useState(emptyVenue);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [personForm, setPersonForm] = useState(emptyPerson);
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPersonId, setPhotoPersonId] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-[#EDE8E3] bg-white px-3 py-2 text-sm text-[#1C1516] outline-none focus:border-[#C4993D]";

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
      onUpdated();
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

  const deleteVenue = async (venueId: string) => {
    if (!confirm("Διαγραφή τοποθεσίας;")) return;
    await api(`/api/v1/events/${eventId}/venues/${venueId}`, { method: "DELETE" });
    onUpdated();
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
      onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const deletePerson = async (personId: string) => {
    if (!confirm("Διαγραφή προσώπου;")) return;
    await api(`/api/v1/events/${eventId}/persons/${personId}`, { method: "DELETE" });
    onUpdated();
  };

  const uploadPhoto = async (personId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/v1/events/${eventId}/persons/${personId}/photo`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      alert("Αποτυχία ανεβάσματος");
      return;
    }
    onUpdated();
  };

  return (
    <div className="mt-6 space-y-8">
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

      <div className="rounded-xl border border-[#EDE8E3] bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-[#1C1516]">Τοποθεσίες</h3>
        <form onSubmit={saveVenue} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            required
            placeholder="Όνομα"
            value={venueForm.name}
            onChange={(e) => setVenueForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
          <select
            value={venueForm.venueType}
            onChange={(e) => setVenueForm((f) => ({ ...f, venueType: e.target.value }))}
            className={inputClass}
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
            className={inputClass}
          />
          <input
            placeholder="Πόλη"
            value={venueForm.city}
            onChange={(e) => setVenueForm((f) => ({ ...f, city: e.target.value }))}
            className={inputClass}
          />
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#C4993D] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {editingVenueId ? "Αποθήκευση" : "Προσθήκη τοποθεσίας"}
            </button>
            {editingVenueId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingVenueId(null);
                  setVenueForm(emptyVenue);
                }}
                className="rounded-lg border border-[#EDE8E3] px-4 py-2 text-sm"
              >
                Ακύρωση
              </button>
            ) : null}
          </div>
        </form>
        <ul className="mt-4 divide-y divide-[#EDE8E3]">
          {event.venues.map((v) => (
            <li key={v.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#9C9293]">
                  {VENUE_TYPE_LABELS[v.venueType] ?? v.venueType}
                </p>
                <p className="font-semibold text-[#1C1516]">{v.name}</p>
                <p className="text-sm text-[#6E6263]">{[v.address, v.city].filter(Boolean).join(", ")}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" onClick={() => startEditVenue(v)} className="text-[#C4993D]">
                  Επεξεργασία
                </button>
                <button type="button" onClick={() => deleteVenue(v.id)} className="text-[#C43D41]">
                  Διαγραφή
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[#EDE8E3] bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-[#1C1516]">Πρόσωπα</h3>
        <form onSubmit={addPerson} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            required
            placeholder="Ονοματεπώνυμο"
            value={personForm.displayName}
            onChange={(e) => setPersonForm((f) => ({ ...f, displayName: e.target.value }))}
            className={inputClass}
          />
          <select
            value={personForm.role}
            onChange={(e) => setPersonForm((f) => ({ ...f, role: e.target.value }))}
            className={inputClass}
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
            className={inputClass}
          >
            <option value="">Πλευρά (προαιρετικό)</option>
            <option value="Bride">Νύφη</option>
            <option value="Groom">Γαμπρός</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="md:col-span-3 rounded-lg bg-[#C4993D] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Προσθήκη προσώπου
          </button>
        </form>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {event.persons.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-[#EDE8E3] p-3">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F9F8F6]">
                {p.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photoUrl} alt={p.displayName} className="size-full object-cover" />
                ) : (
                  <span className="font-semibold text-[#C4993D]">{p.displayName.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#9C9293]">{PERSON_ROLE_LABELS[p.role] ?? p.role}</p>
                <p className="truncate font-semibold text-sm">{p.displayName}</p>
                <div className="mt-1 flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPersonId(p.id);
                      photoInputRef.current?.click();
                    }}
                    className="text-[#C4993D]"
                  >
                    Φωτο
                  </button>
                  <button type="button" onClick={() => deletePerson(p.id)} className="text-[#C43D41]">
                    Διαγραφή
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

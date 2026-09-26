"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";
import type { InvitationPerson } from "./types";
import {
  PERSON_ROLE_LABELS,
  PERSON_ROLES,
  emptyQuizQuestion,
  emptyVendor,
  type GuestWishItem,
  type QuizQuestionConfig,
  type VendorConfig,
} from "./extra-section-config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const inputClass =
  "w-full rounded-md border border-[#EDE8E3] bg-white px-3 py-2 text-sm text-[#1C1516] outline-none focus:border-[#C4993D]";
const labelClass = "mb-1 block text-xs font-semibold text-[#6E6263]";

export function PersonsEditor({
  eventId,
  persons,
  onChange,
}: {
  eventId: string;
  persons: InvitationPerson[];
  onChange: (next: InvitationPerson[]) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Bride");
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPersonId, setPhotoPersonId] = useState<string | null>(null);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const created = await api<InvitationPerson>(`/api/v1/events/${eventId}/persons`, {
        method: "POST",
        body: JSON.stringify({ displayName: name.trim(), role, side: null }),
      });
      onChange([...persons, created]);
      setName("");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (personId: string) => {
    await api(`/api/v1/events/${eventId}/persons/${personId}`, { method: "DELETE" });
    onChange(persons.filter((p) => p.id !== personId));
  };

  const uploadPhoto = async (personId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/v1/events/${eventId}/persons/${personId}/photo`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) return;
    const updated = (await res.json()) as InvitationPerson;
    onChange(persons.map((p) => (p.id === personId ? updated : p)));
  };

  return (
    <div className="space-y-3">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && photoPersonId) void uploadPhoto(photoPersonId, file);
          e.target.value = "";
          setPhotoPersonId(null);
        }}
      />
      {persons.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-md border border-[#EDE8E3] p-2">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-[#F9F8F6]">
            {p.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.photoUrl} alt={p.displayName} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.displayName}</p>
            <p className="text-[11px] text-[#9C9293]">{PERSON_ROLE_LABELS[p.role] ?? p.role}</p>
          </div>
          <button
            type="button"
            className="text-[11px] text-[#6E6263]"
            onClick={() => {
              setPhotoPersonId(p.id);
              photoInputRef.current?.click();
            }}
          >
            Φωτο
          </button>
          <button type="button" className="text-[11px] text-[#C43D41]" onClick={() => void remove(p.id)}>
            Διαγραφή
          </button>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <input className={inputClass} placeholder="Όνομα" value={name} onChange={(e) => setName(e.target.value)} />
        <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
          {PERSON_ROLES.map((r) => (
            <option key={r} value={r}>
              {PERSON_ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        disabled={saving || !name.trim()}
        onClick={() => void add()}
        className="rounded-md border border-[#C4993D] px-3 py-1.5 text-xs font-semibold text-[#C4993D] disabled:opacity-50"
      >
        Προσθήκη προσώπου
      </button>
    </div>
  );
}

export function VendorsEditor({
  vendors,
  onChange,
}: {
  vendors: VendorConfig[];
  onChange: (next: VendorConfig[]) => void;
}) {
  const update = (index: number, patch: Partial<VendorConfig>) => {
    onChange(vendors.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  return (
    <div className="space-y-3">
      {vendors.map((vendor, index) => (
        <div key={index} className="space-y-2 rounded-md border border-[#EDE8E3] p-3">
          <div className="flex justify-between">
            <p className="text-xs font-semibold text-[#6E6263]">Συνεργάτης {index + 1}</p>
            <button
              type="button"
              className="text-[11px] text-[#C43D41]"
              onClick={() => onChange(vendors.filter((_, i) => i !== index))}
            >
              Αφαίρεση
            </button>
          </div>
          <input
            className={inputClass}
            placeholder="Όνομα"
            value={vendor.name}
            onChange={(e) => update(index, { name: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Κατηγορία (π.χ. Φωτογράφος)"
            value={vendor.category}
            onChange={(e) => update(index, { category: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Ιστότοπος"
            value={vendor.website ?? ""}
            onChange={(e) => update(index, { website: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Σύντομη περιγραφή"
            value={vendor.description ?? ""}
            onChange={(e) => update(index, { description: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...vendors, emptyVendor()])}
        className="rounded-md border border-[#C4993D] px-3 py-1.5 text-xs font-semibold text-[#C4993D]"
      >
        Προσθήκη συνεργάτη
      </button>
    </div>
  );
}

export function QuizQuestionsEditor({
  questions,
  onChange,
}: {
  questions: QuizQuestionConfig[];
  onChange: (next: QuizQuestionConfig[]) => void;
}) {
  const update = (index: number, patch: Partial<QuizQuestionConfig>) => {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <div key={index} className="space-y-2 rounded-md border border-[#EDE8E3] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[#6E6263]">Ερώτηση {index + 1}</p>
            <button
              type="button"
              className="text-[11px] text-[#C43D41]"
              onClick={() => onChange(questions.filter((_, i) => i !== index))}
            >
              Αφαίρεση
            </button>
          </div>
          <input
            className={inputClass}
            placeholder="Ερώτηση"
            value={question.q}
            onChange={(e) => update(index, { q: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Emoji"
            value={question.emoji}
            onChange={(e) => update(index, { emoji: e.target.value })}
          />
          {question.options.map((option, optIndex) => (
            <label key={optIndex} className="flex items-center gap-2">
              <input
                type="radio"
                name={`quiz-correct-${index}`}
                checked={question.correct === optIndex}
                onChange={() => update(index, { correct: optIndex })}
                className="accent-[#C4993D]"
              />
              <input
                className={inputClass}
                placeholder={`Απάντηση ${optIndex + 1}`}
                value={option}
                onChange={(e) => {
                  const options = [...question.options];
                  options[optIndex] = e.target.value;
                  update(index, { options });
                }}
              />
            </label>
          ))}
          <p className="text-[11px] text-[#9C9293]">Επιλέξτε την σωστή απάντηση.</p>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...questions, emptyQuizQuestion()])}
        className="rounded-md border border-[#C4993D] px-3 py-1.5 text-xs font-semibold text-[#C4993D]"
      >
        Προσθήκη ερώτησης
      </button>
    </div>
  );
}

export function WishesInbox({ wishes }: { wishes: GuestWishItem[] }) {
  if (wishes.length === 0) {
    return <p className="text-xs text-[#9C9293]">Δεν έχουν σταλεί ευχές ακόμα.</p>;
  }

  return (
    <div className="space-y-2">
      {wishes.map((wish, i) => (
        <div key={wish.id ?? `${wish.name}-${i}`} className="rounded-md border border-[#EDE8E3] p-3">
          <p className="text-sm font-semibold text-[#1C1516]">{wish.name}</p>
          <p className="mt-1 text-sm italic text-[#6E6263]">“{wish.message}”</p>
        </div>
      ))}
    </div>
  );
}

export { labelClass, inputClass };

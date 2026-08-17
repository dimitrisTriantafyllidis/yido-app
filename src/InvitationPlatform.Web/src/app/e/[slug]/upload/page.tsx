"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function GuestPhotoUploadPage() {
  const params = useParams();
  const slug = params.slug as string;
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [guestName, setGuestName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/public/invitations/${slug}/guest-upload`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setEnabled(!!data.enabled);
        setTitle(data.title ?? "");
      })
      .catch(() => {
        setEnabled(false);
        setError("Η εκδήλωση δεν βρέθηκε.");
      });
  }, [slug]);

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      setError(null);
      setMessage(null);

      let ok = 0;
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        if (guestName.trim()) form.append("guestName", guestName.trim());

        try {
          const res = await fetch(
            `${API_BASE}/api/v1/public/invitations/${slug}/guest-photos`,
            { method: "POST", body: form }
          );
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.title ?? body?.message ?? "Αποτυχία ανεβάσματος");
          }
          ok += 1;
        } catch (e) {
          setError(e instanceof Error ? e.message : "Αποτυχία ανεβάσματος");
        }
      }

      if (ok > 0) {
        setUploadedCount((c) => c + ok);
        setMessage(
          ok === 1
            ? "Η φωτογραφία στάλθηκε. Ευχαριστούμε!"
            : `${ok} φωτογραφίες στάλθηκαν. Ευχαριστούμε!`
        );
      }
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [slug, guestName]
  );

  if (enabled === null) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#FAFAF7] text-[#2E5A4C]">
        Φόρτωση…
      </main>
    );
  }

  if (!enabled) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#FAFAF7] px-6">
        <p className="text-center text-[#5a5a5a] max-w-sm">
          {error ?? "Το ανέβασμα φωτογραφιών από καλεσμένους δεν είναι ενεργό για αυτή την εκδήλωση."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#FAFAF7] text-[#1a1a1a] px-6 py-12">
      <div className="mx-auto max-w-md">
        <p className="text-xs uppercase tracking-widest text-[#2E5A4C]/80 mb-2">
          Κοινή γκαλερί
        </p>
        <h1 className="font-serif text-3xl text-[#2E5A4C] mb-2">{title || "Εκδήλωση"}</h1>
        <p className="text-sm text-[#5a5a5a] mb-8">
          Ανεβάστε τις φωτογραφίες σας από την εκδήλωση. Οι διοργανωτές θα τις δουν και μπορούν να τις κατεβάσουν.
        </p>

        <label className="block text-sm font-medium mb-1">Το όνομά σας (προαιρετικό)</label>
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full mb-6 rounded-lg border border-[#d4d4d0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2E5A4C]"
          placeholder="π.χ. Μαρία"
          maxLength={100}
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          capture="environment"
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg bg-[#2E5A4C] text-white py-3.5 text-sm font-medium disabled:opacity-50"
        >
          {uploading ? "Ανέβασμα…" : "Επιλογή / λήψη φωτογραφιών"}
        </button>

        <p className="mt-3 text-xs text-[#8a8a8a] text-center">
          JPEG / PNG / WebP · έως 10 MB η κάθε μία
          {uploadedCount > 0 ? ` · Στάλθηκαν: ${uploadedCount}` : ""}
        </p>

        {message && (
          <p className="mt-6 rounded-lg bg-[#e8f0ec] text-[#2E5A4C] text-sm px-4 py-3 text-center">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 text-center">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

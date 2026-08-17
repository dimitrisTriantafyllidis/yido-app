"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";

interface MediaItem {
  id: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  mediaType: string;
  altText: string | null;
  sortOrder: number;
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
  isGuestUpload?: boolean;
  isModerated?: boolean;
  isFlagged?: boolean;
  guestDisplayName?: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type Tab = "owner" | "guest";

export default function GalleryPage() {
  const params = useParams();
  const eventId = params.id as string;
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("owner");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const source = tab === "guest" ? "guest" : "owner";
      const data = await api<MediaItem[]>(
        `/api/v1/events/${eventId}/media?source=${source}`
      );
      setMedia(data);
    } finally {
      setLoading(false);
    }
  }, [eventId, tab]);

  useEffect(() => {
    setLoading(true);
    fetchMedia();
  }, [fetchMedia]);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_BASE}/api/v1/events/${eventId}/media`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new ApiError(res.status, body);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          const body = err.body as { message?: string; title?: string } | null;
          setError(
            body?.title ??
              body?.message ??
              (err.status === 403
                ? "Το πακέτο σας δεν περιλαμβάνει αυτή τη δυνατότητα."
                : "Αποτυχία ανεβάσματος")
          );
        } else {
          setError("Αποτυχία ανεβάσματος");
        }
      }
    }

    setUploading(false);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    fetchMedia();
  }

  async function handleDelete(mediaId: string) {
    if (!confirm("Διαγραφή αυτού του αρχείου;")) return;
    await api(`/api/v1/events/${eventId}/media/${mediaId}`, { method: "DELETE" });
    fetchMedia();
  }

  async function approve(id: string) {
    await api(`/api/v1/events/${eventId}/media/${id}/approve`, { method: "POST" });
    fetchMedia();
  }

  async function reject(id: string) {
    await api(`/api/v1/events/${eventId}/media/${id}/reject`, { method: "POST" });
    fetchMedia();
  }

  async function downloadZip() {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/events/${eventId}/media/guest-photos/zip`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.title ?? "Αποτυχία λήψης");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "guest-photos.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Αποτυχία λήψης ZIP");
    }
  }

  async function downloadUploadQr() {
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
        "Δεν ήταν δυνατή η λήψη QR. Απαιτείται Video ή το add-on «Φωτογραφίες καλεσμένων» και δημοσιευμένη πρόσκληση."
      );
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const pdfs = media.filter((m) => m.mediaType === "Pdf");
  const visuals = media.filter((m) => m.mediaType !== "Pdf");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="text-sm text-[#2E5A4C] hover:underline"
        >
          &larr; Πίσω στην εκδήλωση
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Γκαλερί & αρχεία</h1>
          <p className="text-sm text-gray-500 mt-1">
            Διαχείριση μέσων και φωτογραφιών καλεσμένων
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === "owner" && (
            <>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={(e) => uploadFiles(e.target.files)}
                className="hidden"
              />
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => uploadFiles(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => mediaInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-[#2E5A4C] text-white text-sm font-medium rounded-lg hover:bg-[#234a3d] disabled:opacity-50 cursor-pointer"
              >
                {uploading ? "Ανέβασμα..." : "Ανέβασμα φωτο/βίντεο"}
              </button>
              <button
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-[#2E5A4C] text-[#2E5A4C] text-sm font-medium rounded-lg hover:bg-[#2E5A4C]/5 disabled:opacity-50 cursor-pointer"
              >
                Ανέβασμα PDF πρόσκλησης
              </button>
            </>
          )}
          {tab === "guest" && (
            <>
              <button
                onClick={downloadUploadQr}
                className="px-4 py-2 bg-[#2E5A4C] text-white text-sm font-medium rounded-lg hover:bg-[#234a3d] cursor-pointer"
              >
                QR ανεβάσματος καλεσμένων
              </button>
              <button
                onClick={downloadZip}
                className="px-4 py-2 border border-[#2E5A4C] text-[#2E5A4C] text-sm font-medium rounded-lg hover:bg-[#2E5A4C]/5 cursor-pointer"
              >
                Λήψη όλων (ZIP)
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("owner")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px cursor-pointer ${
            tab === "owner"
              ? "border-[#2E5A4C] text-[#2E5A4C]"
              : "border-transparent text-gray-500"
          }`}
        >
          Δικά σας αρχεία
        </button>
        <button
          type="button"
          onClick={() => setTab("guest")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px cursor-pointer ${
            tab === "guest"
              ? "border-[#2E5A4C] text-[#2E5A4C]"
              : "border-transparent text-gray-500"
          }`}
        >
          Φωτογραφίες καλεσμένων
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 py-12 text-center">Φόρτωση...</div>
      ) : tab === "guest" ? (
        <section>
          <p className="text-sm text-gray-500 mb-4">
            Οι καλεσμένοι σκανάρουν το QR και ανεβάζουν στο{" "}
            <code className="text-xs">/e/&#123;slug&#125;/upload</code>. Μπορείτε να
            εγκρίνετε για εμφάνιση στην πρόσκληση, να απορρίψετε ή να κατεβάσετε.
          </p>
          {media.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-400">
              Δεν υπάρχουν φωτογραφίες καλεσμένων ακόμα.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl ?? item.url}
                      alt={item.originalFileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="text-xs text-gray-700 truncate">
                      {item.guestDisplayName || item.originalFileName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.isFlagged
                        ? "Απορρίφθηκε"
                        : item.isModerated
                          ? "Εγκεκριμένη"
                          : "Σε αναμονή"}{" "}
                      · {formatSize(item.fileSizeBytes)}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <a
                        href={item.url}
                        download={item.originalFileName}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#2E5A4C] underline"
                      >
                        Λήψη
                      </a>
                      {!item.isModerated && !item.isFlagged && (
                        <button
                          type="button"
                          onClick={() => approve(item.id)}
                          className="text-xs text-green-700 underline cursor-pointer"
                        >
                          Έγκριση
                        </button>
                      )}
                      {!item.isFlagged && (
                        <button
                          type="button"
                          onClick={() => reject(item.id)}
                          className="text-xs text-red-600 underline cursor-pointer"
                        >
                          Απόρριψη
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-gray-500 underline cursor-pointer"
                      >
                        Διαγραφή
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Εκτυπώσιμη πρόσκληση (PDF)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Απαιτεί πακέτο Digital ή Video. Εμφανίζεται στο δημόσιο link ως λήψη.
            </p>
            {pdfs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-400">
                Δεν υπάρχει PDF ακόμα.
              </div>
            ) : (
              <ul className="space-y-2">
                {pdfs.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.originalFileName}
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF · {formatSize(item.fileSizeBytes)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#2E5A4C] underline"
                      >
                        Προβολή
                      </a>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-600 hover:underline cursor-pointer"
                      >
                        Διαγραφή
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Φωτογραφίες & βίντεο
            </h2>
            {visuals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-2">Δεν υπάρχουν αρχεία ακόμα</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visuals.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-100">
                      {item.mediaType === "Video" ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl ?? item.url}
                          alt={item.altText ?? item.originalFileName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-700 truncate">
                        {item.originalFileName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.mediaType} · {formatSize(item.fileSizeBytes)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer text-sm"
                      title="Διαγραφή"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

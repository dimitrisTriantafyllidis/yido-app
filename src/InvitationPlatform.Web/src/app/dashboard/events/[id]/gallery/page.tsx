"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMediaType(mediaType: string): string {
  if (mediaType === "Video") return "Video";
  if (mediaType === "Pdf") return "PDF";
  return "Image";
}

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

  const pdfs = media.filter((m) => m.mediaType === "Pdf");
  const visuals = media.filter((m) => m.mediaType !== "Pdf");

  return (
    <main className="flex flex-col gap-8 px-6 py-10 pb-12 md:px-12">
      <section className="flex flex-col gap-3">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#C4993D] transition-colors hover:text-[#A87D2C]"
        >
          <DashboardIcon name="arrow-left" className="size-3.5" />
          Πίσω στην εκδήλωση
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[32px] text-[#1C1516]">Γκαλερί & αρχεία</h1>
            <p className="text-sm text-[#6E6263]">
              Διαχείριση μέσων και φωτογραφιών καλεσμένων
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {tab === "owner" ? (
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
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg bg-[#C4993D] px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#B38935] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <DashboardIcon name="images" className="size-4 text-white" />
                  {uploading ? "Ανέβασμα..." : "Ανέβασμα φωτο/βίντεο"}
                </button>
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg border border-[#EDE8E3] bg-[#F9F8F6] px-4 py-3 text-[13px] font-semibold text-[#C4993D] transition-colors hover:border-[#C4993D]/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <DashboardIcon name="file-text" className="size-4" />
                  Ανέβασμα PDF πρόσκλησης
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={downloadUploadQr}
                  className="flex items-center gap-2 rounded-lg bg-[#C4993D] px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#B38935]"
                >
                  <DashboardIcon name="qr-code" className="size-4 text-white" />
                  QR ανεβάσματος καλεσμένων
                </button>
                <button
                  type="button"
                  onClick={downloadZip}
                  className="flex items-center gap-2 rounded-lg border border-[#EDE8E3] bg-[#F9F8F6] px-4 py-3 text-[13px] font-semibold text-[#C4993D] transition-colors hover:border-[#C4993D]/40"
                >
                  <DashboardIcon name="download" className="size-4" />
                  Λήψη όλων (ZIP)
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="flex gap-6 border-b border-[#EDE8E3]">
        <button
          type="button"
          onClick={() => setTab("owner")}
          className={`pb-2 text-sm transition-colors ${
            tab === "owner"
              ? "border-b-2 border-[#C4993D] font-semibold text-[#C4993D]"
              : "font-normal text-[#6E6263] hover:text-[#1C1516]"
          }`}
        >
          Δικά σας αρχεία
        </button>
        <button
          type="button"
          onClick={() => setTab("guest")}
          className={`pb-2 text-sm transition-colors ${
            tab === "guest"
              ? "border-b-2 border-[#C4993D] font-semibold text-[#C4993D]"
              : "font-normal text-[#6E6263] hover:text-[#1C1516]"
          }`}
        >
          Φωτογραφίες καλεσμένων
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-[#FBE4E4] bg-[#FDF0F0] px-4 py-3 text-sm text-[#A82020]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
        </div>
      ) : tab === "guest" ? (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-wide text-[#6E6263]">
              Φωτογραφίες καλεσμένων
            </h2>
            <p className="mt-1 text-[13px] text-[#9C9293]">
              Οι καλεσμένοι σκανάρουν το QR και ανεβάζουν στο{" "}
              <code className="text-xs">/e/&#123;slug&#125;/upload</code>. Μπορείτε να
              εγκρίνετε, να απορρίψετε ή να κατεβάσετε.
            </p>
          </div>

          {media.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-[#EDE8E3] bg-white p-8">
              <p className="text-sm text-[#6E6263]">
                Δεν υπάρχουν φωτογραφίες καλεσμένων ακόμα.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {media.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onDelete={() => handleDelete(item.id)}
                  guest
                  moderation={
                    item.isFlagged
                      ? "Απορρίφθηκε"
                      : item.isModerated
                        ? "Εγκεκριμένη"
                        : "Σε αναμονή"
                  }
                  onApprove={
                    !item.isModerated && !item.isFlagged
                      ? () => approve(item.id)
                      : undefined
                  }
                  onReject={!item.isFlagged ? () => reject(item.id) : undefined}
                  displayName={item.guestDisplayName || item.originalFileName}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold uppercase tracking-wide text-[#6E6263]">
                Εκτυπώσιμη πρόσκληση (PDF)
              </h2>
              <p className="mt-1 text-[13px] text-[#9C9293]">
                Ιδανικό εάν έχετε Digital ή Video. Εμφανίζεται στη δημόσια σελίδα σας.
              </p>
            </div>

            {pdfs.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-[#EDE8E3] bg-white p-8">
                <p className="text-sm text-[#6E6263]">Δεν υπάρχει PDF ακόμα</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pdfs.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#EDE8E3] bg-white px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1C1516]">
                        {item.originalFileName}
                      </p>
                      <p className="text-[11px] text-[#9C9293]">
                        PDF · {formatSize(item.fileSizeBytes)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[13px] font-medium text-[#C4993D] hover:text-[#A87D2C]"
                      >
                        Προβολή
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-[13px] font-medium text-[#A82020] hover:underline"
                      >
                        Διαγραφή
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold uppercase tracking-wide text-[#6E6263]">
              Φωτογραφίες & βίντεο
            </h2>

            {visuals.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-[#EDE8E3] bg-white p-8">
                <p className="text-sm text-[#6E6263]">Δεν υπάρχουν αρχεία ακόμα</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {visuals.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function MediaCard({
  item,
  onDelete,
  guest = false,
  displayName,
  moderation,
  onApprove,
  onReject,
}: {
  item: MediaItem;
  onDelete: () => void;
  guest?: boolean;
  displayName?: string;
  moderation?: string;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const title = displayName ?? item.originalFileName;

  return (
    <div className="group w-[240px] overflow-hidden rounded-xl border border-[#EDE8E3] bg-white">
      <div className="relative h-[160px] bg-[#F9F8F6]">
        {item.mediaType === "Video" ? (
          <video
            src={item.url}
            className="size-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : item.mediaType === "Pdf" ? (
          <div className="flex size-full items-center justify-center">
            <DashboardIcon name="file-text" className="size-10 text-[#C4993D]" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl ?? item.url}
            alt={item.altText ?? item.originalFileName}
            className="size-full object-cover"
          />
        )}
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-[#A82020] opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          title="Διαγραφή"
          aria-label="Διαγραφή"
        >
          <DashboardIcon name="trash" className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-sm font-semibold text-[#1C1516]">{title}</p>
        <p className="text-[11px] text-[#9C9293]">
          {formatMediaType(item.mediaType)} · {formatSize(item.fileSizeBytes)}
          {moderation ? ` · ${moderation}` : ""}
        </p>

        {guest ? (
          <div className="mt-1 flex flex-wrap gap-2 pt-1">
            <a
              href={item.url}
              download={item.originalFileName}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-[#C4993D] hover:text-[#A87D2C]"
            >
              Λήψη
            </a>
            {onApprove ? (
              <button
                type="button"
                onClick={onApprove}
                className="text-[11px] font-medium text-[#1B5E3A] hover:underline"
              >
                Έγκριση
              </button>
            ) : null}
            {onReject ? (
              <button
                type="button"
                onClick={onReject}
                className="text-[11px] font-medium text-[#A82020] hover:underline"
              >
                Απόρριψη
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

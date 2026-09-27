"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  Download,
  GripVertical,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { api, ApiError, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface GuestRow {
  id: string;
  firstName: string;
  lastName: string;
  eventTableId: string | null;
  tableName: string | null;
  seatIndex: number | null;
  allowedPlusOnes: number;
}

interface TableGuest {
  id: string;
  firstName: string;
  lastName: string;
  seatIndex: number | null;
  allowedPlusOnes: number;
}

interface EventTableRow {
  id: string;
  name: string;
  categoryLabel: string | null;
  capacity: number;
  sortOrder: number;
  guests: TableGuest[];
}

interface EventInfo {
  id: string;
  title: string;
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

function seatPositions(capacity: number, radius = 58) {
  const cx = 70;
  const cy = 72;
  return Array.from({ length: capacity }, (_, i) => {
    const angle = (Math.PI * 2 * i) / capacity - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      index: i,
    };
  });
}

export function SeatingPlanner({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [tables, setTables] = useState<EventTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [error, setError] = useState("");
  const [dragGuestId, setDragGuestId] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuestFirst, setNewGuestFirst] = useState("");
  const [newGuestLast, setNewGuestLast] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [evt, guestList, tableList] = await Promise.all([
        api<EventInfo>(`/api/v1/events/${eventId}`),
        api<GuestRow[]>(`/api/v1/events/${eventId}/guests`),
        api<EventTableRow[]>(`/api/v1/events/${eventId}/tables`),
      ]);
      setEvent(evt);
      setGuests(guestList);
      setTables(tableList);
      setForbidden(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
      } else {
        setError(err instanceof ApiError ? getApiErrorMessage(err) : "Σφάλμα φόρτωσης");
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) =>
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(q)
    );
  }, [guests, search]);

  const total = guests.length;
  const seated = guests.filter((g) => g.eventTableId).length;
  const left = total - seated;

  const assignGuest = async (guestId: string, tableId: string) => {
    setError("");
    try {
      await api(`/api/v1/events/${eventId}/tables/${tableId}/assign`, {
        method: "POST",
        body: JSON.stringify({ guestId }),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? getApiErrorMessage(err) : "Αποτυχία ανάθεσης");
    }
  };

  const unassignGuest = async (guestId: string) => {
    setError("");
    try {
      await api(`/api/v1/events/${eventId}/tables/unassign`, {
        method: "POST",
        body: JSON.stringify({ guestId }),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? getApiErrorMessage(err) : "Αποτυχία");
    }
  };

  const addTable = async () => {
    setError("");
    try {
      await api(`/api/v1/events/${eventId}/tables`, {
        method: "POST",
        body: JSON.stringify({ capacity: 8 }),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? getApiErrorMessage(err) : "Αποτυχία");
    }
  };

  const deleteTable = async (tableId: string) => {
    if (!confirm("Διαγραφή τραπεζιού; Οι καλεσμένοι θα γίνουν μη ανατεθειμένοι.")) return;
    await api(`/api/v1/events/${eventId}/tables/${tableId}`, { method: "DELETE" });
    await load();
  };

  const saveTableEdit = async (tableId: string) => {
    await api(`/api/v1/events/${eventId}/tables/${tableId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: editName.trim(),
        categoryLabel: editCategory.trim(),
      }),
    });
    setEditingTableId(null);
    await load();
  };

  const addGuest = async () => {
    if (!newGuestFirst.trim() || !newGuestLast.trim()) return;
    await api(`/api/v1/events/${eventId}/guests`, {
      method: "POST",
      body: JSON.stringify({
        firstName: newGuestFirst.trim(),
        lastName: newGuestLast.trim(),
        isCeremonyOnly: false,
        isReceptionEligible: true,
        allowedPlusOnes: 0,
      }),
    });
    setNewGuestFirst("");
    setNewGuestLast("");
    setShowAddGuest(false);
    await load();
  };

  const deleteGuest = async (guestId: string) => {
    if (!confirm("Διαγραφή καλεσμένου;")) return;
    await api(`/api/v1/events/${eventId}/guests/${guestId}`, { method: "DELETE" });
    await load();
  };

  const exportPlan = async () => {
    const res = await fetch(`${API_BASE}/api/v1/events/${eventId}/tables/export.xlsx`, {
      credentials: "include",
    });
    if (!res.ok) {
      setError("Αποτυχία εξαγωγής");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seating-${eventId}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F8F6]">
        <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#F9F8F6]">
        <header className="flex min-h-[56px] items-center justify-between border-b border-white/[0.04] bg-[#3A1112] px-4 py-3 md:min-h-[72px] md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-display text-[32px] text-white">YIDO</span>
            <span className="size-1.5 rounded-[3px] bg-[#C4993D]" />
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#A38B8E]">
              PRO
            </span>
          </Link>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/events/${eventId}`)}
            className="text-sm text-[#A38B8E] hover:text-white"
          >
            ← Πίσω
          </button>
        </header>
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-3xl text-[#1C1516]">Κατανομή τραπεζιών</h1>
          <p className="mt-3 text-sm text-[#6E6263]">
            Η διαχείριση θέσεων περιλαμβάνεται μόνο στο πακέτο Video (μέγιστο). Αναβαθμίστε για
            να οργανώσετε τραπέζια με drag &amp; drop.
          </p>
          <Link
            href={`/dashboard/events/${eventId}/pricing`}
            className="mt-6 rounded-lg bg-[#C4993D] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Δείτε πακέτα
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F9F8F6]">
      {/* Top nav — Figma 53:4 */}
      <header className="flex min-h-[56px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.04] bg-[#3A1112] px-4 py-3 md:min-h-[72px] md:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <span className="font-display text-[32px] leading-none text-white">YIDO</span>
            <span className="size-1.5 rounded-[3px] bg-[#C4993D]" aria-hidden />
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#A38B8E]">
              PRO
            </span>
          </Link>
          <span className="hidden h-7 w-px bg-white/15 sm:block" aria-hidden />
          <div className="hidden min-w-0 items-center gap-2 sm:flex">
            <Link
              href="/dashboard"
              className="shrink-0 text-sm font-medium text-[#A38B8E] hover:text-white"
            >
              Events
            </Link>
            <span className="text-[#A38B8E]">›</span>
            <Link
              href={`/dashboard/events/${eventId}`}
              className="truncate text-[15px] font-semibold text-white hover:text-[#C4993D]"
            >
              {event?.title ?? "…"}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={exportPlan}
            className="inline-flex items-center gap-2 rounded-lg border border-[#EDE8E3]/30 bg-[#C4993D] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_6px_rgba(196,153,61,0.2)] transition-colors hover:bg-[#B38935]"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Export Plan</span>
          </button>
          <span className="hidden h-6 w-px bg-white/15 md:block" aria-hidden />
          <div className="hidden items-center gap-2 md:flex">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#C4993D]/25 text-xs font-semibold text-[#C4993D]">
              {(user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") || "Y"}
            </span>
            <span className="max-w-[160px] truncate text-sm font-medium text-white">
              {user?.email}
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/events/${eventId}`)}
            className="rounded-md p-1.5 text-[#A38B8E] hover:bg-white/10 hover:text-white"
            aria-label="Κλείσιμο"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {error ? (
        <div className="border-b border-[#F5C6C7] bg-[#FDF2F2] px-4 py-2 text-sm text-[#C43D41]">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        {/* Left guest sidebar */}
        <aside className="flex w-full max-w-[340px] shrink-0 flex-col border-r border-[#EDE8E3] bg-white">
          <div className="space-y-3 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9C9293]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Αναζήτηση καλεσμένων…"
                className="w-full rounded-lg border border-[#EDE8E3] bg-[#F9F8F6] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#C4993D]"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAddGuest((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C4993D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B38935]"
            >
              <Plus className="size-4" />
              Προσθήκη
            </button>
            {showAddGuest ? (
              <div className="space-y-2 rounded-lg border border-[#EDE8E3] p-3">
                <input
                  className="w-full rounded-md border border-[#EDE8E3] px-2 py-1.5 text-sm"
                  placeholder="Όνομα"
                  value={newGuestFirst}
                  onChange={(e) => setNewGuestFirst(e.target.value)}
                />
                <input
                  className="w-full rounded-md border border-[#EDE8E3] px-2 py-1.5 text-sm"
                  placeholder="Επώνυμο"
                  value={newGuestLast}
                  onChange={(e) => setNewGuestLast(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addGuest}
                  className="w-full rounded-md bg-[#3A1112] py-1.5 text-xs font-semibold text-white"
                >
                  Αποθήκευση
                </button>
              </div>
            ) : null}
          </div>

          <div className="mx-5 mb-4 grid grid-cols-3 rounded-xl border border-[#EDE8E3] bg-[#F9F8F6] px-2 py-3 text-center">
            <div>
              <p className="text-lg font-bold text-[#1C1516]">{total}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9C9293]">
                Σύνολο
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#1B5E3A]">{seated}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9C9293]">
                Καθισμένοι
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#C4993D]">{left}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9C9293]">
                Υπόλοιπο
              </p>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/guest-id") || dragGuestId;
              if (id) await unassignGuest(id);
              setDragGuestId(null);
            }}
          >
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#9C9293]">
              Καλεσμένοι ({filteredGuests.length})
            </p>
            <div className="space-y-2">
              {filteredGuests.map((g) => {
                const seatedAt = g.eventTableId
                  ? tables.find((t) => t.id === g.eventTableId)?.name ?? g.tableName
                  : null;
                return (
                  <div
                    key={g.id}
                    draggable
                    onDragStart={(e) => {
                      setDragGuestId(g.id);
                      e.dataTransfer.setData("text/guest-id", g.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDragGuestId(null)}
                    className="flex cursor-grab items-center gap-2 rounded-xl border border-[#EDE8E3] bg-white px-3 py-3 active:cursor-grabbing"
                  >
                    <GripVertical className="size-4 shrink-0 text-[#C4BBB8]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1C1516]">
                        {g.firstName} {g.lastName}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          seatedAt
                            ? "bg-[#E3F3EA] text-[#1B5E3A]"
                            : "bg-[#F0ECE8] text-[#6E6263]"
                        }`}
                      >
                        {seatedAt ?? "Χωρίς τραπέζι"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteGuest(g.id)}
                      className="rounded-md p-1.5 text-[#9C9293] hover:bg-[#FDF2F2] hover:text-[#C43D41]"
                      aria-label="Διαγραφή"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main canvas */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EDE8E3] px-6 py-5 md:px-8">
            <div>
              <h1 className="font-display text-[28px] text-[#1C1516]">Κατανομή θέσεων</h1>
              <p className="mt-1 text-sm text-[#6E6263]">
                Σύρετε καλεσμένους από την αριστερή λίστα στα τραπέζια.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border border-[#EDE8E3] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                    view === "grid"
                      ? "bg-[#3A1112] text-white"
                      : "text-[#6E6263] hover:bg-[#F9F8F6]"
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                  Πλέγμα
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                    view === "list"
                      ? "bg-[#3A1112] text-white"
                      : "text-[#6E6263] hover:bg-[#F9F8F6]"
                  }`}
                >
                  <List className="size-3.5" />
                  Λίστα
                </button>
              </div>
              <button
                type="button"
                onClick={addTable}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C4993D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B38935]"
              >
                <Plus className="size-4" />
                Προσθήκη τραπεζιού
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
            {tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#C4BBB8] bg-white px-6 py-20 text-center">
                <p className="text-sm text-[#6E6263]">Δεν υπάρχουν τραπέζια ακόμα.</p>
                <button
                  type="button"
                  onClick={addTable}
                  className="mt-4 rounded-lg bg-[#C4993D] px-4 py-2 text-sm font-semibold text-white"
                >
                  Προσθήκη πρώτου τραπεζιού
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    dragGuestId={dragGuestId}
                    editing={editingTableId === table.id}
                    editName={editName}
                    editCategory={editCategory}
                    onEditStart={() => {
                      setEditingTableId(table.id);
                      setEditName(table.name);
                      setEditCategory(table.categoryLabel ?? "");
                    }}
                    onEditName={setEditName}
                    onEditCategory={setEditCategory}
                    onEditSave={() => saveTableEdit(table.id)}
                    onEditCancel={() => setEditingTableId(null)}
                    onDelete={() => deleteTable(table.id)}
                    onDropGuest={(guestId) => assignGuest(guestId, table.id)}
                    onUnseat={(guestId) => unassignGuest(guestId)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="rounded-xl border border-[#EDE8E3] bg-white p-4"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("text/guest-id") || dragGuestId;
                      if (id) assignGuest(id, table.id);
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#1C1516]">{table.name}</p>
                        <p className="text-xs text-[#9C9293]">
                          {table.guests.length}/{table.capacity} ·{" "}
                          {table.categoryLabel || "Χωρίς κατηγορία"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTable(table.id)}
                        className="text-[#9C9293] hover:text-[#C43D41]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {table.guests.length === 0 ? (
                        <span className="text-xs text-[#9C9293]">Κενό — σύρετε καλεσμένους εδώ</span>
                      ) : (
                        table.guests.map((g) => (
                          <span
                            key={g.id}
                            className="inline-flex items-center gap-1 rounded-full bg-[#F9F8F6] px-2.5 py-1 text-xs font-medium text-[#1C1516]"
                          >
                            {g.firstName} {g.lastName}
                            <button
                              type="button"
                              onClick={() => unassignGuest(g.id)}
                              className="text-[#9C9293] hover:text-[#C43D41]"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom summary */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDE8E3] bg-white px-6 py-4 md:px-8">
            <p className="text-sm text-[#6E6263]">
              Σύνολο: <strong className="text-[#1C1516]">{total} καλεσμένοι</strong>
              {" · "}
              <strong className="text-[#1C1516]">{tables.length} τραπέζια</strong>
              {" · "}
              <strong className="text-[#1C1516]">{seated} καθισμένοι</strong>
              {" · "}
              <strong className="text-[#C4993D]">{left} υπόλοιπο</strong>
            </p>
            <p className="hidden text-xs text-[#9C9293] lg:block">
              Προτείνουμε έως 8–10 άτομα ανά τραπέζι για άνετη διάταξη.
            </p>
            <button
              type="button"
              onClick={exportPlan}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C4993D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B38935]"
            >
              <Check className="size-4" />
              Οριστικοποίηση &amp; εξαγωγή
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}

function TableCard({
  table,
  dragGuestId,
  editing,
  editName,
  editCategory,
  onEditStart,
  onEditName,
  onEditCategory,
  onEditSave,
  onEditCancel,
  onDelete,
  onDropGuest,
  onUnseat,
}: {
  table: EventTableRow;
  dragGuestId: string | null;
  editing: boolean;
  editName: string;
  editCategory: string;
  onEditStart: () => void;
  onEditName: (v: string) => void;
  onEditCategory: (v: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onDropGuest: (guestId: string) => void;
  onUnseat: (guestId: string) => void;
}) {
  const filled = table.guests.length;
  const remaining = table.capacity - filled;
  const full = remaining <= 0;
  const empty = filled === 0;
  const seats = seatPositions(table.capacity);
  const bySeat = new Map(
    table.guests
      .filter((g) => g.seatIndex != null)
      .map((g) => [g.seatIndex!, g] as const)
  );

  return (
    <div
      className="flex flex-col rounded-2xl border border-[#EDE8E3] bg-white p-5 shadow-sm"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/guest-id") || dragGuestId;
        if (id) onDropGuest(id);
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={editName}
                onChange={(e) => onEditName(e.target.value)}
                className="w-full rounded-md border border-[#EDE8E3] px-2 py-1 text-sm font-semibold"
              />
              <input
                value={editCategory}
                onChange={(e) => onEditCategory(e.target.value)}
                placeholder="Κατηγορία (π.χ. Οικογένεια)"
                className="w-full rounded-md border border-[#EDE8E3] px-2 py-1 text-xs"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onEditSave}
                  className="rounded bg-[#C4993D] px-2 py-1 text-[11px] font-semibold text-white"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={onEditCancel}
                  className="rounded border border-[#EDE8E3] px-2 py-1 text-[11px]"
                >
                  Άκυρο
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-base font-semibold text-[#1C1516]">{table.name}</h3>
              <p className="text-xs text-[#9C9293]">
                {table.categoryLabel || "Χωρίς κατηγορία"}
              </p>
            </>
          )}
        </div>
        {!editing ? (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={onEditStart}
              className="rounded-md p-1.5 text-[#9C9293] hover:bg-[#F9F8F6] hover:text-[#1C1516]"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md p-1.5 text-[#9C9293] hover:bg-[#FDF2F2] hover:text-[#C43D41]"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative mx-auto mb-4 flex h-[172px] w-full max-w-[288px] items-center justify-center">
        {empty ? (
          <div className="flex h-[140px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#C4BBB8] bg-[#F9F8F6] text-center">
            <p className="text-xs font-medium text-[#9C9293]">Σύρετε καλεσμένους εδώ</p>
            <p className="mt-1 text-[10px] text-[#C4BBB8]">Κενό τραπέζι</p>
          </div>
        ) : (
          <svg viewBox="0 0 140 144" className="h-[140px] w-[140px]">
            <circle cx="70" cy="72" r="35" fill="#F9F8F6" stroke="#EDE8E3" strokeWidth="2" />
            <text
              x="70"
              y="70"
              textAnchor="middle"
              className="fill-[#1C1516]"
              style={{ fontSize: 11, fontWeight: 700 }}
            >
              {filled}/{table.capacity}
            </text>
            <text
              x="70"
              y="84"
              textAnchor="middle"
              className="fill-[#9C9293]"
              style={{ fontSize: 7, fontWeight: 600, letterSpacing: 1 }}
            >
              ΘΕΣΕΙΣ
            </text>
            {seats.map((s) => {
              const guest = bySeat.get(s.index);
              if (guest) {
                return (
                  <g key={s.index}>
                    <circle cx={s.x} cy={s.y} r="12" fill="#C4993D" />
                    <text
                      x={s.x}
                      y={s.y + 3.5}
                      textAnchor="middle"
                      fill="white"
                      style={{ fontSize: 8, fontWeight: 700 }}
                    >
                      {initials(guest.firstName, guest.lastName)}
                    </text>
                    <title>
                      {guest.firstName} {guest.lastName}
                    </title>
                  </g>
                );
              }
              return (
                <circle
                  key={s.index}
                  cx={s.x}
                  cy={s.y}
                  r="12"
                  fill="none"
                  stroke="#D4CDC6"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              );
            })}
          </svg>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <p
          className={`text-xs font-medium ${
            full ? "text-[#1B5E3A]" : "text-[#6E6263]"
          }`}
        >
          {full
            ? "Γεμάτο"
            : empty
              ? `${table.capacity} διαθέσιμες θέσεις`
              : `${remaining} διαθέσιμες θέσεις`}
        </p>
        <div className="flex items-center">
          {table.guests.slice(0, 4).map((g, i) => (
            <button
              key={g.id}
              type="button"
              title={`${g.firstName} ${g.lastName} — κλικ για αφαίρεση`}
              onClick={() => onUnseat(g.id)}
              className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#C4993D] text-[8px] font-bold text-white"
              style={{ marginLeft: i === 0 ? 0 : -6 }}
            >
              {initials(g.firstName, g.lastName)}
            </button>
          ))}
          {table.guests.length > 4 ? (
            <span
              className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#EDE8E3] text-[8px] font-bold text-[#6E6263]"
              style={{ marginLeft: -6 }}
            >
              +{table.guests.length - 4}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SeatingPage() {
  const params = useParams();
  const eventId = params.id as string;
  return <SeatingPlanner eventId={eventId} />;
}

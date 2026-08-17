"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AdminEvent {
  id: string;
  title: string;
  eventType: string;
  status: string;
  slug: string | null;
  eventDate: string | null;
  createdAt: string;
  tenantName: string;
  tenantId: string;
  guestCount: number;
  rsvpCount: number;
}

interface PagedResult {
  items: AdminEvent[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminEventsPage() {
  const [data, setData] = useState<PagedResult | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("eventType", typeFilter);
      params.set("page", page.toString());
      const result = await api<PagedResult>(`/api/v1/admin/events?${params}`);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUnpublish(eventId: string) {
    if (!confirm("Unpublish αυτής της εκδήλωσης;")) return;
    await api(`/api/v1/admin/events/${eventId}/unpublish`, { method: "POST" });
    fetchData();
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Εκδηλώσεις</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Αναζήτηση..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#2E5A4C]/20 focus:border-[#2E5A4C]"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
        >
          <option value="">Όλες οι καταστάσεις</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
        >
          <option value="">Όλοι οι τύποι</option>
          <option value="Wedding">Wedding</option>
          <option value="Baptism">Baptism</option>
          <option value="Party">Party</option>
          <option value="Corporate">Corporate</option>
        </select>
        {data && (
          <span className="text-sm text-gray-500 self-center ml-auto">
            {data.total} εκδηλώσεις
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Τίτλος</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Πελάτης</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Τύπος</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Κατάσταση</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Guests</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">RSVPs</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ημ/νία</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Φόρτωση...</td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Δεν βρέθηκαν εκδηλώσεις
                </td>
              </tr>
            ) : (
              data?.items.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.title}</td>
                  <td className="px-4 py-3 text-gray-500">{e.tenantName}</td>
                  <td className="px-4 py-3 text-gray-500">{e.eventType}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded ${
                        e.status === "Published"
                          ? "bg-green-50 text-green-700"
                          : e.status === "Archived"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{e.guestCount}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{e.rsvpCount}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {e.eventDate ? new Date(e.eventDate).toLocaleDateString("el") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {e.status === "Published" && (
                      <button
                        onClick={() => handleUnpublish(e.id)}
                        className="text-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Unpublish
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
          >
            Προηγούμενη
          </button>
          <span className="text-sm text-gray-500">Σελίδα {page} από {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
          >
            Επόμενη
          </button>
        </div>
      )}
    </div>
  );
}

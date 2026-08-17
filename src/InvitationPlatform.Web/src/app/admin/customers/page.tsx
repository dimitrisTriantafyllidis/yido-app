"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  slug: string;
  status: string;
  locale: string;
  createdAt: string;
  eventCount: number;
}

interface PagedResult {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-50 text-green-700",
  Suspended: "bg-red-50 text-red-700",
  Closed: "bg-gray-100 text-gray-600",
};

export default function AdminCustomersPage() {
  const [data, setData] = useState<PagedResult | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      const result = await api<PagedResult>(`/api/v1/admin/customers?${params}`);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Πελάτες</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Αναζήτηση..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#2E5A4C]/20 focus:border-[#2E5A4C]"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5A4C]/20"
        >
          <option value="">Όλες οι καταστάσεις</option>
          <option value="Active">Ενεργοί</option>
          <option value="Suspended">Σε αναστολή</option>
          <option value="Closed">Κλειστοί</option>
        </select>
        {data && (
          <span className="text-sm text-gray-500 self-center ml-auto">
            {data.total} πελάτες
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Όνομα</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Κατάσταση</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Εκδηλώσεις</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ημ/νία</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Φόρτωση...
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Δεν βρέθηκαν πελάτες
                </td>
              </tr>
            ) : (
              data?.items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded ${
                        STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{c.eventCount}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString("el")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-xs text-[#2E5A4C] hover:underline"
                    >
                      Λεπτομέρειες
                    </Link>
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
          <span className="text-sm text-gray-500">
            Σελίδα {page} από {totalPages}
          </span>
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

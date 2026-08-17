"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AdminOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  orderType: string;
  paidAt: string | null;
  createdAt: string;
  tenantName: string;
  tenantId: string;
  subscriptionId: string | null;
}

interface PagedResult {
  items: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-green-50 text-green-700",
  Pending: "bg-yellow-50 text-yellow-700",
  Refunded: "bg-orange-50 text-orange-700",
  Failed: "bg-red-50 text-red-700",
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<PagedResult | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      const result = await api<PagedResult>(`/api/v1/admin/orders?${params}`);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRefund(orderId: string) {
    if (!confirm("Επιστροφή χρημάτων για αυτή την παραγγελία;")) return;
    await api(`/api/v1/admin/orders/${orderId}/refund`, { method: "POST" });
    fetchData();
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Παραγγελίες</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
        >
          <option value="">Όλες οι καταστάσεις</option>
          <option value="Pending">Εκκρεμείς</option>
          <option value="Paid">Πληρωμένες</option>
          <option value="Refunded">Επιστροφές</option>
          <option value="Failed">Αποτυχημένες</option>
        </select>
        {data && (
          <span className="text-sm text-gray-500 self-center ml-auto">
            {data.total} παραγγελίες
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Πελάτης</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Τύπος</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Ποσό</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Κατάσταση</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ημ/νία</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Φόρτωση...</td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Δεν βρέθηκαν παραγγελίες
                </td>
              </tr>
            ) : (
              data?.items.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {o.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.tenantName}</td>
                  <td className="px-4 py-3 text-gray-500">{o.orderType}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    {o.amount.toFixed(2)}€
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded ${
                        STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString("el")}
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "Paid" && (
                      <button
                        onClick={() => handleRefund(o.id)}
                        className="text-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Επιστροφή
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

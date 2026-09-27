"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSystemAdmin: boolean;
  isDeleted: boolean;
  lockoutEnd: string | null;
  createdAt: string;
  tenantCount: number;
  roles: string[];
}

interface PagedResult {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

function statusLabel(user: AdminUser): { text: string; className: string } {
  if (user.isDeleted) {
    return { text: "Διαγραμμένος", className: "bg-gray-100 text-gray-600" };
  }
  if (user.lockoutEnd && new Date(user.lockoutEnd) > new Date()) {
    return { text: "Κλειδωμένος", className: "bg-red-50 text-red-700" };
  }
  return { text: "Ενεργός", className: "bg-green-50 text-green-700" };
}

export default function AdminUsersPage() {
  const [data, setData] = useState<PagedResult | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());
      const result = await api<PagedResult>(`/api/v1/admin/users?${params}`);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Χρήστες</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Αναζήτηση email ή ονόματος..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#2E5A4C] focus:outline-none focus:ring-2 focus:ring-[#2E5A4C]/20 sm:w-72"
        />
        {data && (
          <span className="text-sm text-gray-500 self-center ml-auto">
            {data.total} χρήστες
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Όνομα</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ρόλοι</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Κατάσταση</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Tenants</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ημ/νία</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Φόρτωση...
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Δεν βρέθηκαν χρήστες
                </td>
              </tr>
            ) : (
              data?.items.map((u) => {
                const status = statusLabel(u);
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                      {u.isSystemAdmin && (
                        <span className="ml-2 text-xs text-[#2E5A4C]">Admin</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.roles.length > 0 ? u.roles.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {u.tenantCount}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("el")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs text-[#2E5A4C] hover:underline"
                      >
                        Λεπτομέρειες
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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

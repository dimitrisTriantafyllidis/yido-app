"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  locale: string;
  isSystemAdmin: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  lockoutEnd: string | null;
  accessFailedCount: number;
  createdAt: string;
  updatedAt: string | null;
  roles: string[];
  tenants: {
    tenantId: string;
    name: string;
    slug: string;
    status: string;
    isOwner: boolean;
    joinedAt: string;
  }[];
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [acting, setActing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await api<UserDetail>(`/api/v1/admin/users/${userId}`);
      setUser(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAction(action: "softDelete" | "restore" | "unlock") {
    setActionError("");
    setActing(true);
    try {
      await api(`/api/v1/admin/users/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ action }),
      });
      await fetchData();
    } catch {
      setActionError("Η ενέργεια απέτυχε. Δοκιμάστε ξανά.");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <div className="text-gray-500">Φόρτωση...</div>;
  if (!user) return <div className="text-red-500">Δεν βρέθηκε ο χρήστης</div>;

  const isLocked =
    !!user.lockoutEnd && new Date(user.lockoutEnd) > new Date();

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/users" className="text-sm text-[#2E5A4C] hover:underline">
          &larr; Πίσω στους χρήστες
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-gray-500">
            {user.email} &middot; {new Date(user.createdAt).toLocaleDateString("el")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user.isSystemAdmin && (
            <span className="text-xs px-2 py-1 rounded bg-[#2E5A4C]/10 text-[#2E5A4C]">
              System Admin
            </span>
          )}
          <span
            className={`text-xs px-2 py-1 rounded ${
              user.isDeleted
                ? "bg-gray-100 text-gray-600"
                : isLocked
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {user.isDeleted ? "Διαγραμμένος" : isLocked ? "Κλειδωμένος" : "Ενεργός"}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
        {!user.isDeleted && !user.isSystemAdmin && (
          <button
            type="button"
            disabled={acting}
            onClick={() => handleAction("softDelete")}
            className="px-3 py-1.5 text-sm border border-red-200 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 cursor-pointer"
          >
            Soft delete
          </button>
        )}
        {user.isDeleted && (
          <button
            type="button"
            disabled={acting}
            onClick={() => handleAction("restore")}
            className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Επαναφορά
          </button>
        )}
        {isLocked && (
          <button
            type="button"
            disabled={acting}
            onClick={() => handleAction("unlock")}
            className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Ξεκλείδωμα
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <section className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Προφίλ</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Locale</dt>
              <dd className="text-gray-900">{user.locale}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Failed logins</dt>
              <dd className="text-gray-900">{user.accessFailedCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Lockout end</dt>
              <dd className="text-gray-900">
                {user.lockoutEnd
                  ? new Date(user.lockoutEnd).toLocaleString("el")
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Deleted at</dt>
              <dd className="text-gray-900">
                {user.deletedAt
                  ? new Date(user.deletedAt).toLocaleString("el")
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Ρόλοι Identity</h2>
          {user.roles.length === 0 ? (
            <p className="text-sm text-gray-400">Κανένας ρόλος</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <li
                  key={role}
                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700"
                >
                  {role}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Συνδεδεμένοι tenants</h2>
        </div>
        {user.tenants.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">Κανένας tenant</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Όνομα</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Κατάσταση</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Owner</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {user.tenants.map((t) => (
                <tr key={t.tenantId}>
                  <td className="px-4 py-3 text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500">{t.slug}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{t.status}</td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {t.isOwner ? "Ναι" : "Όχι"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${t.tenantId}`}
                      className="text-xs text-[#2E5A4C] hover:underline"
                    >
                      Πελάτης
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

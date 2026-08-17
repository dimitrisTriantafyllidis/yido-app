"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface CustomerDetail {
  id: string;
  name: string;
  slug: string;
  status: string;
  locale: string;
  createdAt: string;
  events: {
    id: string;
    title: string;
    eventType: string;
    status: string;
    eventDate: string | null;
    createdAt: string;
  }[];
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    isOwner: boolean;
  }[];
  subscriptions: {
    id: string;
    eventId: string;
    packageName: string;
    packageTier: string;
    status: string;
    paidAmount: number | null;
    activatedAt: string | null;
    expiresAt: string | null;
  }[];
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const tenantId = params.id as string;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await api<CustomerDetail>(`/api/v1/admin/customers/${tenantId}`);
      setCustomer(data);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(newStatus: string) {
    await api(`/api/v1/admin/customers/${tenantId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  }

  if (loading) return <div className="text-gray-500">Φόρτωση...</div>;
  if (!customer) return <div className="text-red-500">Δεν βρέθηκε ο πελάτης</div>;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/customers" className="text-sm text-[#2E5A4C] hover:underline">
          &larr; Πίσω στους πελάτες
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-sm text-gray-500">
            {customer.slug} &middot; {new Date(customer.createdAt).toLocaleDateString("el")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              customer.status === "Active"
                ? "bg-green-50 text-green-700"
                : customer.status === "Suspended"
                ? "bg-red-50 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {customer.status}
          </span>
          {customer.status === "Active" && (
            <button
              onClick={() => handleStatusChange("Suspended")}
              className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
            >
              Αναστολή
            </button>
          )}
          {customer.status === "Suspended" && (
            <button
              onClick={() => handleStatusChange("Active")}
              className="text-xs px-3 py-1.5 border border-green-200 text-green-600 rounded-md hover:bg-green-50 cursor-pointer"
            >
              Ενεργοποίηση
            </button>
          )}
        </div>
      </div>

      {/* Users */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Χρήστες</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Όνομα</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Email</th>
                <th className="text-center px-4 py-2 font-medium text-gray-500">Ιδιοκτήτης</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Εγγραφή</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customer.users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-gray-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{u.email}</td>
                  <td className="px-4 py-2 text-center">
                    {u.isOwner ? (
                      <span className="text-green-600 text-xs">Ναι</span>
                    ) : (
                      <span className="text-gray-400 text-xs">Όχι</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("el")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Events */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Εκδηλώσεις ({customer.events.length})
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Τίτλος</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Τύπος</th>
                <th className="text-center px-4 py-2 font-medium text-gray-500">Κατάσταση</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Ημ/νία</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customer.events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    Δεν υπάρχουν εκδηλώσεις
                  </td>
                </tr>
              ) : (
                customer.events.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2 text-gray-900 font-medium">{e.title}</td>
                    <td className="px-4 py-2 text-gray-500">{e.eventType}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded ${
                          e.status === "Published"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {e.eventDate
                        ? new Date(e.eventDate).toLocaleDateString("el")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subscriptions */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Συνδρομές ({customer.subscriptions.length})
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Πακέτο</th>
                <th className="text-center px-4 py-2 font-medium text-gray-500">Κατάσταση</th>
                <th className="text-right px-4 py-2 font-medium text-gray-500">Ποσό</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Ενεργοποίηση</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Λήξη</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customer.subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    Δεν υπάρχουν συνδρομές
                  </td>
                </tr>
              ) : (
                customer.subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 text-gray-900 font-medium">{s.packageName}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded ${
                          s.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {s.paidAmount != null ? `${s.paidAmount.toFixed(2)}€` : "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {s.activatedAt
                        ? new Date(s.activatedAt).toLocaleDateString("el")
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {s.expiresAt
                        ? new Date(s.expiresAt).toLocaleDateString("el")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

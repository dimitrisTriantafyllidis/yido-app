"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface DashboardData {
  totalCustomers: number;
  activeCustomers: number;
  totalEvents: number;
  publishedEvents: number;
  totalRsvps: number;
  activeSubscriptions: number;
  totalRevenue: number;
  recentEvents: {
    id: string;
    title: string;
    eventType: string;
    status: string;
    createdAt: string;
    tenantName: string;
  }[];
  recentOrders: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    tenantName: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<DashboardData>("/api/v1/admin/dashboard")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Φόρτωση...</div>;
  }

  if (!data) return <div className="text-red-500">Σφάλμα φόρτωσης</div>;

  const stats = [
    { label: "Πελάτες", value: data.totalCustomers, sub: `${data.activeCustomers} ενεργοί` },
    { label: "Εκδηλώσεις", value: data.totalEvents, sub: `${data.publishedEvents} δημοσιευμένες` },
    { label: "RSVPs", value: data.totalRsvps, sub: null },
    { label: "Συνδρομές", value: data.activeSubscriptions, sub: "ενεργές" },
    { label: "Έσοδα", value: `${data.totalRevenue.toFixed(2)}€`, sub: null },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
            {s.sub && <div className="text-xs text-gray-400 mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Πρόσφατες Εκδηλώσεις</h2>
            <Link href="/admin/events" className="text-xs text-[#2E5A4C] hover:underline">
              Όλες
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentEvents.map((e) => (
              <div key={e.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{e.title}</div>
                  <div className="text-xs text-gray-500">{e.tenantName}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded ${
                      e.status === "Published"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {e.status}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(e.createdAt).toLocaleDateString("el")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Πρόσφατες Παραγγελίες</h2>
            <Link href="/admin/orders" className="text-xs text-[#2E5A4C] hover:underline">
              Όλες
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentOrders.map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {o.amount.toFixed(2)}€
                  </div>
                  <div className="text-xs text-gray-500">{o.tenantName}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded ${
                      o.status === "Paid"
                        ? "bg-green-50 text-green-700"
                        : o.status === "Refunded"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {o.status}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(o.createdAt).toLocaleDateString("el")}
                  </div>
                </div>
              </div>
            ))}
            {data.recentOrders.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Δεν υπάρχουν παραγγελίες
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

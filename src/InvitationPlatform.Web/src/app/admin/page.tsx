"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";
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
    packageName: string | null;
  }[];
}

const EVENT_STATUS_STYLES: Record<string, string> = {
  Published: "bg-[#E3F3EA] text-[#1B5E3A]",
  Draft: "bg-[#F9F8F6] text-[#6E6263]",
  Archived: "bg-[#F9F8F6] text-[#6E6263]",
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  Paid: "bg-[#E3F3EA] text-[#1B5E3A]",
  Pending: "bg-[#FFF3E0] text-[#B65F00]",
  Refunded: "bg-[#FDF0F0] text-[#A82020]",
  Failed: "bg-[#FDF0F0] text-[#A82020]",
};

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function inferPackageName(amount: number, packageName: string | null) {
  if (packageName) return packageName;
  if (amount >= 179) return "Video";
  if (amount >= 99) return "Digital";
  if (amount >= 49) return "Mini";
  return "—";
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
    return (
      <div className="flex items-center justify-center py-32">
        <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-6 py-12 text-center text-[#A82020] md:px-12">
        Σφάλμα φόρτωσης dashboard
      </div>
    );
  }

  const stats = [
    {
      label: "Πελάτες",
      value: data.totalCustomers,
      sub: `${data.activeCustomers} ενεργοί χρήστες`,
      icon: "users" as const,
    },
    {
      label: "Εκδηλώσεις",
      value: data.totalEvents,
      sub: `${data.publishedEvents} δημοσιευμένες`,
      icon: "calendar-check" as const,
    },
    {
      label: "RSVPs",
      value: data.totalRsvps,
      sub: "Συνολικές απαντήσεις",
      icon: "bar-chart" as const,
    },
    {
      label: "Συνδρομές",
      value: data.activeSubscriptions,
      sub: "Ενεργές εκδηλώσεις",
      icon: "package" as const,
    },
    {
      label: "Έσοδα",
      value: `${data.totalRevenue.toFixed(2)}€`,
      sub: "Συνολικές εισπράξεις",
      icon: "credit-card" as const,
    },
  ];

  return (
    <main className="flex flex-col gap-8 px-6 pb-12 md:px-12">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((stat) => (
          <AdminStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            sub={stat.sub}
            icon={stat.icon}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-[#EDE8E3] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl text-[#1C1516]">Πρόσφατες Εκδηλώσεις</h2>
            <Link href="/admin/events" className="text-[13px] font-semibold text-[#C4993D] hover:underline">
              Όλες
            </Link>
          </div>
          {data.recentEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#9C9293]">Δεν υπάρχουν εκδηλώσεις</p>
          ) : (
            <ul>
              {data.recentEvents.map((event, index) => (
                <li
                  key={event.id}
                  className={`flex items-center justify-between gap-4 py-3 ${
                    index < data.recentEvents.length - 1 ? "border-b border-[#EDE8E3]" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1C1516]">{event.title}</p>
                    <p className="truncate text-xs text-[#9C9293]">{event.tenantName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="text-[13px] text-[#6E6263]">
                      {formatShortDate(event.createdAt)}
                    </span>
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                        EVENT_STATUS_STYLES[event.status] ?? EVENT_STATUS_STYLES.Draft
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#EDE8E3] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl text-[#1C1516]">Πρόσφατες Παραγγελίες</h2>
            <Link href="/admin/orders" className="text-[13px] font-semibold text-[#C4993D] hover:underline">
              Όλες
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#9C9293]">Δεν υπάρχουν παραγγελίες</p>
          ) : (
            <ul>
              {data.recentOrders.map((order, index) => (
                <li
                  key={order.id}
                  className={`flex items-center justify-between gap-4 py-3 ${
                    index < data.recentOrders.length - 1 ? "border-b border-[#EDE8E3]" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1C1516]">{order.amount.toFixed(2)}€</p>
                    <p className="truncate text-xs text-[#9C9293]">{order.tenantName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-[#A87D2C]">
                        {inferPackageName(order.amount, order.packageName)}
                      </p>
                      <p className="text-[11px] text-[#9C9293]">
                        {formatShortDate(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                        ORDER_STATUS_STYLES[order.status] ?? "bg-[#F9F8F6] text-[#6E6263]"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function AdminStatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub: string;
  icon: "users" | "calendar-check" | "bar-chart" | "package" | "credit-card";
}) {
  return (
    <div className="rounded-xl border border-[#EDE8E3] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6263]">{label}</p>
        <span className="rounded-md bg-[#F9F8F6] p-1.5">
          <DashboardIcon name={icon} className="size-3.5 text-[#6E6263]" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-[#1C1516]">{value}</p>
      <p className="mt-1 text-[11px] text-[#9C9293]">{sub}</p>
    </div>
  );
}

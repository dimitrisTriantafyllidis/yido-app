"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/customers", label: "Πελάτες" },
  { href: "/admin/users", label: "Χρήστες" },
  { href: "/admin/events", label: "Εκδηλώσεις" },
  { href: "/admin/orders", label: "Παραγγελίες" },
  { href: "/admin/templates", label: "Πρότυπα" },
  { href: "/admin/packages", label: "Πακέτα" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !user.isSystemAdmin)) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user?.isSystemAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-display text-lg font-semibold text-gray-900">
              YIDO <span className="text-xs font-normal text-gray-500 ml-1">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Portal
            </Link>
            <span className="text-sm text-gray-500">{user.firstName}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Αποσύνδεση
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-56 min-h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 py-4">
          <ul className="space-y-0.5 px-3">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      active
                        ? "bg-[#2E5A4C]/10 text-[#2E5A4C] font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminShell, AdminTopBar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/admin";

  useEffect(() => {
    if (!loading && (!user || !user.isSystemAdmin)) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6]">
        <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
      </div>
    );
  }

  if (!user?.isSystemAdmin) return null;

  return (
    <AdminShell topBar={isDashboard ? <AdminTopBar onLogout={logout} /> : undefined}>
      {isDashboard ? (
        children
      ) : (
        <main className="px-4 pb-12 sm:px-6 md:px-12">
          <div className="mb-8 flex flex-col gap-3 border-b border-[#EDE8E3] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin" className="font-display text-xl text-[#1C1516] hover:text-[#C4993D] sm:text-2xl">
                YIDO Admin
              </Link>
              <span className="rounded bg-[#FAF3DF] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#A87D2C]">
                System
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/dashboard" className="font-medium text-[#C4993D] hover:underline">
                Portal Πελατών
              </Link>
              <span className="size-1 rounded-full bg-[#9C9293]" aria-hidden />
              <button
                type="button"
                onClick={logout}
                className="font-medium text-[#6E6263] hover:text-[#1C1516]"
              >
                Αποσύνδεση
              </button>
            </div>
          </div>
          {children}
        </main>
      )}
    </AdminShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "home" as const, exact: true },
  { href: "/admin/customers", label: "Πελάτες", icon: "users" as const },
  { href: "/admin/users", label: "Χρήστες", icon: "user" as const },
  { href: "/admin/events", label: "Εκδηλώσεις", icon: "calendar-check" as const },
  { href: "/admin/orders", label: "Παραγγελίες", icon: "credit-card" as const },
  { href: "/admin/templates", label: "Πρότυπα", icon: "palette" as const },
  { href: "/admin/packages", label: "Πακέτα", icon: "package" as const },
] as const;

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? "Admin";
  const initials = `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}` || "A";

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col justify-between border-r border-white/[0.04] bg-[#3A1112] px-4 py-6">
      <div className="flex flex-col gap-8">
        <Link href="/admin" className="flex items-center gap-2 pl-3">
          <span className="font-display text-[32px] leading-none text-white">YIDO</span>
          <span className="size-1.5 rounded-[3px] bg-[#C4993D]" aria-hidden />
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#A38B8E]">
            Pro
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = "exact" in item && item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                  active
                    ? "border border-white/[0.08] bg-white/[0.06] font-semibold text-white"
                    : "font-medium text-[#A38B8E] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <DashboardIcon name={item.icon} className="size-[18px]" active={active} />
                <span className="flex-1">{item.label}</span>
                {active ? <span className="h-3 w-1 rounded-[2px] bg-[#C4993D]" /> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-black/15 p-3">
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#C4993D]/20 text-xs font-semibold text-[#C4993D]">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-white">{displayName}</span>
            <span className="block truncate text-[11px] text-[#A38B8E]">{user?.email}</span>
          </span>
          <DashboardIcon name="chevron-right" className="size-3.5 shrink-0 text-[#A38B8E]" />
        </button>
      </div>
    </aside>
  );
}

export function AdminShell({
  children,
  topBar,
}: {
  children: React.ReactNode;
  topBar?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F9F8F6] text-[#1C1516] lg:flex-row">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-[#3A1112] px-4 lg:hidden">
        <Link href="/admin" className="font-display text-2xl leading-none text-white">
          YIDO
        </Link>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-white/15 text-white"
          aria-expanded={open}
          aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="relative block h-3.5 w-4">
            <span className={`absolute left-0 top-0 h-px w-4 bg-current transition ${open ? "top-1.5 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-1.5 h-px w-4 bg-current ${open ? "opacity-0" : ""}`} />
            <span className={`absolute bottom-0 left-0 h-px w-4 bg-current transition ${open ? "top-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </header>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Κλείσιμο μενού"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onNavigate={() => setOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export function AdminTopBar({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-12 md:py-10">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl text-[#1C1516] md:text-[32px]">YIDO Admin</h1>
        <span className="rounded bg-[#FAF3DF] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#A87D2C]">
          System
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/dashboard" className="font-medium text-[#C4993D] hover:underline">
          Portal Πελατών
        </Link>
        <span className="size-1 rounded-full bg-[#9C9293]" aria-hidden />
        <button
          type="button"
          onClick={onLogout}
          className="font-medium text-[#6E6263] hover:text-[#1C1516]"
        >
          Αποσύνδεση
        </button>
      </div>
    </header>
  );
}

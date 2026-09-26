import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardIcon } from "./dashboard-icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Εκδηλώσεις", icon: "calendar-check" as const },
  { href: "/dashboard", label: "Καλεσμένοι", icon: "users" as const, disabled: true },
  { href: "/dashboard", label: "Στατιστικά RSVP", icon: "bar-chart" as const, disabled: true },
  { href: "/dashboard", label: "Εικαστικά Πρότυπα", icon: "palette" as const, disabled: true },
  { href: "/dashboard", label: "Ρυθμίσεις", icon: "settings" as const, disabled: true },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const tenantName = user?.currentTenant?.name ?? "YIDO";
  const initials = `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}` || "Y";

  return (
    <aside className="flex w-[260px] shrink-0 flex-col justify-between self-stretch border-r border-white/[0.04] bg-[#3A1112] px-4 py-6">
      <div className="flex flex-col gap-8">
        <Link href="/" className="flex items-center gap-2 pl-3">
          <span className="font-display text-[32px] leading-none text-white">YIDO</span>
          <span className="size-1.5 rounded-[3px] bg-[#C4993D]" aria-hidden />
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#A38B8E]">
            Pro
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const onGuestsPage = pathname.includes("/guests");
            const onRsvpsPage = pathname.includes("/rsvps");
            const onGalleryPage = pathname.includes("/gallery");
            const active =
              item.label === "Καλεσμένοι"
                ? onGuestsPage
                : item.label === "Στατιστικά RSVP"
                  ? onRsvpsPage
                  : item.label === "Εικαστικά Πρότυπα"
                    ? onGalleryPage
                    : item.label === "Εκδηλώσεις" &&
                      pathname.startsWith("/dashboard") &&
                      !onGuestsPage &&
                      !onRsvpsPage &&
                      !onGalleryPage;

            if ("disabled" in item && item.disabled && !active) {
              return (
                <span
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#A38B8E]/60"
                  title="Σύντομα διαθέσιμο"
                >
                  <DashboardIcon name={item.icon} className="size-[18px] opacity-60" />
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
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

      <div className="rounded-xl border border-white/[0.05] bg-black/15 p-3">
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#C4993D]/20 text-xs font-semibold text-[#C4993D]">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-white">{tenantName}</span>
            <span className="block truncate text-[11px] text-[#A38B8E]">{user?.email}</span>
          </span>
          <DashboardIcon name="chevron-right" className="size-3.5 shrink-0 text-[#A38B8E]" />
        </button>
        {user?.isSystemAdmin ? (
          <Link
            href="/admin"
            className="mt-3 block rounded-md border border-white/10 px-2 py-1.5 text-center text-[11px] font-medium text-[#A38B8E] hover:bg-white/5 hover:text-white"
          >
            Admin portal
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard flex min-h-screen bg-[#F9F8F6] text-[#1C1516]">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

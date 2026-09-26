"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EventDetailTabs({
  eventId,
  guestCount,
}: {
  eventId: string;
  guestCount: number;
}) {
  const pathname = usePathname();
  const base = `/dashboard/events/${eventId}`;

  const tabs = [
    { href: base, label: "Επισκόπηση", exact: true },
    { href: `${base}/guests`, label: "Καλεσμένοι", count: guestCount },
    { href: `${base}/seating`, label: "Τραπέζια" },
    { href: `${base}/rsvps`, label: "Απαντήσεις RSVP" },
    { href: `${base}/gallery`, label: "Γκαλερί" },
    { href: `${base}/pricing`, label: "Τιμολόγηση" },
  ] as const;

  return (
    <nav className="flex gap-6 overflow-x-auto border-b border-[#EDE8E3]">
      {tabs.map((tab) => {
        const active =
          "exact" in tab && tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 border-b-2 px-1 pb-3 text-sm transition-colors ${
              active
                ? "border-[#C4993D] font-semibold text-[#1C1516]"
                : "border-transparent font-medium text-[#9C9293] hover:text-[#1C1516]"
            }`}
          >
            {tab.label}
            {"count" in tab && tab.count !== undefined ? ` (${tab.count})` : ""}
          </Link>
        );
      })}
    </nav>
  );
}

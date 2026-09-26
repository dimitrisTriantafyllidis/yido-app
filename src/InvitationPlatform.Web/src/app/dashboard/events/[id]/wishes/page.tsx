"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";
import { api } from "@/lib/api";
import type { GuestWishItem } from "@/components/invitations/extra-section-config";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WishesPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [wishes, setWishes] = useState<GuestWishItem[]>([]);
  const [eventTitle, setEventTitle] = useState("Εκδήλωση");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [wishData, eventData] = await Promise.all([
        api<GuestWishItem[]>(`/api/v1/events/${eventId}/wishes`),
        api<{ title: string }>(`/api/v1/events/${eventId}`).catch(() => null),
      ]);
      setWishes(wishData);
      if (eventData?.title) setEventTitle(eventData.title);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="flex flex-col gap-8 px-6 py-10 pb-12 md:px-12">
      <section className="flex flex-col gap-1.5">
        <nav className="flex flex-wrap items-center gap-1 text-xs">
          <Link href="/dashboard" className="text-[#6E5B5D] hover:text-[#1C1516]">
            Εκδηλώσεις
          </Link>
          <DashboardIcon name="chevron-right" className="size-3 text-[#6E5B5D]" />
          <Link href={`/dashboard/events/${eventId}`} className="text-[#6E5B5D] hover:text-[#1C1516]">
            {eventTitle}
          </Link>
          <DashboardIcon name="chevron-right" className="size-3 text-[#6E5B5D]" />
          <span className="font-medium text-[#7A1C2E]">Ευχές</span>
        </nav>
        <h1 className="font-display text-[32px] text-[#1C1516]">Ευχές καλεσμένων</h1>
      </section>

      {loading ? (
        <p className="text-sm text-[#9C9293]">Φόρτωση…</p>
      ) : wishes.length === 0 ? (
        <p className="text-sm text-[#9C9293]">Δεν έχουν σταλεί ευχές ακόμα.</p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {wishes.map((wish, i) => (
            <article
              key={wish.id ?? `${wish.name}-${i}`}
              className="rounded-xl border border-[#EDE8E3] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#1C1516]">{wish.name}</p>
                {wish.createdAt ? (
                  <p className="text-xs text-[#9C9293]">{formatDate(wish.createdAt)}</p>
                ) : null}
              </div>
              <p className="mt-3 text-sm italic leading-relaxed text-[#6E6263]">“{wish.message}”</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

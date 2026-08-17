import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, PartyPopper, ArrowRight, Calendar } from "lucide-react";
import type { Event } from "@/lib/types";
import { formatDate, daysUntilEvent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCardGrid, EventCardMotion } from "./event-card-grid";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("yido-locale")?.value);
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true }) as { data: Event[] | null };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-display">
            {t(locale, "dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t(locale, "dashboard.subtitle")}
          </p>
        </div>
        <Button render={<Link href="/dashboard/events/new" />}>
          <Plus className="w-5 h-5" />
          {t(locale, "dashboard.newEvent")}
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold-50)] flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
              {t(locale, "dashboard.noEvents")}
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              {t(locale, "dashboard.noEventsDesc")}
            </p>
            <Button render={<Link href="/dashboard/events/new" />}>
              <Plus className="w-5 h-5" />
              {t(locale, "dashboard.createFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <EventCardGrid>
          {events.map((event) => {
            const days = daysUntilEvent(event.date);
            return (
              <EventCardMotion key={event.id}>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="block h-full"
                >
                  <Card className="h-full hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all group shadow-[var(--shadow-card)] rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="secondary" className="capitalize bg-[var(--color-gold-50)] text-primary">
                          {event.type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={
                            event.is_published
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }
                        >
                          {event.is_published ? t(locale, "dashboard.published") : t(locale, "dashboard.draft")}
                        </Badge>
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      {event.couple_name_1 && event.couple_name_2 && (
                        <p className="text-muted-foreground text-sm mt-1 italic">
                          {event.couple_name_1} & {event.couple_name_2}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-3">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">{formatDate(event.date)}</p>
                      </div>
                      {days > 0 && (
                        <p className="text-primary text-sm font-medium mt-1">
                          {days} {days === 1 ? t(locale, "dashboard.dayToGo") : t(locale, "dashboard.daysToGo")}
                        </p>
                      )}
                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          {event.package_tier}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-primary font-medium group-hover:translate-x-1 transition-transform">
                          {t(locale, "dashboard.manage")} <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </EventCardMotion>
            );
          })}
        </EventCardGrid>
      )}
    </div>
  );
}

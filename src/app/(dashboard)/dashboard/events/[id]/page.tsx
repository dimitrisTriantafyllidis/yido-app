import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Event, Guest, EventLocation, TimelineItem, GalleryPhoto } from "@/lib/types";
import { formatDate, daysUntilEvent, getRsvpStats } from "@/lib/utils";
import { GuestList } from "./guest-list";
import { LocationManager } from "./location-manager";
import { EventActions } from "./event-actions";
import { QRCodeDisplay } from "./qr-code";
import { EventSettingsEditor } from "./event-settings";
import { CoverImageUpload } from "./cover-image-upload";
import { PaymentStatus } from "./payment-status";
import { TimelineManager } from "./timeline-manager";
import { GalleryManager } from "./gallery-manager";
import { SeatingManager } from "./seating-manager";
import { DocumentUpload } from "./document-upload";
import { EventTabs } from "./event-tabs";
import { ArrowLeft, Calendar, Link2, Users, UserCheck, Clock as ClockIcon, UserX, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("yido-locale")?.value);
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single() as { data: Event | null };

  if (!event) notFound();

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("event_id", id)
    .order("invited_at", { ascending: false }) as { data: Guest[] | null };

  const { data: locations } = await supabase
    .from("event_locations")
    .select("*")
    .eq("event_id", id) as { data: EventLocation[] | null };

  const { data: payment } = await supabase
    .from("payments")
    .select("status")
    .eq("event_id", id)
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();

  const { data: timelineItems } = await supabase
    .from("timeline_items")
    .select("*")
    .eq("event_id", id)
    .order("sort_order") as { data: TimelineItem[] | null };

  const { data: galleryPhotos } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false }) as { data: GalleryPhoto[] | null };

  const stats = getRsvpStats(guests || []);
  const days = daysUntilEvent(event.date);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = `${appUrl}/e/${event.slug}`;
  const isPaid = !!payment;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          {t(locale, "event.backToEvents")}
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              {event.title}
            </h1>
            {event.couple_name_1 && event.couple_name_2 && (
              <p className="text-muted-foreground mt-1.5 text-lg font-heading italic">
                {event.couple_name_1} &amp; {event.couple_name_2}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar size={14} />
                {formatDate(event.date)}
              </span>
              {days > 0 && (
                <span className="text-sm font-medium text-primary">
                  {days} {days === 1 ? t(locale, "dashboard.dayToGo") : t(locale, "dashboard.daysToGo")}
                </span>
              )}
              <Badge
                variant={event.is_published ? "default" : "secondary"}
                className={
                  event.is_published
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }
              >
                {event.is_published ? t(locale, "dashboard.published") : t(locale, "dashboard.draft")}
              </Badge>
            </div>
          </div>
          <EventActions event={event} publicUrl={publicUrl} />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={<Users size={18} />}
          label={t(locale, "event.totalGuests")}
          value={stats.total}
          bg="bg-[var(--color-gold-50)]"
          iconColor="text-primary"
          valueColor="text-foreground"
        />
        <StatCard
          icon={<UserCheck size={18} />}
          label={t(locale, "event.confirmed")}
          value={stats.confirmed}
          bg="bg-emerald-50"
          iconColor="text-emerald-500"
          valueColor="text-emerald-900"
        />
        <StatCard
          icon={<ClockIcon size={18} />}
          label={t(locale, "event.pending")}
          value={stats.pending}
          bg="bg-amber-50"
          iconColor="text-amber-500"
          valueColor="text-amber-900"
        />
        <StatCard
          icon={<UserX size={18} />}
          label={t(locale, "event.declined")}
          value={stats.declined}
          bg="bg-rose-50"
          iconColor="text-rose-500"
          valueColor="text-rose-900"
        />
        <StatCard
          icon={<UsersRound size={18} />}
          label={t(locale, "event.totalAttending")}
          value={stats.totalAttending}
          bg="bg-violet-50"
          iconColor="text-violet-500"
          valueColor="text-violet-900"
        />
      </div>

      {/* Tabbed Content */}
      <EventTabs
        details={
          <>
            {/* Payment Status */}
            <PaymentStatus eventId={event.id} packageTier={event.package_tier} isPaid={isPaid} />

            {/* Cover Image */}
            <CoverImageUpload eventId={event.id} currentUrl={event.cover_image_url} />

            {/* Public URL & QR */}
            <Card className="shadow-[var(--shadow-card)]">
              <CardContent className="p-6">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 inline-flex items-center gap-2">
                  <Link2 size={18} className="text-primary" />
                  {t(locale, "share.title")}
                </h2>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <Label className="mb-1.5 text-sm text-muted-foreground">Public URL</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        readOnly
                        value={publicUrl}
                        className="bg-muted/50 text-muted-foreground font-mono text-sm"
                      />
                      <Button variant="outline" render={<a href={publicUrl} target="_blank" rel="noopener noreferrer" />}>
                        {t(locale, "common.preview")}
                      </Button>
                    </div>
                    {!event.is_published && (
                      <p className="text-xs text-amber-600 mt-2">
                        {t(locale, "share.publishNotice")}
                      </p>
                    )}
                  </div>
                  <QRCodeDisplay url={publicUrl} title={event.title} />
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <LocationManager eventId={event.id} initialLocations={locations || []} packageTier={event.package_tier} />
          </>
        }
        guests={
          <>
            <GuestList eventId={event.id} initialGuests={guests || []} packageTier={event.package_tier} />
            <SeatingManager eventId={event.id} initialGuests={guests || []} packageTier={event.package_tier} />
          </>
        }
        timeline={
          <TimelineManager eventId={event.id} initialItems={timelineItems || []} packageTier={event.package_tier} />
        }
        gallery={
          <GalleryManager eventId={event.id} initialPhotos={galleryPhotos || []} packageTier={event.package_tier} />
        }
        documents={
          <DocumentUpload
            eventId={event.id}
            invitationUrl={event.invitation_pdf_url}
            agendaUrl={event.agenda_pdf_url}
          />
        }
        settings={
          <EventSettingsEditor event={event} />
        }
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  iconColor,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
  iconColor: string;
  valueColor: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 sm:p-5`}>
      <div className={`${iconColor} mb-2`}>{icon}</div>
      <p className={`text-3xl sm:text-4xl font-heading font-semibold ${valueColor} tracking-tight`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
    </div>
  );
}

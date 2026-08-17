import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Event, EventLocation, TimelineItem, GalleryPhoto } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";
import { MapPin, Clock, ExternalLink, FileText, Download } from "lucide-react";
import { RSVPForm } from "./rsvp-form";
import { GoogleMap } from "./google-map";
import { PublicGallery } from "./gallery";
import { WishBook } from "./wish-book";
import { SectionDivider } from "@/components/public-event/section-divider";
import { FadeInSection } from "@/components/motion";
import { heroReveal, staggerContainer, fadeInUp, scaleIn } from "@/lib/animations";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";
import type { Wish } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, description, couple_name_1, couple_name_2, type")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) return { title: "Event Not Found" };

  const title =
    event.couple_name_1 && event.couple_name_2
      ? `${event.couple_name_1} & ${event.couple_name_2} - ${event.title}`
      : event.title;

  return {
    title: `${title} | YIDO`,
    description: event.description || `Join us for our ${event.type}!`,
    openGraph: { title, description: event.description || undefined },
  };
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("yido-locale")?.value);
  const supabase = await createClient();

  const { data: event } = (await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()) as { data: Event | null };

  if (!event) notFound();

  const { data: locations } = (await supabase
    .from("event_locations")
    .select("*")
    .eq("event_id", event.id)
    .order("time")) as { data: EventLocation[] | null };

  const { data: timeline } = (await supabase
    .from("timeline_items")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order")) as { data: TimelineItem[] | null };

  const { data: photos } = (await supabase
    .from("gallery_photos")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })) as { data: GalleryPhoto[] | null };

  const { data: wishes } = (await supabase
    .from("wishes")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })) as { data: Wish[] | null };

  const settings = event.settings;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header
        className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 text-center"
        style={{
          background: `linear-gradient(135deg, ${settings.primary_color}08, ${settings.secondary_color}08, transparent)`,
        }}
      >
        {event.cover_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: `url(${event.cover_image_url})` }}
          />
        )}
        <FadeInSection variants={heroReveal} className="relative z-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 font-medium">
            {event.type === "wedding"
              ? t(locale, "public.weddingInvite")
              : event.type === "baptism"
                ? t(locale, "public.baptismInvite")
                : t(locale, "public.genericInvite")}
          </p>
          {event.couple_name_1 && event.couple_name_2 ? (
            <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-great-vibes)] text-foreground mb-6">
              <span style={{ color: settings.primary_color }}>
                {event.couple_name_1}
              </span>
              <span className="text-primary/40 mx-3">&amp;</span>
              <span style={{ color: settings.secondary_color }}>
                {event.couple_name_2}
              </span>
            </h1>
          ) : (
            <h1
              className="text-5xl md:text-7xl font-[family-name:var(--font-great-vibes)] mb-6"
              style={{ color: settings.primary_color }}
            >
              {event.title}
            </h1>
          )}

          <SectionDivider />

          <p className="text-foreground mt-4 font-heading text-3xl">
            {formatDate(event.date)}
          </p>
          {event.time && (
            <p className="text-lg text-muted-foreground mt-1 font-heading">
              {formatTime(event.time)}
            </p>
          )}
          {event.description && (
            <p className="max-w-lg mx-auto text-muted-foreground mt-8 leading-relaxed font-heading text-lg">
              {event.description}
            </p>
          )}
          {settings.custom_message && (
            <p className="max-w-lg mx-auto text-muted-foreground mt-4 italic font-heading">
              {settings.custom_message}
            </p>
          )}
        </FadeInSection>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-20">
        {/* Locations */}
        {settings.show_map && locations && locations.length > 0 && (
          <FadeInSection>
            <section>
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center mb-2">
                {locations.length > 1 ? t(locale, "public.locations") : t(locale, "public.location")}
              </h2>
              <div className="flex justify-center mb-8">
                <SectionDivider />
              </div>
              <div className="space-y-4">
                {locations.map((loc) => (
                  <FadeInSection key={loc.id} variants={scaleIn}>
                    <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] border border-border/60 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-primary bg-[var(--color-gold-50)] px-2.5 py-1 rounded-full capitalize">
                          {loc.type}
                        </span>
                        {loc.time && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(loc.time)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-foreground">
                            {loc.name}
                          </h3>
                          <p className="text-muted-foreground text-sm mt-1">{loc.address}</p>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer min-h-[44px]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t(locale, "locations.openMaps")}
                      </a>
                      <GoogleMap address={loc.address} name={loc.name} />
                      {loc.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">{loc.notes}</p>
                      )}
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </section>
          </FadeInSection>
        )}

        {/* Timeline */}
        {settings.show_timeline && timeline && timeline.length > 0 && (
          <FadeInSection>
            <section>
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center mb-2">
                {t(locale, "public.schedule")}
              </h2>
              <div className="flex justify-center mb-8">
                <SectionDivider />
              </div>
              <FadeInSection variants={staggerContainer} className="space-y-0">
                {timeline.map((item) => (
                  <FadeInSection key={item.id} variants={fadeInUp}>
                    <div className="flex gap-4">
                      <div className="text-right w-16 shrink-0 pt-0.5">
                        <span className="text-sm font-semibold text-primary">
                          {formatTime(item.time)}
                        </span>
                      </div>
                      <div className="w-px bg-border relative">
                        <div className="absolute top-1.5 -left-1 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_0_3px_var(--color-background)]" />
                      </div>
                      <div className="pb-8">
                        <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </FadeInSection>
                ))}
              </FadeInSection>
            </section>
          </FadeInSection>
        )}

        {/* Gallery */}
        {settings.show_gallery && (
          <FadeInSection>
            <section>
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center mb-2">
                {t(locale, "public.gallery")}
              </h2>
              <div className="flex justify-center mb-8">
                <SectionDivider />
              </div>
              <PublicGallery
                eventId={event.id}
                initialPhotos={photos || []}
                primaryColor={settings.primary_color}
              />
            </section>
          </FadeInSection>
        )}

        {/* Wish Book */}
        {settings.show_wishes && (
          <FadeInSection>
            <section>
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center mb-2">
                {t(locale, "public.wishes")}
              </h2>
              <div className="flex justify-center mb-8">
                <SectionDivider />
              </div>
              <WishBook
                eventId={event.id}
                initialWishes={wishes || []}
              />
            </section>
          </FadeInSection>
        )}

        {/* Documents (Invitation / Agenda PDFs) */}
        {(event.invitation_pdf_url || event.agenda_pdf_url) && (
          <FadeInSection>
            <section>
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center mb-2">
                {t(locale, "public.documents")}
              </h2>
              <div className="flex justify-center mb-8">
                <SectionDivider />
              </div>
              <div className="space-y-4">
                {event.invitation_pdf_url && (
                  <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-50)] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">{t(locale, "public.invitation")}</h3>
                        <p className="text-xs text-muted-foreground">PDF</p>
                      </div>
                    </div>
                    <iframe
                      src={`${event.invitation_pdf_url}#toolbar=0`}
                      className="w-full h-[500px] rounded-lg border border-border"
                      title="Invitation PDF"
                    />
                    <a
                      href={event.invitation_pdf_url}
                      download
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary hover:text-[var(--color-primary-hover)] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t(locale, "documents.downloadPdf")}
                    </a>
                  </div>
                )}
                {event.agenda_pdf_url && (
                  <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-50)] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">{t(locale, "public.agenda")}</h3>
                        <p className="text-xs text-muted-foreground">PDF</p>
                      </div>
                    </div>
                    <iframe
                      src={`${event.agenda_pdf_url}#toolbar=0`}
                      className="w-full h-[500px] rounded-lg border border-border"
                      title="Agenda PDF"
                    />
                    <a
                      href={event.agenda_pdf_url}
                      download
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary hover:text-[var(--color-primary-hover)] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t(locale, "documents.downloadPdf")}
                    </a>
                  </div>
                )}
              </div>
            </section>
          </FadeInSection>
        )}

        {/* RSVP */}
        {settings.show_rsvp && (
          <FadeInSection>
            <section>
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center mb-2">
                {t(locale, "public.rsvp")}
              </h2>
              <div className="flex justify-center mb-8">
                <SectionDivider />
              </div>
              <RSVPForm
                eventId={event.id}
                allowPlusOnes={settings.allow_plus_ones}
                maxPlusOnes={settings.max_plus_ones}
                primaryColor={settings.primary_color}
              />
            </section>
          </FadeInSection>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-muted-foreground">
        <p>
          Powered by{" "}
          <a
            href="/"
            className="font-heading font-semibold text-primary hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer"
          >
            YIDO
          </a>
        </p>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { MapPin, Clock, ExternalLink, ArrowRight, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionDivider } from "@/components/public-event/section-divider";
import { FadeInSection } from "@/components/motion";
import { heroReveal, staggerContainer, fadeInUp, scaleIn } from "@/lib/animations";
import { DemoRSVPForm } from "./demo-rsvp-form";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";
import { formatDate, formatTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Event | YIDO",
  description: "See how your event page will look with YIDO. Explore all features with this demo wedding.",
};

const DEMO_EVENT = {
  title: "Demo Wedding",
  type: "wedding" as const,
  date: "2026-09-19",
  time: "17:00",
  couple_name_1: "Μαρία",
  couple_name_2: "Γιώργος",
  settings: {
    primary_color: "#B08D57",
    secondary_color: "#C9A96E",
    custom_message: null as string | null,
  },
};

const DEMO_LOCATIONS = [
  {
    id: "loc-1",
    type: "ceremony" as const,
    name: "Ιερός Ναός Αγίου Διονυσίου Αρεοπαγίτου",
    address: "Σκουφά 30, Κολωνάκι, Αθήνα 106 73",
    time: "17:00",
  },
  {
    id: "loc-2",
    type: "reception" as const,
    name: "Island Art & Taste",
    address: "Λεωφ. Αθηνών Σουνίου, Βάρκιζα, Αθήνα 166 72",
    time: "20:00",
  },
];

const DEMO_TIMELINE = [
  { id: "t-1", time: "17:00", title: "Τελετή Γάμου", description: "Ιερός Ναός Αγίου Διονυσίου Αρεοπαγίτου" },
  { id: "t-2", time: "18:30", title: "Cocktail Hour", description: "Καλωσόρισμα με ποτά και ορεκτικά" },
  { id: "t-3", time: "20:00", title: "Δείπνο", description: "Γαστρονομικό μενού 5 πιάτων" },
  { id: "t-4", time: "22:00", title: "Πρώτος Χορός", description: "Ο πρώτος χορός του ζευγαριού" },
  { id: "t-5", time: "23:30", title: "Πυροτεχνήματα", description: "Φαντασμαγορικό σόου πυροτεχνημάτων" },
];

const DEMO_WISHES = [
  { id: "w-1", guest_name: "Ελένη Παπαδοπούλου", message: "Να ζήσετε! Σας εύχομαι κάθε ευτυχία και αγάπη στη ζωή σας μαζί!", created_at: "2026-09-10T14:30:00Z" },
  { id: "w-2", guest_name: "Νίκος Αλεξίου", message: "Χρόνια πολλά στο υπέροχο ζευγάρι! Η αγάπη σας είναι έμπνευση για όλους μας.", created_at: "2026-09-11T10:15:00Z" },
  { id: "w-3", guest_name: "Σοφία & Δημήτρης", message: "Καλοτάξιδο! Να είστε πάντα ευτυχισμένοι μαζί. Σας αξίζουν τα καλύτερα!", created_at: "2026-09-12T18:45:00Z" },
];

const GALLERY_GRADIENTS = [
  "from-rose-200 to-pink-200",
  "from-sky-200 to-blue-200",
  "from-amber-200 to-yellow-200",
  "from-emerald-200 to-green-200",
  "from-violet-200 to-purple-200",
  "from-orange-200 to-red-200",
];

export default async function DemoPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("yido-locale")?.value);
  const event = DEMO_EVENT;
  event.settings.custom_message = t(locale, "demo.customMessage");

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#B08D57] to-[#C9A96E] text-white py-2.5 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium">{t(locale, "demo.banner")}</span>
          <Button
            size="sm"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 text-xs h-8"
            render={<Link href="/register" />}
          >
            {t(locale, "demo.bannerCta")}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Hero */}
      <header
        className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 text-center pt-12"
        style={{
          background: `linear-gradient(135deg, ${event.settings.primary_color}08, ${event.settings.secondary_color}08, transparent)`,
        }}
      >
        <FadeInSection variants={heroReveal} className="relative z-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 font-medium">
            {t(locale, "public.weddingInvite")}
          </p>
          <h1 className="text-5xl md:text-7xl font-heading font-semibold text-foreground mb-6">
            <span style={{ color: event.settings.primary_color }}>
              {event.couple_name_1}
            </span>
            <span className="text-primary/40 mx-3">&amp;</span>
            <span style={{ color: event.settings.secondary_color }}>
              {event.couple_name_2}
            </span>
          </h1>

          <SectionDivider />

          <p className="text-foreground mt-4 font-heading text-3xl">
            {formatDate(event.date)}
          </p>
          <p className="text-lg text-muted-foreground mt-1 font-heading">
            {formatTime(event.time)}
          </p>
          <p className="max-w-lg mx-auto text-muted-foreground mt-8 leading-relaxed font-heading text-lg">
            {t(locale, "demo.description")}
          </p>
          <p className="max-w-lg mx-auto text-muted-foreground mt-4 italic font-heading">
            {event.settings.custom_message}
          </p>
        </FadeInSection>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-20">
        {/* Locations */}
        <FadeInSection>
          <section>
            <h2 className="font-heading text-3xl font-semibold text-foreground text-center mb-2">
              {t(locale, "public.locations")}
            </h2>
            <div className="flex justify-center mb-8">
              <SectionDivider />
            </div>
            <div className="space-y-4">
              {DEMO_LOCATIONS.map((loc) => (
                <FadeInSection key={loc.id} variants={scaleIn}>
                  <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-primary bg-[var(--color-gold-50)] px-2.5 py-1 rounded-full capitalize">
                        {loc.type}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(loc.time)}
                      </span>
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
                  </div>
                </FadeInSection>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* Timeline */}
        <FadeInSection>
          <section>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center">
                {t(locale, "public.schedule")}
              </h2>
              <Badge variant="secondary" className="text-[10px]">Premium+</Badge>
            </div>
            <div className="flex justify-center mb-8">
              <SectionDivider />
            </div>
            <FadeInSection variants={staggerContainer} className="space-y-0">
              {DEMO_TIMELINE.map((item) => (
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
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </FadeInSection>
          </section>
        </FadeInSection>

        {/* Gallery */}
        <FadeInSection>
          <section>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center">
                {t(locale, "public.gallery")}
              </h2>
              <Badge variant="secondary" className="text-[10px]">Premium+</Badge>
            </div>
            <div className="flex justify-center mb-8">
              <SectionDivider />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GALLERY_GRADIENTS.map((gradient, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
                >
                  <span className="text-white/60 text-sm font-medium">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* Wish Book */}
        <FadeInSection>
          <section>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="font-heading text-3xl font-semibold text-foreground text-center">
                {t(locale, "public.wishes")}
              </h2>
              <Badge variant="secondary" className="text-[10px]">Premium+</Badge>
            </div>
            <div className="flex justify-center mb-8">
              <SectionDivider />
            </div>
            <div className="space-y-3">
              {DEMO_WISHES.map((wish) => (
                <div
                  key={wish.id}
                  className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 p-5"
                >
                  <p className="font-heading text-foreground italic leading-relaxed">
                    &ldquo;{wish.message}&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5">
                    <MessageCircleHeart className="w-3.5 h-3.5 text-primary/60" />
                    {wish.guest_name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* RSVP */}
        <FadeInSection>
          <section>
            <h2 className="font-heading text-3xl font-semibold text-foreground text-center mb-2">
              {t(locale, "public.rsvp")}
            </h2>
            <div className="flex justify-center mb-8">
              <SectionDivider />
            </div>
            <DemoRSVPForm />
          </section>
        </FadeInSection>

        {/* Bottom CTA */}
        <FadeInSection>
          <Card className="overflow-hidden">
            <CardContent className="p-8 text-center bg-gradient-to-br from-[var(--color-gold-50)] to-white">
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">
                {t(locale, "demo.ctaTitle")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t(locale, "demo.ctaSubtitle")}
              </p>
              <Button size="lg" className="text-lg px-8 py-4 h-[52px]" render={<Link href="/register" />}>
                {t(locale, "landing.createEvent")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </FadeInSection>
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

"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  ClassicLabel,
  ClassicOrnament,
  OliveBranch,
  SectionIntro,
  coupleInitials,
  cfg,
} from "./classic-ornaments";
import { WEDDING_TEMPLATE_COMPONENTS } from "@/components/invitations/templates";
import { resolveWeddingStyle, toInvitationViewModel } from "@/components/invitations/to-view-model";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ThemeData {
  name?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  surfaceColor: string;
  displayFontFamily: string;
  bodyFontFamily: string;
  borderRadius: string;
}

interface SectionData {
  id: string;
  sectionType: string;
  sortOrder: number;
  isEnabled: boolean;
  configurationJson: string | null;
}

interface VenueData {
  id: string;
  name: string;
  venueType: string;
  address: string;
  city: string;
  googleMapsUrl: string | null;
  time: string | null;
}

interface PersonData {
  id: string;
  role: string;
  displayName: string;
  side: string | null;
  photoUrl: string | null;
}

interface MediaItem {
  id: string;
  mediaType: string;
  contentType: string;
  altText: string | null;
  sortOrder: number;
  url: string;
  thumbnailUrl: string | null;
}

interface RsvpQuestion {
  id: string;
  prompt: string;
  questionType: string;
  optionsJson: string | null;
  isRequired: boolean;
  sortOrder: number;
}

interface PublicInvitation {
  event: {
    id: string;
    title: string;
    eventType: string;
    eventDate: string | null;
    slug: string;
    locale: string;
    description: string | null;
    coverImageUrl: string | null;
    venues: VenueData[];
    persons: PersonData[];
  };
  invitation: {
    id: string;
    theme: ThemeData | null;
    template?: { id: string; name: string; eventType: string; category?: string | null };
    sections: SectionData[];
  };
  media?: MediaItem[];
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    isCeremonyOnly: boolean;
    inviteToken: string;
  } | null;
  rsvpQuestions?: RsvpQuestion[];
}

const VENUE_TYPE_LABELS: Record<string, string> = {
  Church: "Τελετή",
  Reception: "Δεξίωση",
  Ceremony: "Τελετή",
  Party: "Πάρτι",
  Other: "",
};

const PERSON_ROLE_LABELS: Record<string, string> = {
  Bride: "Νύφη",
  Groom: "Γαμπρός",
  BestMan: "Κουμπάρος",
  MaidOfHonor: "Κουμπάρα",
  Godparent: "Νονός/Νονά",
  Parent: "Γονέας",
};

export default function PublicInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <PublicInvitationInner />
    </Suspense>
  );
}

function PublicInvitationInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const inviteToken = searchParams.get("t");

  const [data, setData] = useState<PublicInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // RSVP form state
  const [rsvpForm, setRsvpForm] = useState({
    name: "",
    email: "",
    attending: null as boolean | null,
    adultCount: 1,
    childrenCount: 0,
    plusOneName: "",
    mealPreference: "",
    dietaryNotes: "",
    notes: "",
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  const load = useCallback(async () => {
    try {
      const qs = inviteToken ? `?t=${encodeURIComponent(inviteToken)}` : "";
      const res = await fetch(
        `${API_BASE}/api/v1/invitations/by-slug/${slug}${qs}`
      );
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const json = await res.json();
      setData(json);
      if (json.guest) {
        setRsvpForm((f) => ({
          ...f,
          name: `${json.guest.firstName} ${json.guest.lastName}`.trim(),
        }));
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug, inviteToken]);

  useEffect(() => {
    load();
  }, [load]);

  const submitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rsvpForm.attending === null) return;
    setRsvpSubmitting(true);
    setRsvpError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/public/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: slug,
          inviteToken: inviteToken || null,
          publicGuestName: rsvpForm.name,
          publicGuestEmail: rsvpForm.email || null,
          attendingReception: rsvpForm.attending,
          attendingCeremony: rsvpForm.attending,
          adultCount: rsvpForm.adultCount,
          childrenCount: rsvpForm.childrenCount,
          plusOneName: rsvpForm.plusOneName || null,
          mealPreference: rsvpForm.mealPreference || null,
          dietaryNotes: rsvpForm.dietaryNotes || null,
          notes: rsvpForm.notes || null,
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.title ?? "Σφάλμα");
      }
      setRsvpSubmitted(true);
    } catch (err) {
      setRsvpError(
        err instanceof Error ? err.message : "Σφάλμα. Δοκιμάστε ξανά."
      );
    } finally {
      setRsvpSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-text-primary mb-2">
            Η πρόσκληση δεν βρέθηκε
          </h1>
          <p className="text-text-secondary">
            Ο σύνδεσμος μπορεί να μην είναι σωστός ή η πρόσκληση δεν είναι
            πλέον διαθέσιμη.
          </p>
        </div>
      </div>
    );
  }

  const { event, invitation } = data;
  const media = data.media ?? [];
  const weddingStyle = resolveWeddingStyle(invitation.template?.category);
  if (weddingStyle) {
    const viewModel = toInvitationViewModel(data, weddingStyle);
    const Template = WEDDING_TEMPLATE_COMPONENTS[weddingStyle];
    return <Template data={viewModel} />;
  }

  const images = media.filter((m) => m.mediaType === "Image");
  const videos = media.filter((m) => m.mediaType === "Video");
  const pdfs = media.filter((m) => m.mediaType === "Pdf");
  const audioTracks = media.filter((m) => m.mediaType === "Audio");
  const rsvpQuestions = data.rsvpQuestions ?? [];
  const theme = invitation.theme;
  const category = (invitation.template?.category ?? "").toLowerCase();
  const themeName = theme?.name ?? "";
  const templateSkin =
    category === "birthday" || category === "party"
      ? "birthday"
      : category === "romantic" ||
          themeName.includes("Ρομαντ") ||
          themeName.toLowerCase().includes("romantic")
        ? "romantic"
        : category === "modern" ||
            themeName.includes("Μοντ") ||
            themeName.toLowerCase().includes("modern")
          ? "modern"
          : "classic";
  const isClassic = templateSkin === "classic";

  const enabledSections = invitation.sections
    .filter((s) => s.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const primaryColor = theme?.primaryColor ?? "#2E5A4C";
  const accentColor = theme?.accentColor ?? "#2E5A4C";
  const bgColor = theme?.backgroundColor ?? "#FAFAF7";
  const textColor = theme?.textColor ?? "#1A1A18";
  const surfaceColor = theme?.surfaceColor ?? "#FFFFFF";
  const displayFont = theme?.displayFontFamily ?? "var(--font-literata)";
  const bodyFont = theme?.bodyFontFamily ?? "var(--font-inter)";
  const coverImage = event.coverImageUrl ?? images[0]?.url ?? null;

  const eventDate = event.eventDate ? new Date(event.eventDate) : null;

  return (
    <main
      className={`min-h-screen invitation-skin-${templateSkin}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: `${bodyFont}, sans-serif`,
      }}
    >
      {audioTracks[0] && (
        <audio
          src={audioTracks[0].url}
          autoPlay
          loop
          controls
          className="fixed bottom-4 right-4 z-40 max-w-[220px] opacity-90"
        />
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-3xl cursor-pointer"
            onClick={() => setLightbox(null)}
          >
            &times;
          </button>
          {lightbox.mediaType === "Video" ? (
            <video
              src={lightbox.url}
              controls
              autoPlay
              className="max-h-[90vh] max-w-full"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lightbox.url}
              alt={lightbox.altText ?? ""}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {enabledSections.map((section) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config: Record<string, any> = section.configurationJson
          ? JSON.parse(section.configurationJson)
          : {};

        switch (section.sectionType) {
          case "hero":
            return (
              <section
                key={section.id}
                className={`relative flex flex-col items-center justify-center px-6 text-center overflow-hidden ${
                  isClassic ? "h-screen min-h-[680px]" : "min-h-[85vh]"
                }`}
                style={{
                  backgroundColor: primaryColor,
                  color: "white",
                }}
              >
                {coverImage && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          templateSkin === "romantic"
                            ? "linear-gradient(180deg, rgba(139,69,87,0.55), rgba(40,20,30,0.75))"
                            : templateSkin === "modern"
                              ? "linear-gradient(135deg, rgba(20,20,20,0.7), rgba(20,20,20,0.45))"
                              : templateSkin === "birthday"
                                ? "linear-gradient(135deg, rgba(26,26,24,0.72), rgba(212,165,116,0.35))"
                                : "linear-gradient(to bottom, rgba(46,90,76,0.25), rgba(26,26,24,0.45), rgba(26,26,24,0.88))",
                      }}
                    />
                  </>
                )}
                <div className="relative z-10 max-w-3xl">
                  {cfg(config, "subtitle") && (
                    <p
                      className={`uppercase ${
                        isClassic
                          ? "text-[10px] tracking-[0.5em] text-white/55 mb-10"
                          : templateSkin === "modern" || templateSkin === "birthday"
                            ? "text-xs tracking-[0.35em] mb-6 opacity-85"
                            : "text-sm tracking-[0.35em] mb-6 opacity-85"
                      }`}
                    >
                      {cfg(config, "subtitle")}
                    </p>
                  )}
                  <h1
                    className={
                      isClassic
                        ? "font-normal leading-[1.05] tracking-tight text-[clamp(3.5rem,12vw,9rem)]"
                        : `${
                            templateSkin === "modern" || templateSkin === "birthday"
                              ? "text-4xl md:text-6xl tracking-tight"
                              : "text-5xl md:text-7xl tracking-tight"
                          } font-semibold`
                    }
                    style={{
                      fontFamily:
                        templateSkin === "birthday"
                          ? `${bodyFont}, sans-serif`
                          : `${displayFont}, serif`,
                    }}
                  >
                    {(config.title as string) || event.title}
                  </h1>
                  {eventDate && (
                    <div
                      className={`mt-8 flex items-center justify-center gap-3 ${
                        isClassic ? "flex-col opacity-65" : "opacity-80"
                      }`}
                    >
                      <span
                        className={isClassic ? "h-px w-20 bg-white/35 mb-0" : "h-px w-12"}
                        style={
                          isClassic
                            ? undefined
                            : { backgroundColor: "rgba(255,255,255,0.45)" }
                        }
                      />
                      <time
                        className={
                          isClassic
                            ? "text-[10px] uppercase tracking-[0.42em] text-white/65"
                            : "text-sm tracking-wide"
                        }
                      >
                        {eventDate.toLocaleDateString("el-GR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                      {!isClassic && (
                        <span
                          className="h-px w-12"
                          style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
                        />
                      )}
                    </div>
                  )}
                </div>
                {isClassic && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <span className="block h-4 w-4 animate-bounce rotate-45 border-b border-r border-white/40" />
                  </div>
                )}
              </section>
            );

          case "welcome_text":
            return (
              <section
                key={section.id}
                className={`px-6 mx-auto text-center ${
                  isClassic ? "max-w-[560px] py-28" : "max-w-2xl py-20"
                }`}
              >
                {isClassic && <ClassicOrnament color={primaryColor} />}
                {cfg(config, "heading") && (
                  <h2
                    className={`font-semibold ${isClassic ? "mt-10 mb-4 text-2xl" : "mb-6 text-2xl"}`}
                    style={{
                      fontFamily: `${displayFont}, serif`,
                      color: primaryColor,
                    }}
                  >
                    {cfg(config, "heading")}
                  </h2>
                )}
                {cfg(config, "text") && (
                  <p
                    className={
                      isClassic
                        ? "font-normal italic mt-10 mb-10 text-[1.25rem] leading-[1.85] text-current/70"
                        : "text-lg leading-relaxed opacity-80"
                    }
                    style={
                      isClassic ? { fontFamily: `${displayFont}, serif` } : undefined
                    }
                  >
                    {cfg(config, "text")}
                  </p>
                )}
                {isClassic && <ClassicOrnament color={primaryColor} />}
              </section>
            );

          case "event_details": {
            const [leftInitial, rightInitial] = coupleInitials(
              cfg(config, "title") || event.title
            );
            const dressCode = cfg(config, "dressCode");
            const showPrintedCard = config.showPrintedCard === true;
            const venues = event.venues ?? [];
            const detailItems = eventDate
              ? [
                  {
                    label: cfg(config, "dateLabel"),
                    main: eventDate.toLocaleDateString("el-GR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                    sub: eventDate.toLocaleDateString("el-GR", { weekday: "long" }),
                  },
                  {
                    label: cfg(config, "timeLabel"),
                    main: eventDate.toLocaleTimeString("el-GR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    sub: venues[0]
                      ? (VENUE_TYPE_LABELS[venues[0].venueType] ?? venues[0].venueType)
                      : "",
                  },
                  ...(dressCode
                    ? [
                        {
                          label: cfg(config, "attireLabel"),
                          main: dressCode,
                          sub: cfg(config, "attireSub"),
                        },
                      ]
                    : []),
                ].filter((item) => item.label || item.main)
              : [];
            return (
              <section key={section.id}>
                {showPrintedCard && (
                  <div className="overflow-hidden px-6 py-24" style={{ backgroundColor: "#E8E5DE" }}>
                    <div className="mx-auto max-w-4xl">
                      <SectionIntro
                        heading={cfg(config, "paperHeading")}
                        label={cfg(config, "paperLabel")}
                        displayFont={displayFont}
                        primaryColor={primaryColor}
                        classic
                      />
                      <div className="relative mx-auto flex max-w-3xl overflow-hidden rounded-sm shadow-[6px_10px_48px_rgba(0,0,0,0.22)]">
                        <div
                          className="relative flex w-[42%] flex-col items-center justify-center px-6 py-10 text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <OliveBranch className="absolute top-8 left-6 w-10 text-white/30" />
                          {cfg(config, "paperEventType") && (
                            <p className="mb-5 text-[8px] uppercase tracking-[0.55em] text-white/40">
                              {cfg(config, "paperEventType")}
                            </p>
                          )}
                          <p
                            className="text-[2.6rem] leading-none tracking-tight"
                            style={{ fontFamily: `${displayFont}, serif` }}
                          >
                            {leftInitial}
                          </p>
                          {rightInitial && (
                            <>
                              <p className="my-1 text-base tracking-widest text-white/50">&amp;</p>
                              <p
                                className="text-[2.6rem] leading-none tracking-tight"
                                style={{ fontFamily: `${displayFont}, serif` }}
                              >
                                {rightInitial}
                              </p>
                            </>
                          )}
                          <div className="my-5 h-px w-8 bg-white/25" />
                          {eventDate && (
                            <p className="font-serif text-xs tracking-wide text-white/50">
                              {eventDate.getFullYear()}
                            </p>
                          )}
                          <OliveBranch className="absolute right-6 bottom-8 w-10 rotate-180 text-white/30" />
                        </div>
                        <div
                          className="relative flex w-[58%] flex-col items-center justify-center px-6 py-10 text-center md:px-10"
                          style={{ backgroundColor: bgColor }}
                        >
                          <div className="pointer-events-none absolute inset-[10px] border border-black/5" />
                          {cfg(config, "paperInviteLine") && (
                            <p
                              className="mb-5 text-[8px] uppercase tracking-[0.5em]"
                              style={{ color: primaryColor }}
                            >
                              {cfg(config, "paperInviteLine")}
                            </p>
                          )}
                          <h3
                            className="text-[1.4rem] leading-tight md:text-[1.8rem]"
                            style={{ fontFamily: `${displayFont}, serif` }}
                          >
                            {cfg(config, "title") || event.title}
                          </h3>
                          {eventDate && (
                            <p className="mt-6 italic opacity-50" style={{ fontFamily: `${displayFont}, serif` }}>
                              {eventDate.toLocaleDateString("el-GR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          )}
                          <div className="mt-6 w-full max-w-[220px] space-y-3">
                            {venues.slice(0, 2).map((v) => (
                              <div key={v.id} className="border-t border-black/10 pt-3">
                                <p
                                  className="mb-0.5 text-[8px] uppercase tracking-[0.4em]"
                                  style={{ color: primaryColor }}
                                >
                                  {VENUE_TYPE_LABELS[v.venueType] ?? v.venueType}
                                </p>
                                <p className="text-sm opacity-80" style={{ fontFamily: `${displayFont}, serif` }}>
                                  {v.name}
                                </p>
                                {v.time && (
                                  <p className="text-xs italic opacity-45">{v.time}</p>
                                )}
                              </div>
                            ))}
                          </div>
                          {dressCode && (
                            <p className="mt-6 text-[7px] uppercase tracking-[0.5em] opacity-25">
                              {cfg(config, "attireSub") ? `${cfg(config, "attireSub")} · ` : ""}
                              {dressCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className="px-6 py-16 md:py-20"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div className="mx-auto max-w-4xl text-center">
                    <SectionIntro
                      heading={cfg(config, "heading")}
                      label={cfg(config, "label")}
                      displayFont={displayFont}
                      primaryColor={primaryColor}
                      classic={isClassic}
                    />
                    {eventDate && isClassic && detailItems.length > 0 ? (
                      <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0" style={{ borderColor: `${primaryColor}20` }}>
                        {detailItems.map((item) => (
                          <div
                            key={item.label || item.main}
                            className="flex flex-col items-center gap-3 py-10 text-center md:px-10 md:py-0"
                          >
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full border text-sm"
                              style={{ borderColor: `${primaryColor}33`, color: primaryColor }}
                            >
                              ✦
                            </div>
                            {item.label && (
                              <p className="text-[9px] uppercase tracking-[0.4em] opacity-50">
                                {item.label}
                              </p>
                            )}
                            <p
                              className="text-2xl font-medium leading-tight"
                              style={{ fontFamily: `${displayFont}, serif` }}
                            >
                              {item.main}
                            </p>
                            {item.sub && (
                              <p
                                className="text-base italic opacity-55"
                                style={{ fontFamily: `${displayFont}, serif` }}
                              >
                                {item.sub}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : eventDate ? (
                      <div className="space-y-2">
                        <p className="text-lg">
                          {eventDate.toLocaleDateString("el-GR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="opacity-70">
                          {eventDate.toLocaleTimeString("el-GR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            );
          }

          case "countdown":
            return (
              <CountdownSection
                key={section.id}
                config={config}
                eventDate={eventDate}
                primaryColor={primaryColor}
                accentColor={accentColor}
                displayFont={displayFont}
              />
            );

          case "venue":
            return (
              <section
                key={section.id}
                className={isClassic ? "px-6 py-24" : "px-6 py-16"}
                style={{ backgroundColor: isClassic ? bgColor : surfaceColor }}
              >
                <div className={`mx-auto ${isClassic ? "max-w-5xl" : "max-w-2xl"}`}>
                  <SectionIntro
                    heading={cfg(config, "heading")}
                    label={cfg(config, "label")}
                    displayFont={displayFont}
                    primaryColor={primaryColor}
                    classic={isClassic}
                  />
                  <div
                    className={
                      isClassic
                        ? "grid gap-5 md:grid-cols-2"
                        : "space-y-10"
                    }
                  >
                    {(event.venues ?? []).map((v, i) =>
                      isClassic ? (
                        <div
                          key={v.id}
                          className="overflow-hidden border bg-white"
                          style={{
                            borderColor: `${textColor}1A`,
                            borderRadius: "2px",
                          }}
                        >
                          <div
                            className="relative flex aspect-[4/3] items-end px-6 py-5"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                            <p className="relative text-[9px] uppercase tracking-[0.45em] text-white/60">
                              {VENUE_TYPE_LABELS[v.venueType] ?? v.venueType}
                              {v.time ? ` · ${v.time}` : ""}
                            </p>
                          </div>
                          <div className="p-7">
                            <h3
                              className="mb-4 text-[1.4rem] font-normal leading-snug"
                              style={{ fontFamily: `${displayFont}, serif` }}
                            >
                              {v.name}
                            </h3>
                            <p className="text-sm leading-relaxed opacity-60">
                              {v.address}
                              {v.city ? `, ${v.city}` : ""}
                            </p>
                            {v.googleMapsUrl && cfg(config, "mapsLabel") && (
                              <a
                                href={v.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-block text-sm"
                                style={{ color: accentColor }}
                              >
                                {cfg(config, "mapsLabel")}
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div key={v.id}>
                          {i > 0 && (
                            <div
                              className="mb-10 border-t"
                              style={{ borderColor: `${primaryColor}20` }}
                            />
                          )}
                          <div className="text-center">
                            <p className="mb-2 text-xs uppercase tracking-widest opacity-50">
                              {VENUE_TYPE_LABELS[v.venueType] ?? v.venueType}
                            </p>
                            <h3
                              className="text-2xl font-semibold"
                              style={{ fontFamily: `${displayFont}, serif` }}
                            >
                              {v.name}
                            </h3>
                            <p className="mt-2 opacity-70">
                              {v.address}
                              {v.city ? `, ${v.city}` : ""}
                            </p>
                            {v.time && (
                              <p className="mt-1 text-sm opacity-50">{v.time}</p>
                            )}
                            {v.googleMapsUrl && cfg(config, "mapsLabel") && (
                              <a
                                href={v.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center text-sm transition-colors"
                                style={{ color: accentColor }}
                              >
                                {cfg(config, "mapsLabel")}
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>
            );

          case "participants":
            return (
              <section
                key={section.id}
                className={isClassic ? "border-y px-6 py-24" : "px-6 py-16"}
                style={
                  isClassic
                    ? { backgroundColor: surfaceColor, borderColor: `${textColor}1A` }
                    : undefined
                }
              >
                <div className="mx-auto max-w-4xl text-center">
                  <SectionIntro
                    heading={cfg(config, "heading")}
                    label={cfg(config, "label")}
                    displayFont={displayFont}
                    primaryColor={primaryColor}
                    classic={isClassic}
                  />
                  <div
                    className={
                      isClassic
                        ? "grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12"
                        : "flex flex-wrap justify-center gap-8 md:gap-12"
                    }
                  >
                    {(event.persons ?? []).map((p) => (
                      <div key={p.id} className="text-center">
                        <div
                          className={`mx-auto mb-3 overflow-hidden flex items-center justify-center ${
                            templateSkin === "modern" || templateSkin === "birthday"
                              ? "h-24 w-24 rounded-md"
                              : "h-24 w-24 rounded-full md:h-28 md:w-28"
                          }`}
                          style={{
                            backgroundColor: `${primaryColor}18`,
                            boxShadow: isClassic
                              ? `0 0 0 1.5px ${primaryColor}33`
                              : undefined,
                          }}
                        >
                          {p.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.photoUrl}
                              alt={p.displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span
                              className="text-2xl font-semibold"
                              style={{ color: primaryColor }}
                            >
                              {p.displayName.charAt(0)}
                            </span>
                          )}
                        </div>
                        {isClassic ? (
                          <>
                            <p
                              className="mb-1.5 text-[9px] uppercase tracking-[0.42em]"
                              style={{ color: primaryColor }}
                            >
                              {PERSON_ROLE_LABELS[p.role] ?? p.role}
                            </p>
                            <p
                              className="text-[1.05rem] leading-snug"
                              style={{ fontFamily: `${displayFont}, serif` }}
                            >
                              {p.displayName}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium">{p.displayName}</p>
                            <p className="mt-0.5 text-xs opacity-50">
                              {PERSON_ROLE_LABELS[p.role] ?? p.role}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "rsvp": {
            const rsvpConfig = config as {
              heading?: string;
              description?: string;
              showPlusOne?: boolean;
              showChildrenCount?: boolean;
              showMealPreference?: boolean;
              deadline?: string;
            };
            return (
              <section
                key={section.id}
                className={isClassic ? "classic-rsvp px-6 py-28" : "px-6 py-20"}
                style={{ backgroundColor: isClassic ? primaryColor : surfaceColor }}
              >
                <div className="mx-auto max-w-lg">
                  <SectionIntro
                    heading={cfg(config, "heading")}
                    label={cfg(config, "label")}
                    displayFont={displayFont}
                    primaryColor={primaryColor}
                    classic={isClassic}
                    light={isClassic}
                  />
                  {cfg(config, "description") && (
                    <p
                      className={`-mt-6 mb-10 text-center text-sm ${
                        isClassic ? "text-white/50" : "opacity-60"
                      }`}
                    >
                      {cfg(config, "description")}
                    </p>
                  )}

                  {rsvpSubmitted ? (
                    <div className="py-10 text-center">
                      {isClassic ? (
                        <div className="rounded-sm border border-white/15 p-10">
                          <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white">
                            ✓
                          </div>
                          <p
                            className="mb-2 text-2xl text-white"
                            style={{ fontFamily: `${displayFont}, serif` }}
                          >
                            {cfg(config, "successTitle")}
                          </p>
                          <p className="text-sm text-white/50">
                            {cfg(config, "successText")}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4 text-4xl">
                            {rsvpForm.attending ? "🎉" : "😢"}
                          </div>
                          <h3
                            className="mb-2 text-xl font-semibold"
                            style={{ color: primaryColor }}
                          >
                            {rsvpForm.attending
                              ? cfg(config, "successTitle")
                              : cfg(config, "declineTitle")}
                          </h3>
                          <p className="opacity-70">
                            {rsvpForm.attending
                              ? cfg(config, "successText")
                              : cfg(config, "declineText")}
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={submitRsvp} className="space-y-6">
                      {rsvpError && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                          {rsvpError}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          {cfg(config, "nameLabel")}
                        </label>
                        <input
                          type="text"
                          required
                          value={rsvpForm.name}
                          onChange={(e) =>
                            setRsvpForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2.5 border rounded-md bg-white outline-none transition-colors"
                          style={{
                            borderColor: `${primaryColor}30`,
                          }}
                          placeholder="π.χ. Αλέξανδρος Παπαδόπουλος"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          {cfg(config, "emailLabel")}
                        </label>
                        <input
                          type="email"
                          value={rsvpForm.email}
                          onChange={(e) =>
                            setRsvpForm((f) => ({
                              ...f,
                              email: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2.5 border rounded-md bg-white outline-none transition-colors"
                          style={{
                            borderColor: `${primaryColor}30`,
                          }}
                          placeholder="email@example.com"
                        />
                      </div>

                      <fieldset>
                        <legend className="block text-sm font-medium mb-2">
                          {cfg(config, "attendingLabel")}
                        </legend>
                        <div className="flex gap-4">
                          {[
                            { value: true, label: cfg(config, "attendingYes") },
                            { value: false, label: cfg(config, "attendingNo") },
                          ].map(({ value, label }) => (
                            <label
                              key={String(value)}
                              className="flex flex-1 cursor-pointer items-center justify-center rounded-md border px-4 py-2.5 transition-colors"
                              style={{
                                borderColor:
                                  rsvpForm.attending === value
                                    ? isClassic
                                      ? "#fff"
                                      : accentColor
                                    : isClassic
                                      ? "rgba(255,255,255,0.18)"
                                      : `${primaryColor}30`,
                                backgroundColor:
                                  rsvpForm.attending === value
                                    ? isClassic
                                      ? "#fff"
                                      : `${accentColor}15`
                                    : "transparent",
                                color:
                                  rsvpForm.attending === value && isClassic
                                    ? primaryColor
                                    : isClassic
                                      ? "rgba(255,255,255,0.65)"
                                      : undefined,
                              }}
                            >
                              <input
                                type="radio"
                                name="attending"
                                checked={rsvpForm.attending === value}
                                onChange={() =>
                                  setRsvpForm((f) => ({
                                    ...f,
                                    attending: value,
                                  }))
                                }
                                className="sr-only"
                              />
                              <span className="text-sm font-medium">
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {rsvpForm.attending && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              {cfg(config, "adultsLabel")}
                            </label>
                            <select
                              value={rsvpForm.adultCount}
                              onChange={(e) =>
                                setRsvpForm((f) => ({
                                  ...f,
                                  adultCount: parseInt(e.target.value),
                                }))
                              }
                              className="w-full px-4 py-2.5 border rounded-md bg-white outline-none transition-colors"
                              style={{
                                borderColor: `${primaryColor}30`,
                              }}
                            >
                              {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                  {n} {n === 1 ? "άτομο" : "άτομα"}
                                </option>
                              ))}
                            </select>
                          </div>

                          {rsvpConfig.showChildrenCount && (
                            <div>
                              <label className="block text-sm font-medium mb-1.5">
                                {cfg(config, "childrenLabel")}
                              </label>
                              <select
                                value={rsvpForm.childrenCount}
                                onChange={(e) =>
                                  setRsvpForm((f) => ({
                                    ...f,
                                    childrenCount: parseInt(e.target.value),
                                  }))
                                }
                                className="w-full px-4 py-2.5 border rounded-md bg-white outline-none transition-colors"
                                style={{
                                  borderColor: `${primaryColor}30`,
                                }}
                              >
                                {[0, 1, 2, 3, 4].map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {rsvpConfig.showPlusOne && (
                            <div>
                              <label className="block text-sm font-medium mb-1.5">
                                {cfg(config, "plusOneLabel")}
                              </label>
                              <input
                                type="text"
                                value={rsvpForm.plusOneName}
                                onChange={(e) =>
                                  setRsvpForm((f) => ({
                                    ...f,
                                    plusOneName: e.target.value,
                                  }))
                                }
                                className="w-full px-4 py-2.5 border rounded-md bg-white outline-none transition-colors"
                                style={{
                                  borderColor: `${primaryColor}30`,
                                }}
                              />
                            </div>
                          )}

                          {rsvpConfig.showMealPreference && (
                            <div>
                              <label className="block text-sm font-medium mb-1.5">
                                {cfg(config, "mealLabel")}
                              </label>
                              <select
                                value={rsvpForm.mealPreference}
                                onChange={(e) =>
                                  setRsvpForm((f) => ({
                                    ...f,
                                    mealPreference: e.target.value,
                                  }))
                                }
                                className="w-full px-4 py-2.5 border rounded-md bg-white outline-none transition-colors"
                                style={{
                                  borderColor: `${primaryColor}30`,
                                }}
                              >
                                <option value="">Χωρίς προτίμηση</option>
                                <option value="vegetarian">
                                  Χορτοφαγικό
                                </option>
                                <option value="vegan">Vegan</option>
                                <option value="gluten-free">
                                  Χωρίς γλουτένη
                                </option>
                              </select>
                            </div>
                          )}
                        </>
                      )}

                      {rsvpQuestions.map((q) => (
                        <div key={q.id}>
                          <label className="block text-sm font-medium mb-1.5">
                            {q.prompt}
                            {q.isRequired && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          {q.questionType === "yes_no" ? (
                            <select
                              required={q.isRequired}
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswers((a) => ({
                                  ...a,
                                  [q.id]: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2.5 border rounded-md bg-white outline-none"
                              style={{ borderColor: `${primaryColor}30` }}
                            >
                              <option value="">—</option>
                              <option value="yes">Ναι</option>
                              <option value="no">Όχι</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              required={q.isRequired}
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswers((a) => ({
                                  ...a,
                                  [q.id]: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2.5 border rounded-md bg-white outline-none"
                              style={{ borderColor: `${primaryColor}30` }}
                            />
                          )}
                        </div>
                      ))}

                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          {cfg(config, "notesLabel")}
                        </label>
                        <textarea
                          value={rsvpForm.notes}
                          onChange={(e) =>
                            setRsvpForm((f) => ({
                              ...f,
                              notes: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-4 py-2.5 border rounded-md bg-white outline-none transition-colors resize-none"
                          style={{
                            borderColor: `${primaryColor}30`,
                          }}
                          placeholder="Αλλεργίες, ειδικές ανάγκες..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={
                          rsvpSubmitting || rsvpForm.attending === null
                        }
                        className="w-full py-3 text-white font-medium rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: accentColor }}
                      >
                        {rsvpSubmitting
                          ? cfg(config, "submittingLabel")
                          : cfg(config, "submitLabel")}
                      </button>
                    </form>
                  )}
                </div>
              </section>
            );
          }

          case "gallery":
            return (
              <section key={section.id} className={isClassic ? "px-6 py-24" : "px-6 py-16"}>
                <div className={`mx-auto ${isClassic ? "max-w-6xl" : "max-w-4xl"}`}>
                  <SectionIntro
                    heading={cfg(config, "heading")}
                    label={cfg(config, "label")}
                    displayFont={displayFont}
                    primaryColor={primaryColor}
                    classic={isClassic}
                  />
                  {images.length === 0 ? (
                    <p className="text-center text-sm opacity-50">
                      {cfg(config, "emptyText")}
                    </p>
                  ) : (
                    <div
                      className={
                        isClassic
                          ? "grid grid-cols-2 gap-2 md:grid-cols-3"
                          : `grid gap-3 ${
                              templateSkin === "modern" || templateSkin === "birthday"
                                ? "grid-cols-2 md:grid-cols-4"
                                : "grid-cols-2 md:grid-cols-3"
                            }`
                      }
                    >
                      {images.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLightbox(item)}
                          className={`overflow-hidden cursor-pointer focus:outline-none ${
                            isClassic ? "aspect-[4/5] md:first:col-span-1" : "aspect-square"
                          }`}
                          style={{
                            borderRadius:
                              templateSkin === "modern" ||
                              templateSkin === "birthday" ||
                              isClassic
                                ? "2px"
                                : "12px",
                            backgroundColor: primaryColor,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnailUrl ?? item.url}
                            alt={item.altText ?? ""}
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {cfg(config, "hint") && images.length > 0 && (
                    <p className="mt-8 text-center text-[9px] uppercase tracking-[0.4em] opacity-50">
                      {cfg(config, "hint")}
                    </p>
                  )}
                  {pdfs.length > 0 && (
                    <div className="mt-8 space-y-2 text-center">
                      {pdfs.map((p) => (
                        <a
                          key={p.id}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-sm underline"
                          style={{ color: accentColor }}
                        >
                          Λήψη εκτυπώσιμης πρόσκλησης (PDF)
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );

          case "gift_list":
            return (
              <section key={section.id} className="px-6 py-16 text-center">
                <h2
                  className="text-2xl font-semibold mb-4"
                  style={{
                    fontFamily: `${displayFont}, serif`,
                    color: primaryColor,
                  }}
                >
                  {cfg(config, "heading")}
                </h2>
                <p className="opacity-60 text-sm max-w-md mx-auto">
                  {cfg(config, "text")}
                </p>
                {config.iban && (
                  <button
                    type="button"
                    className="mt-4 text-sm px-4 py-2 rounded-md cursor-pointer"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                    }}
                    onClick={() =>
                      navigator.clipboard.writeText(String(config.iban))
                    }
                  >
                    Αντιγραφή IBAN: {String(config.iban)}
                  </button>
                )}
              </section>
            );

          case "video":
            return (
              <section
                key={section.id}
                className={isClassic ? "bg-[#0F0F0D] px-6 py-20" : "px-6 py-16"}
              >
                <div className={`mx-auto ${isClassic ? "max-w-5xl" : "max-w-2xl"}`}>
                  <SectionIntro
                    heading={cfg(config, "heading")}
                    label={cfg(config, "label")}
                    displayFont={displayFont}
                    primaryColor={primaryColor}
                    classic={isClassic}
                    light={isClassic}
                  />
                  {videos[0] ? (
                    <video
                      src={videos[0].url}
                      controls
                      className="aspect-video w-full rounded-sm bg-black"
                      poster={images[0]?.url}
                    />
                  ) : config.youtubeUrl || config.embedUrl ? (
                    <div className="aspect-video overflow-hidden rounded-sm">
                      <iframe
                        src={String(config.youtubeUrl || config.embedUrl)}
                        title="Video"
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <p
                      className={`text-center text-sm ${isClassic ? "text-white/40" : "opacity-50"}`}
                    >
                      {cfg(config, "emptyText")}
                    </p>
                  )}
                </div>
              </section>
            );

          case "footer":
            return (
              <footer
                key={section.id}
                className={isClassic ? "px-6 py-20 text-center" : "px-6 py-8 text-center text-sm"}
                style={
                  isClassic
                    ? { backgroundColor: bgColor }
                    : {
                        backgroundColor: primaryColor,
                        color: "rgba(255,255,255,0.7)",
                      }
                }
              >
                {isClassic && <ClassicOrnament color={primaryColor} />}
                <p
                  className={isClassic ? "mt-8 mb-4 text-[2rem] italic opacity-50" : undefined}
                  style={
                    isClassic ? { fontFamily: `${displayFont}, serif` } : undefined
                  }
                >
                  {(config.text as string) || ""}
                </p>
                {isClassic && eventDate && (
                  <p className="text-[9px] uppercase tracking-[0.45em] opacity-50">
                    {eventDate.toLocaleDateString("el-GR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).replace(/\//g, " · ")}
                  </p>
                )}
              </footer>
            );

          default:
            return null;
        }
      })}
    </main>
  );
}

function CountdownSection({
  config,
  eventDate,
  primaryColor,
  accentColor,
  displayFont,
}: {
  config: Record<string, unknown>;
  eventDate: Date | null;
  primaryColor: string;
  accentColor: string;
  displayFont: string;
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!eventDate) return null;

  const diff = eventDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(
    0,
    Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  );
  const minutes = Math.max(
    0,
    Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  );
  const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

  return (
    <section className="px-6 py-16 text-center">
      <h2
        className="text-2xl font-semibold mb-8"
        style={{
          fontFamily: `${displayFont}, serif`,
          color: primaryColor,
        }}
      >
        {cfg(config, "heading")}
      </h2>
      <div className="flex justify-center gap-6">
        {[
          { value: days, label: "Ημέρες" },
          { value: hours, label: "Ώρες" },
          { value: minutes, label: "Λεπτά" },
          { value: seconds, label: "Δεύτερα" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div
              className="text-4xl font-bold tabular-nums"
              style={{ color: accentColor }}
            >
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-xs opacity-50 mt-2">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

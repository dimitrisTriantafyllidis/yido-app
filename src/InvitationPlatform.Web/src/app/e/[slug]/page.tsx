"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

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
    template?: { id: string; name: string; eventType: string };
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
  const images = media.filter((m) => m.mediaType === "Image");
  const videos = media.filter((m) => m.mediaType === "Video");
  const pdfs = media.filter((m) => m.mediaType === "Pdf");
  const audioTracks = media.filter((m) => m.mediaType === "Audio");
  const rsvpQuestions = data.rsvpQuestions ?? [];
  const theme = invitation.theme;
  const themeName = theme?.name ?? "";
  const templateSkin =
    themeName.includes("Ρομαντ") || themeName.toLowerCase().includes("romantic")
      ? "romantic"
      : themeName.includes("Μοντ") || themeName.toLowerCase().includes("modern")
        ? "modern"
        : "classic";

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
                className="relative flex flex-col items-center justify-center min-h-[85vh] px-6 text-center overflow-hidden"
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
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          templateSkin === "romantic"
                            ? "linear-gradient(180deg, rgba(139,69,87,0.55), rgba(40,20,30,0.75))"
                            : templateSkin === "modern"
                              ? "linear-gradient(135deg, rgba(20,20,20,0.7), rgba(20,20,20,0.45))"
                              : "linear-gradient(180deg, rgba(46,90,76,0.55), rgba(20,40,35,0.8))",
                      }}
                    />
                  </>
                )}
                <div className="relative z-10 max-w-3xl">
                  <p
                    className={`tracking-[0.35em] uppercase mb-6 opacity-85 ${
                      templateSkin === "modern" ? "text-xs" : "text-sm"
                    }`}
                  >
                    {(config.subtitle as string) ||
                      (templateSkin === "romantic"
                        ? "Με αγάπη σας προσκαλούμε"
                        : "Πρόσκληση")}
                  </p>
                  <h1
                    className={`${
                      templateSkin === "modern"
                        ? "text-4xl md:text-6xl tracking-tight"
                        : "text-5xl md:text-7xl tracking-tight"
                    } font-semibold`}
                    style={{ fontFamily: `${displayFont}, serif` }}
                  >
                    {(config.title as string) || event.title}
                  </h1>
                  {eventDate && (
                    <div className="mt-8 flex items-center justify-center gap-3 opacity-80">
                      <span
                        className="h-px w-12"
                        style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
                      />
                      <time className="text-sm tracking-wide">
                        {eventDate.toLocaleDateString("el-GR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                      <span
                        className="h-px w-12"
                        style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
                      />
                    </div>
                  )}
                </div>
              </section>
            );

          case "welcome_text":
            return (
              <section
                key={section.id}
                className="px-6 py-20 max-w-2xl mx-auto text-center"
              >
                {config.heading && (
                  <h2
                    className="text-2xl font-semibold mb-6"
                    style={{
                      fontFamily: `${displayFont}, serif`,
                      color: primaryColor,
                    }}
                  >
                    {config.heading as string}
                  </h2>
                )}
                <p className="text-lg leading-relaxed opacity-80">
                  {(config.text as string) || ""}
                </p>
              </section>
            );

          case "event_details":
            return (
              <section
                key={section.id}
                className="px-6 py-16"
                style={{ backgroundColor: surfaceColor }}
              >
                <div className="max-w-2xl mx-auto text-center">
                  <h2
                    className="text-2xl font-semibold mb-8"
                    style={{
                      fontFamily: `${displayFont}, serif`,
                      color: primaryColor,
                    }}
                  >
                    {(config.heading as string) || "Λεπτομέρειες"}
                  </h2>
                  {eventDate && (
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
                  )}
                </div>
              </section>
            );

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
                className="px-6 py-16"
                style={{ backgroundColor: surfaceColor }}
              >
                <div className="max-w-2xl mx-auto">
                  <h2
                    className="text-2xl font-semibold text-center mb-12"
                    style={{
                      fontFamily: `${displayFont}, serif`,
                      color: primaryColor,
                    }}
                  >
                    {(config.heading as string) || "Τοποθεσίες"}
                  </h2>
                  <div className="space-y-10">
                    {(event.venues ?? []).map((v, i) => (
                      <div key={v.id}>
                        {i > 0 && (
                          <div
                            className="border-t mb-10"
                            style={{
                              borderColor: `${primaryColor}20`,
                            }}
                          />
                        )}
                        <div className="text-center">
                          <p className="text-xs tracking-widest uppercase opacity-50 mb-2">
                            {VENUE_TYPE_LABELS[v.venueType] ?? v.venueType}
                          </p>
                          <h3
                            className="text-2xl font-semibold"
                            style={{
                              fontFamily: `${displayFont}, serif`,
                            }}
                          >
                            {v.name}
                          </h3>
                          <p className="mt-2 opacity-70">
                            {v.address}
                            {v.city ? `, ${v.city}` : ""}
                          </p>
                          {v.time && (
                            <p className="mt-1 opacity-50 text-sm">
                              {v.time}
                            </p>
                          )}
                          {v.googleMapsUrl && (
                            <a
                              href={v.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center mt-3 text-sm transition-colors"
                              style={{ color: accentColor }}
                            >
                              Οδηγίες στο χάρτη
                              <svg
                                className="ml-1 w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "participants":
            return (
              <section key={section.id} className="px-6 py-16">
                <div className="max-w-4xl mx-auto text-center">
                  <h2
                    className="text-2xl font-semibold mb-10"
                    style={{
                      fontFamily: `${displayFont}, serif`,
                      color: primaryColor,
                    }}
                  >
                    {(config.heading as string) || "Πρόσωπα"}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {(event.persons ?? []).map((p) => (
                      <div key={p.id} className="text-center w-28">
                        <div
                          className={`mx-auto mb-3 overflow-hidden flex items-center justify-center ${
                            templateSkin === "modern"
                              ? "w-24 h-24 rounded-md"
                              : "w-24 h-24 rounded-full"
                          }`}
                          style={{ backgroundColor: `${primaryColor}18` }}
                        >
                          {p.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.photoUrl}
                              alt={p.displayName}
                              className="w-full h-full object-cover"
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
                        <p className="font-medium text-sm">{p.displayName}</p>
                        <p className="text-xs opacity-50 mt-0.5">
                          {PERSON_ROLE_LABELS[p.role] ?? p.role}
                        </p>
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
                className="px-6 py-20"
                style={{ backgroundColor: surfaceColor }}
              >
                <div className="max-w-lg mx-auto">
                  <h2
                    className="text-2xl font-semibold text-center mb-3"
                    style={{
                      fontFamily: `${displayFont}, serif`,
                      color: primaryColor,
                    }}
                  >
                    {rsvpConfig.heading || "Επιβεβαίωση Παρουσίας"}
                  </h2>
                  {rsvpConfig.description && (
                    <p className="text-center opacity-60 text-sm mb-10">
                      {rsvpConfig.description}
                    </p>
                  )}

                  {rsvpSubmitted ? (
                    <div className="text-center py-10">
                      <div className="text-4xl mb-4">
                        {rsvpForm.attending ? "🎉" : "😢"}
                      </div>
                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: primaryColor }}
                      >
                        {rsvpForm.attending
                          ? "Ευχαριστούμε!"
                          : "Λυπούμαστε!"}
                      </h3>
                      <p className="opacity-70">
                        {rsvpForm.attending
                          ? "Η απάντησή σας καταγράφηκε. Σας περιμένουμε!"
                          : "Η απάντησή σας καταγράφηκε. Ελπίζουμε να τα πούμε σύντομα!"}
                      </p>
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
                          Ονοματεπώνυμο
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
                          Email{" "}
                          <span className="font-normal opacity-50">
                            (προαιρετικό)
                          </span>
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
                          Θα παρευρεθείτε;
                        </legend>
                        <div className="flex gap-4">
                          {[
                            { value: true, label: "Ναι, θα έρθω" },
                            { value: false, label: "Δεν θα μπορέσω" },
                          ].map(({ value, label }) => (
                            <label
                              key={String(value)}
                              className="flex-1 flex items-center justify-center px-4 py-2.5 border rounded-md cursor-pointer transition-colors"
                              style={{
                                borderColor:
                                  rsvpForm.attending === value
                                    ? accentColor
                                    : `${primaryColor}30`,
                                backgroundColor:
                                  rsvpForm.attending === value
                                    ? `${accentColor}15`
                                    : "transparent",
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
                              Αριθμός ατόμων
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
                                Αριθμός παιδιών
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
                                Όνομα συνοδού{" "}
                                <span className="font-normal opacity-50">
                                  (προαιρετικό)
                                </span>
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
                                Διατροφική προτίμηση
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
                          Σημειώσεις{" "}
                          <span className="font-normal opacity-50">
                            (προαιρετικά)
                          </span>
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
                          ? "Αποστολή..."
                          : "Αποστολή απάντησης"}
                      </button>
                    </form>
                  )}
                </div>
              </section>
            );
          }

          case "gallery":
            return (
              <section key={section.id} className="px-6 py-16">
                <div className="max-w-4xl mx-auto">
                  <h2
                    className="text-2xl font-semibold text-center mb-8"
                    style={{
                      fontFamily: `${displayFont}, serif`,
                      color: primaryColor,
                    }}
                  >
                    {(config.heading as string) || "Φωτογραφίες"}
                  </h2>
                  {images.length === 0 ? (
                    <p className="text-center text-sm opacity-50">
                      Σύντομα φωτογραφίες από την εκδήλωση.
                    </p>
                  ) : (
                    <div
                      className={`grid gap-3 ${
                        templateSkin === "romantic"
                          ? "grid-cols-2 md:grid-cols-3"
                          : templateSkin === "modern"
                            ? "grid-cols-2 md:grid-cols-4"
                            : "grid-cols-2 md:grid-cols-3"
                      }`}
                    >
                      {images.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLightbox(item)}
                          className="aspect-square overflow-hidden cursor-pointer focus:outline-none"
                          style={{
                            borderRadius:
                              templateSkin === "modern" ? "4px" : "12px",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnailUrl ?? item.url}
                            alt={item.altText ?? ""}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {pdfs.length > 0 && (
                    <div className="mt-8 text-center space-y-2">
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
                  {(config.heading as string) || "Δώρα"}
                </h2>
                <p className="opacity-60 text-sm max-w-md mx-auto">
                  {(config.text as string) ||
                    "Η παρουσία σας είναι το καλύτερο δώρο."}
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
              <section key={section.id} className="px-6 py-16">
                <div className="max-w-2xl mx-auto">
                  <h2
                    className="text-2xl font-semibold text-center mb-8"
                    style={{
                      fontFamily: `${displayFont}, serif`,
                      color: primaryColor,
                    }}
                  >
                    {(config.heading as string) || "Βίντεο"}
                  </h2>
                  {videos[0] ? (
                    <video
                      src={videos[0].url}
                      controls
                      className="w-full aspect-video rounded-lg bg-black"
                      poster={images[0]?.url}
                    />
                  ) : config.youtubeUrl || config.embedUrl ? (
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={String(config.youtubeUrl || config.embedUrl)}
                        title="Video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <p className="text-center text-sm opacity-50">
                      Δεν υπάρχει βίντεο ακόμα.
                    </p>
                  )}
                </div>
              </section>
            );

          case "footer":
            return (
              <footer
                key={section.id}
                className="px-6 py-8 text-center text-sm"
                style={{
                  backgroundColor: primaryColor,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {(config.text as string) || ""}
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
        {(config.heading as string) || "Αντίστροφη μέτρηση"}
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

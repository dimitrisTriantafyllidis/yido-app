"use client";

import { motion } from "motion/react";
import { MapPin, Check } from "lucide-react";
import type { InvitationViewModel } from "../types";
import { useInvitationRsvp } from "../use-invitation-rsvp";
import {
  formatEventDateShort,
  formatWeekday,
  formatVenueLocation,
  primaryVenueTime,
} from "../format";
import { InvitationExtraSections } from "../InvitationExtraSections";

const F = {
  display: { fontFamily: '"Cinzel", Georgia, serif' },
  body: { fontFamily: '"Lato", system-ui, sans-serif' },
  serif: { fontFamily: '"EB Garamond", Georgia, serif' },
};

const C = {
  bg: "#182040",
  card: "#1F2D52",
  surface: "#0F1628",
  accent: "#D4B896",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.5)",
  dimmed: "rgba(255,255,255,0.25)",
  border: "rgba(212,184,150,0.2)",
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1737682599438-319b61711b5f?w=1600&h=900&fit=crop&auto=format";
const FALLBACK_TABLES =
  "https://images.unsplash.com/photo-1553705426-c702161740bb?w=900&h=700&fit=crop&auto=format";
const FALLBACK_COUPLE =
  "https://images.unsplash.com/photo-1773688200700-36fca8b0f7be?w=800&h=1000&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
};

function GoldLine() {
  return (
    <div className="mx-auto h-px w-16" style={{ backgroundColor: C.accent, opacity: 0.5 }} />
  );
}

export function ElegantInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const hero = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_HERO;
  const tables = data.gallery[1]?.url || FALLBACK_TABLES;
  const couple = data.gallery[2]?.url || data.coverImageUrl || FALLBACK_COUPLE;
  const venue = data.venues[0];
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Black Tie";
  const city = venue?.city || "";
  const welcome =
    data.welcomeText ||
    "Με ιδιαίτερη τιμή και χαρά, σας προσκαλούμε να παρευρεθείτε στον γάμο μας και να γίνετε μέρος αυτής της μεγαλοπρεπούς γιορτής αγάπης.";

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="invitation-wedding-fonts min-h-screen overflow-x-hidden"
    >
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={data.title}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ backgroundColor: C.surface }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${C.surface}88 0%, ${C.bg}AA 55%, ${C.surface}EE 100%)`,
          }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p
            style={{
              ...F.body,
              color: C.accent,
              fontSize: "9px",
              letterSpacing: "0.7em",
              textTransform: "uppercase",
              marginBottom: "1.75rem",
              opacity: 0.8,
            }}
          >
            {data.eyebrow || "Κλασικό · Κομψό · Μεγαλοπρεπές"}
          </p>
          <GoldLine />
          <h1
            style={{
              ...F.display,
              fontSize: "clamp(2rem,7vw,6rem)",
              color: C.text,
              fontWeight: 400,
              lineHeight: 1.1,
              marginTop: "1.25rem",
              marginBottom: "1.25rem",
              letterSpacing: "0.05em",
            }}
          >
            {data.title}
          </h1>
          <GoldLine />
          {(dateMain || city) ? (
            <p
              style={{
                ...F.body,
                color: C.dimmed,
                fontSize: "10px",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                marginTop: "1.5rem",
              }}
            >
              {[weekday, dateMain, city].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-24 text-center" style={{ backgroundColor: C.card }}>
        <motion.div className="mx-auto max-w-lg" {...fadeUp}>
          <p
            style={{
              ...F.body,
              color: C.accent,
              fontSize: "10px",
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            Κλασικός Γάμος
          </p>
          <p
            style={{
              ...F.serif,
              fontSize: "1.35rem",
              lineHeight: 1.9,
              color: "rgba(255,255,255,0.65)",
              fontStyle: "italic",
            }}
          >
            &ldquo;{welcome}&rdquo;
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-12" style={{ backgroundColor: C.accent, opacity: 0.4 }} />
            <span style={{ color: C.accent, opacity: 0.6 }}>✦</span>
            <div className="h-px w-12" style={{ backgroundColor: C.accent, opacity: 0.4 }} />
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-20" style={{ backgroundColor: C.surface }}>
        <motion.div className="mx-auto max-w-4xl" {...fadeUp}>
          <div className="mb-14 text-center">
            <p
              style={{
                ...F.body,
                color: C.accent,
                fontSize: "10px",
                letterSpacing: "0.55em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Λεπτομέρειες
            </p>
            <h2
              style={{
                ...F.display,
                fontSize: "2rem",
                color: C.text,
                letterSpacing: "0.08em",
              }}
            >
              Η ΤΕΛΕΤΗ
            </h2>
          </div>
          <div className="grid text-center md:grid-cols-3">
            {[
              { label: "Ημερομηνία", main: dateMain || "—", sub: weekday || "" },
              {
                label: "Ώρα Τελετής",
                main: time || "—",
                sub: venue?.name || "",
              },
              { label: "Ενδυμασία", main: dress, sub: "Επίσημο Βραδινό" },
            ].map((d, i) => (
              <div
                key={d.label}
                className="px-8 py-10"
                style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : undefined }}
              >
                <p
                  style={{
                    ...F.body,
                    color: C.accent,
                    fontSize: "9px",
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                    opacity: 0.8,
                  }}
                >
                  {d.label}
                </p>
                <p
                  style={{
                    ...F.display,
                    fontSize: "1.3rem",
                    color: C.text,
                    letterSpacing: "0.04em",
                  }}
                >
                  {d.main}
                </p>
                {d.sub ? (
                  <p
                    style={{
                      ...F.serif,
                      fontSize: "0.95rem",
                      color: C.muted,
                      fontStyle: "italic",
                      marginTop: "0.25rem",
                    }}
                  >
                    {d.sub}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {venue ? (
        <section className="grid h-[520px] md:grid-cols-[3fr_2fr]">
          <div className="group relative overflow-hidden" style={{ backgroundColor: C.surface }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tables}
              alt={venue.name}
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04] group-hover:opacity-90"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${C.surface}DD, transparent 50%)` }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p
                style={{
                  ...F.body,
                  color: C.accent,
                  fontSize: "9px",
                  letterSpacing: "0.5em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                  opacity: 0.8,
                }}
              >
                Αίθουσα Δεξίωσης
              </p>
              <h3
                style={{
                  ...F.display,
                  fontSize: "1.5rem",
                  color: C.text,
                  letterSpacing: "0.04em",
                }}
              >
                {venue.name}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <MapPin className="h-3 w-3" strokeWidth={1.5} style={{ color: C.muted }} />
                <p style={{ ...F.body, fontSize: "0.75rem", color: C.muted }}>
                  {formatVenueLocation(venue.city, venue.address)}
                </p>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden" style={{ backgroundColor: C.card }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={couple}
              alt={data.title}
              className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale transition-all duration-700 group-hover:opacity-90 group-hover:grayscale-0"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${C.bg}88, transparent)` }}
            />
          </div>
        </section>
      ) : null}

      <InvitationExtraSections
        data={data}
        colors={C}
        fontDisplay={F.display}
        fontLabel={F.body}
        fontSerif={F.serif}
        posterUrl={hero}
      />

      {data.rsvp.enabled ? (
        <section
          className="px-6 py-24"
          style={{ backgroundColor: C.card, borderTop: `1px solid ${C.border}` }}
        >
          <motion.div className="mx-auto max-w-md" {...fadeUp}>
            <div className="mb-10 text-center">
              <p
                style={{
                  ...F.body,
                  color: C.accent,
                  fontSize: "10px",
                  letterSpacing: "0.55em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                  opacity: 0.8,
                }}
              >
                RSVP
              </p>
              <h2
                style={{
                  ...F.display,
                  fontSize: "1.8rem",
                  color: C.text,
                  letterSpacing: "0.06em",
                }}
              >
                ΕΠΙΒΕΒΑΙΩΣΗ
              </h2>
              {data.rsvpDeadline ? (
                <p
                  style={{
                    ...F.body,
                    color: C.muted,
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                  }}
                >
                  Έως {formatEventDateShort(data.rsvpDeadline, data.locale)}
                </p>
              ) : null}
            </div>
            {rsvp.submitted ? (
              <div className="border p-10 text-center" style={{ borderColor: C.border }}>
                <Check className="mx-auto mb-3 h-4 w-4" style={{ color: C.accent }} />
                <p
                  style={{
                    ...F.display,
                    fontSize: "1.2rem",
                    color: C.text,
                    letterSpacing: "0.05em",
                  }}
                >
                  ΕΥΧΑΡΙΣΤΟΥΜΕ
                </p>
              </div>
            ) : (
              <form onSubmit={rsvp.submit} className="space-y-3">
                {rsvp.error ? (
                  <p className="border px-3 py-2 text-sm text-red-300" style={{ borderColor: C.border }}>
                    {rsvp.error}
                  </p>
                ) : null}
                <input
                  type="text"
                  required
                  placeholder="Ονοματεπώνυμο"
                  value={rsvp.name}
                  onChange={(e) => rsvp.setName(e.target.value)}
                  className="w-full border bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#D4B896]"
                  style={{ ...F.body, borderColor: C.border }}
                />
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["yes", "Θα παραστώ"],
                      ["no", "Δεν μπορώ"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => rsvp.setAttending(key)}
                      className="border py-3 text-sm transition-all"
                      style={{
                        ...F.body,
                        borderColor: rsvp.attending === key ? C.accent : C.border,
                        backgroundColor: rsvp.attending === key ? C.accent : "transparent",
                        color: rsvp.attending === key ? C.bg : C.muted,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!rsvp.name || !rsvp.attending || rsvp.submitting}
                  className="w-full py-3 text-xs uppercase transition-all hover:opacity-80 disabled:opacity-25"
                  style={{
                    ...F.display,
                    backgroundColor: C.accent,
                    color: C.bg,
                    letterSpacing: "0.3em",
                  }}
                >
                  {rsvp.submitting ? "Αποστολή..." : "Αποστολή"}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      ) : null}

      <footer
        className="py-16 text-center"
        style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.border}` }}
      >
        <GoldLine />
        <p
          style={{
            ...F.serif,
            fontSize: "1.6rem",
            color: "rgba(255,255,255,0.45)",
            fontStyle: "italic",
            marginTop: "1.5rem",
            marginBottom: "0.75rem",
          }}
        >
          {data.footerText}
        </p>
        {dateMain ? (
          <p
            style={{
              ...F.body,
              color: C.accent,
              fontSize: "9px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            {dateMain}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

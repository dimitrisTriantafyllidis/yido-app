"use client";

import { motion } from "motion/react";
import { MapPin, Check } from "lucide-react";
import type { InvitationViewModel } from "../types";
import { useInvitationRsvp } from "../use-invitation-rsvp";
import {
  formatEventDate,
  formatEventDateShort,
  formatWeekday,
  formatVenueLocation,
  primaryVenueTime,
  formatTime,
} from "../format";
import { InvitationExtraSections } from "../InvitationExtraSections";

const SCRIPT = { fontFamily: '"Great Vibes", cursive' };
const SERIF = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const LABEL = { fontFamily: '"Lato", system-ui, sans-serif' };

const C = {
  bg: "#FFFAF8",
  card: "#FDF3F0",
  accent: "#6B1A2A",
  blush: "#E8A5A5",
  sage: "#8A9E8A",
  text: "#2C1018",
  muted: "#9A7070",
  border: "rgba(107,26,42,0.12)",
  stripe: "#6B1A2A",
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1606216794079-73f85bbd57d5?w=900&h=1200&fit=crop&auto=format";
const FALLBACK_VENUE =
  "https://images.unsplash.com/photo-1519741196428-6a2175fa2557?w=900&h=600&fit=crop&auto=format";
const FALLBACK_CARD =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=800&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export function FloralRomanceInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const hero = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_HERO;
  const venueImg = data.gallery[1]?.url || FALLBACK_VENUE;
  const cardImg = data.gallery[2]?.url || FALLBACK_CARD;
  const venue = data.venues[0];
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Cocktail";
  const dayNum = data.eventDate
    ? new Date(data.eventDate).getDate().toString()
    : "";
  const monthName = data.eventDate
    ? formatEventDate(data.eventDate, data.locale, { month: "long" }).toUpperCase()
    : "";
  const year = data.eventDate ? new Date(data.eventDate).getFullYear().toString() : "";
  const welcome =
    data.welcomeText ||
    "Ανθισμένα τριαντάφυλλα, ζεστά χρώματα και η μυρωδιά ενός καλοκαιρινού βραδιού — η πρόσκλησή μας αντικατοπτρίζει τη χαρά που νιώθουμε.";

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="invitation-wedding-fonts min-h-screen overflow-x-hidden"
    >
      <section className="relative flex min-h-screen overflow-hidden">
        <div className="relative hidden w-[42%] flex-shrink-0 md:block">
          <div
            className="absolute bottom-0 left-12 top-0 z-10 w-[3px]"
            style={{ backgroundColor: C.stripe }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt={data.title}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "saturate(0.85) brightness(0.95)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${C.bg} 0%, transparent 15%, transparent 85%, ${C.bg} 100%)`,
            }}
          />
        </div>

        <div className="relative flex flex-1 flex-col justify-center px-10 py-24 md:px-16">
          <p
            style={{
              ...LABEL,
              color: C.muted,
              fontSize: "9px",
              letterSpacing: "0.6em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            {data.eyebrow || "TOGETHER WITH THEIR FAMILIES"}
          </p>

          <div
            style={{
              ...SCRIPT,
              fontSize: "clamp(3.5rem, 10vw, 7rem)",
              color: C.accent,
              lineHeight: 1.1,
              marginBottom: "2rem",
            }}
          >
            {data.title}
          </div>

          <p
            style={{
              ...LABEL,
              color: C.muted,
              fontSize: "9px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}
          >
            INVITE YOU TO CELEBRATE THEIR WEDDING
          </p>

          <div className="flex items-start gap-6">
            {dayNum ? (
              <div style={{ borderLeft: `3px solid ${C.accent}`, paddingLeft: "1.25rem" }}>
                {monthName ? (
                  <p
                    style={{
                      ...LABEL,
                      color: C.accent,
                      fontSize: "9px",
                      letterSpacing: "0.4em",
                      textTransform: "uppercase",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {monthName}
                  </p>
                ) : null}
                <p style={{ ...SCRIPT, fontSize: "4rem", color: C.text, lineHeight: 1 }}>
                  {dayNum}
                </p>
                {year ? (
                  <p
                    style={{
                      ...LABEL,
                      color: C.muted,
                      fontSize: "9px",
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      marginTop: "0.25rem",
                    }}
                  >
                    {year}
                  </p>
                ) : null}
              </div>
            ) : null}
            {time ? (
              <div style={{ paddingTop: "0.5rem" }}>
                <p
                  style={{
                    ...LABEL,
                    color: C.accent,
                    fontSize: "9px",
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  ΩΡΑ
                </p>
                <p style={{ ...SERIF, fontSize: "1.4rem", color: C.text }}>
                  {formatTime(time)}
                </p>
              </div>
            ) : null}
          </div>

          {venue ? (
            <div className="mt-8 flex items-center gap-2">
              <MapPin className="h-3 w-3" style={{ color: C.muted }} strokeWidth={1.5} />
              <p
                style={{
                  ...LABEL,
                  color: C.muted,
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                {venue.name}
                {venue.city || venue.address
                  ? `, ${formatVenueLocation(venue.city, venue.address)}`
                  : ""}
              </p>
            </div>
          ) : null}
        </div>

        <div
          className="absolute bottom-0 left-0 top-0 w-[3px] md:hidden"
          style={{ backgroundColor: C.stripe }}
        />
      </section>

      <section className="px-6 py-20" style={{ backgroundColor: C.card }}>
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center gap-12 md:flex-row"
          {...fadeUp}
        >
          <div className="flex-1 text-center md:text-left">
            <p
              style={{
                ...LABEL,
                color: C.accent,
                fontSize: "9px",
                letterSpacing: "0.55em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Η Πρόσκλησή σας
            </p>
            <h2
              style={{
                ...SERIF,
                fontSize: "2.2rem",
                color: C.text,
                fontStyle: "italic",
                marginBottom: "1rem",
              }}
            >
              Η κάρτα<br />πρόσκλησης
            </h2>
            <p
              style={{
                ...SERIF,
                fontSize: "1.05rem",
                lineHeight: 1.85,
                color: `${C.text}99`,
                fontStyle: "italic",
                maxWidth: "360px",
              }}
            >
              &ldquo;{welcome}&rdquo;
            </p>
          </div>
          <div
            className="w-[240px] flex-shrink-0 md:w-[280px]"
            style={{
              transform: "rotate(2deg)",
              filter: "drop-shadow(0 20px 40px rgba(107,26,42,0.15))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImg}
              alt="Κάρτα πρόσκλησης"
              className="w-full rounded-[2px] object-contain"
            />
          </div>
        </motion.div>
      </section>

      <section
        className="px-6 py-20"
        style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
      >
        <motion.div className="mx-auto max-w-3xl" {...fadeUp}>
          <div className="mb-12 text-center">
            <p
              style={{
                ...LABEL,
                color: C.accent,
                fontSize: "9px",
                letterSpacing: "0.55em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Λεπτομέρειες
            </p>
            <h2 style={{ ...SERIF, fontSize: "2.5rem", color: C.text, fontStyle: "italic" }}>
              Η ημέρα μας
            </h2>
          </div>
          <div className="grid text-center md:grid-cols-3">
            {[
              { label: "Ημερομηνία", main: dateMain || "—", sub: weekday || "" },
              {
                label: "Τελετή",
                main: time || "—",
                sub: venue?.name || "",
              },
              { label: "Ενδυμασία", main: dress, sub: "Ημι-επίσημο" },
            ].map((d, i) => (
              <div
                key={d.label}
                className="px-6 py-10"
                style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : undefined }}
              >
                <p
                  style={{
                    ...LABEL,
                    color: C.muted,
                    fontSize: "9px",
                    letterSpacing: "0.45em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  {d.label}
                </p>
                <p style={{ ...SERIF, fontSize: "1.25rem", color: C.text, fontWeight: 600 }}>
                  {d.main}
                </p>
                {d.sub ? (
                  <p
                    style={{
                      ...SERIF,
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
        <section className="grid h-[380px] md:h-[460px] md:grid-cols-2">
          <div className="group relative overflow-hidden" style={{ backgroundColor: C.accent }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={venueImg}
              alt={venue.name}
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.05] group-hover:opacity-85"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${C.text}CC, transparent 50%)` }}
            />
            <div className="absolute bottom-6 left-8">
              <p
                style={{
                  ...LABEL,
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "9px",
                  letterSpacing: "0.5em",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                Δεξίωση
              </p>
              <h3
                style={{
                  ...SERIF,
                  fontSize: "1.5rem",
                  color: "#FFFFFF",
                  fontStyle: "italic",
                }}
              >
                {venue.name}
              </h3>
              <div className="mt-1.5 flex items-center gap-2">
                <MapPin className="h-3 w-3 text-white/50" strokeWidth={1.5} />
                <p style={{ ...LABEL, color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
                  {formatVenueLocation(venue.city, venue.address)}
                </p>
              </div>
            </div>
          </div>
          <div
            className="relative flex items-center justify-center p-12"
            style={{ backgroundColor: C.card }}
          >
            <div className="text-center">
              <div
                className="mx-auto mb-6 h-px w-12"
                style={{ backgroundColor: C.accent, opacity: 0.4 }}
              />
              <p
                style={{
                  ...SERIF,
                  fontSize: "1.5rem",
                  color: C.text,
                  fontStyle: "italic",
                  lineHeight: 1.7,
                }}
              >
                {data.footerText || (
                  <>
                    Ανυπομονούμε
                    <br />
                    να σας δούμε!
                  </>
                )}
              </p>
              <div
                className="mx-auto mt-6 h-px w-12"
                style={{ backgroundColor: C.accent, opacity: 0.4 }}
              />
            </div>
          </div>
        </section>
      ) : null}

      <InvitationExtraSections
        data={data}
        colors={C}
        fontDisplay={SERIF}
        fontLabel={LABEL}
        posterUrl={hero}
      />

      {data.rsvp.enabled ? (
        <section className="px-6 py-24" style={{ backgroundColor: C.accent }}>
          <motion.div className="mx-auto max-w-md" {...fadeUp}>
            <div className="mb-10 text-center">
              <p
                style={{
                  ...LABEL,
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "9px",
                  letterSpacing: "0.55em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                RSVP
              </p>
              <h2 style={{ ...SCRIPT, fontSize: "3rem", color: "#FFFFFF" }}>Επιβεβαίωση</h2>
              {data.rsvpDeadline ? (
                <p
                  style={{
                    ...LABEL,
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                  }}
                >
                  Έως {formatEventDateShort(data.rsvpDeadline, data.locale)}
                </p>
              ) : null}
            </div>
            {rsvp.submitted ? (
              <div className="border border-white/20 p-10 text-center">
                <Check className="mx-auto mb-4 h-5 w-5 text-white" />
                <p style={{ ...SCRIPT, fontSize: "2rem", color: "#FFFFFF" }}>Ευχαριστούμε!</p>
              </div>
            ) : (
              <form onSubmit={rsvp.submit} className="space-y-4">
                {rsvp.error ? (
                  <p className="bg-red-900/30 px-3 py-2 text-sm text-white">{rsvp.error}</p>
                ) : null}
                <input
                  type="text"
                  required
                  placeholder="Ονοματεπώνυμο"
                  value={rsvp.name}
                  onChange={(e) => rsvp.setName(e.target.value)}
                  className="w-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/50"
                  style={LABEL}
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
                        ...LABEL,
                        borderColor:
                          rsvp.attending === key ? "#FFFFFF" : "rgba(255,255,255,0.22)",
                        backgroundColor: rsvp.attending === key ? "#FFFFFF" : "transparent",
                        color:
                          rsvp.attending === key ? C.accent : "rgba(255,255,255,0.65)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!rsvp.name || !rsvp.attending || rsvp.submitting}
                  className="w-full bg-white py-3 text-xs uppercase tracking-[0.35em] transition-all hover:bg-white/90 disabled:opacity-30"
                  style={{ ...LABEL, color: C.accent }}
                >
                  {rsvp.submitting ? "Αποστολή..." : "Αποστολή"}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      ) : null}

      <footer className="py-16 text-center" style={{ backgroundColor: C.bg }}>
        <div
          style={{
            ...SCRIPT,
            fontSize: "2.5rem",
            color: `${C.accent}70`,
            marginBottom: "0.75rem",
          }}
        >
          {data.title}
        </div>
        {dateMain ? (
          <p
            style={{
              ...LABEL,
              color: C.muted,
              fontSize: "9px",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
            }}
          >
            {dateMain}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

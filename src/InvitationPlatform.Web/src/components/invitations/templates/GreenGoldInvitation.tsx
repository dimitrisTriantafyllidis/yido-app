"use client";

import { motion } from "motion/react";
import { MapPin, Check } from "lucide-react";
import type { CSSProperties } from "react";
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
  display: { fontFamily: '"Bodoni Moda", "Playfair Display", Georgia, serif' },
  serif: { fontFamily: '"Cormorant Garamond", Georgia, serif' },
  label: { fontFamily: '"Lato", system-ui, sans-serif' },
};

const C = {
  bg: "#FFFFFF",
  card: "#F8F8F5",
  accent: "#2A4A30",
  gold: "#C9A840",
  text: "#1A1A18",
  muted: "#6A6A60",
  border: "rgba(42,74,48,0.12)",
};

const FALLBACK_CARD =
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=800&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function GreenLeaves({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 120 130" fill="none" className={className} style={style}>
      <path d="M10 130 C20 95 45 60 80 30 C60 60 35 90 10 130Z" fill="#3D6B4F" opacity="0.85" />
      <path d="M30 130 C38 100 58 70 90 45 C72 72 50 100 30 130Z" fill="#2A4A30" opacity="0.9" />
      <path d="M0 100 C12 75 30 55 55 38 C38 60 18 80 0 100Z" fill="#4A7A5A" opacity="0.7" />
      <path d="M50 130 C55 108 68 88 88 70 C76 90 60 110 50 130Z" fill="#5A8A6A" opacity="0.6" />
    </svg>
  );
}

function GoldTulip({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 60 120" fill="none" className={className} style={style}>
      <path d="M30 120 L30 55" stroke={C.gold} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M30 55 C20 45 14 32 18 20 C22 32 28 44 30 55Z" stroke={C.gold} strokeWidth="1" fill="none" />
      <path d="M30 55 C40 45 46 32 42 20 C38 32 32 44 30 55Z" stroke={C.gold} strokeWidth="1" fill="none" />
      <path d="M30 55 C24 42 24 28 30 18 C36 28 36 42 30 55Z" stroke={C.gold} strokeWidth="1" fill="none" />
      <path d="M30 85 C22 78 16 68 20 60 C26 68 30 78 30 85Z" stroke={C.gold} strokeWidth="0.9" fill="none" />
    </svg>
  );
}

function GoldTulipBig({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 90 180" fill="none" className={className} style={style}>
      <path d="M45 180 L45 80" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M45 80 C28 65 18 44 24 26 C32 44 40 62 45 80Z" stroke={C.gold} strokeWidth="1.2" fill="none" />
      <path d="M45 80 C62 65 72 44 66 26 C58 44 50 62 45 80Z" stroke={C.gold} strokeWidth="1.2" fill="none" />
      <path d="M45 80 C34 60 34 38 45 22 C56 38 56 60 45 80Z" stroke={C.gold} strokeWidth="1.2" fill="none" />
      <path d="M45 125 C32 115 24 100 28 88 C36 100 42 114 45 125Z" stroke={C.gold} strokeWidth="1" fill="none" />
      <path d="M45 125 C58 115 66 100 62 88 C54 100 48 114 45 125Z" stroke={C.gold} strokeWidth="1" fill="none" />
    </svg>
  );
}

function venueRole(venueType: string, index: number): string {
  if (venueType === "Church" || venueType === "Ceremony") return "Τελετή";
  if (venueType === "Reception") return "Δεξίωση";
  return index === 0 ? "Τελετή" : "Δεξίωση";
}

export function GreenGoldInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const cardImg = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_CARD;
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Formal";
  const venue = data.venues[0];
  const dateUpper = dateMain ? dateMain.toUpperCase() : "";

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="invitation-wedding-fonts min-h-screen overflow-x-hidden"
    >
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <GreenLeaves className="pointer-events-none absolute left-0 top-0 w-28 opacity-90 md:w-40" />
        <GoldTulip className="pointer-events-none absolute right-8 top-4 w-10 opacity-80 md:w-14" />
        <div className="pointer-events-none absolute bottom-0 right-0 flex items-end">
          <GreenLeaves
            className="w-24 opacity-80 md:w-36"
            style={{ transform: "rotate(180deg) scaleX(-1)" }}
          />
          <GoldTulipBig
            className="mb-0 w-14 opacity-75 md:w-20"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        <div className="relative z-10 max-w-3xl px-12 py-28 md:px-20">
          <p
            style={{
              ...F.label,
              color: C.accent,
              fontSize: "9px",
              letterSpacing: "0.65em",
              textTransform: "uppercase",
              marginBottom: "2rem",
            }}
          >
            {data.eyebrow || "Save the Date"}
          </p>

          <div
            style={{
              ...F.display,
              fontSize: "clamp(2.5rem,9vw,7rem)",
              color: C.accent,
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              fontWeight: 700,
            }}
          >
            {data.title}
          </div>

          <div className="my-7 h-px w-16" style={{ backgroundColor: C.border }} />

          <p
            style={{
              ...F.label,
              color: C.muted,
              fontSize: "9px",
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}
          >
            Celebration of their wedding
          </p>

          {dateUpper ? (
            <p
              style={{
                ...F.display,
                fontSize: "clamp(1.5rem,4vw,2.8rem)",
                color: C.text,
                letterSpacing: "0.06em",
                fontWeight: 400,
                marginBottom: "2rem",
              }}
            >
              {dateUpper}
            </p>
          ) : null}

          {venue ? (
            <div className="mb-5">
              <p
                style={{
                  ...F.label,
                  color: C.text,
                  fontSize: "9px",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  lineHeight: 2,
                }}
              >
                {venue.name}
              </p>
              <p
                style={{
                  ...F.label,
                  color: C.muted,
                  fontSize: "9px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                {formatVenueLocation(venue.city, venue.address)}
              </p>
            </div>
          ) : null}

          {data.rsvpDeadline ? (
            <p
              style={{
                ...F.label,
                color: C.muted,
                fontSize: "9px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                lineHeight: 2,
              }}
            >
              RSVP Έως {formatEventDateShort(data.rsvpDeadline, data.locale)}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-20" style={{ backgroundColor: C.card }}>
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center gap-14 md:flex-row"
          {...fadeUp}
        >
          <div
            className="w-52 shrink-0 md:w-64"
            style={{
              transform: "rotate(-2deg)",
              filter: "drop-shadow(0 18px 40px rgba(42,74,48,0.12))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImg}
              alt="Save the Date — Green & Gold"
              className="h-auto w-full object-contain"
            />
          </div>
          <div>
            <p
              style={{
                ...F.label,
                color: C.accent,
                fontSize: "10px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Η Πρόσκλησή σας
            </p>
            <h2
              style={{
                ...F.display,
                fontSize: "2.8rem",
                color: C.text,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1,
                marginBottom: "1rem",
              }}
            >
              GREEN &amp; <span style={{ color: C.gold }}>GOLD</span>
            </h2>
            <p
              style={{
                ...F.serif,
                fontSize: "1.1rem",
                lineHeight: 1.9,
                color: `${C.text}88`,
                fontStyle: "italic",
                maxWidth: "360px",
              }}
            >
              {data.welcomeText ||
                "Καθαρές γραμμές, εντυπωσιακή τυπογραφία και ένα άγγιγμα χρυσού — η πιο editorial πρόσκληση γάμου."}
            </p>
          </div>
        </motion.div>
      </section>

      <motion.section className="border-y px-6 py-20" style={{ borderColor: C.border }} {...fadeUp}>
        <div className="mx-auto max-w-3xl">
          <div className="grid text-center md:grid-cols-3">
            {[
              { label: "Ημερομηνία", main: dateMain || "—", sub: weekday || "" },
              {
                label: "Τελετή",
                main: time || "—",
                sub: venue?.name || "",
              },
              { label: "Ενδυμασία", main: dress, sub: "Black tie optional" },
            ].map((d, i) => (
              <div
                key={d.label}
                className="px-6 py-12"
                style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : undefined }}
              >
                <p
                  style={{
                    ...F.label,
                    color: C.muted,
                    fontSize: "9px",
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  {d.label}
                </p>
                <p
                  style={{
                    ...F.display,
                    fontSize: "1.6rem",
                    color: C.accent,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                  }}
                >
                  {d.main}
                </p>
                {d.sub ? (
                  <p
                    style={{
                      ...F.serif,
                      fontSize: "1rem",
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
        </div>
      </motion.section>

      {data.venues.length > 0 ? (
        <section className="px-6 py-20" style={{ backgroundColor: C.card }}>
          <motion.div className="mx-auto grid max-w-2xl gap-5 md:grid-cols-2" {...fadeUp}>
            {data.venues.slice(0, 2).map((v, i) => (
              <div key={v.id} className="border p-8" style={{ borderColor: C.border }}>
                <p
                  style={{
                    ...F.label,
                    color: C.gold,
                    fontSize: "9px",
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  {venueRole(v.venueType, i)}
                </p>
                <h3
                  style={{
                    ...F.display,
                    fontSize: "1.6rem",
                    color: C.accent,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    marginBottom: "0.6rem",
                  }}
                >
                  {v.name}
                </h3>
                <div className="flex items-start gap-2">
                  <MapPin
                    className="mt-0.5 h-3 w-3 shrink-0"
                    strokeWidth={1.5}
                    style={{ color: C.muted }}
                  />
                  <p
                    style={{
                      ...F.serif,
                      fontSize: "0.95rem",
                      color: C.muted,
                      fontStyle: "italic",
                    }}
                  >
                    {formatVenueLocation(v.city, v.address)}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>
      ) : null}

      <InvitationExtraSections
        data={data}
        colors={C}
        fontDisplay={F.display}
        fontLabel={F.label}
        fontSerif={F.serif}
        posterUrl={data.coverImageUrl || data.gallery[0]?.url || undefined}
      />

      {data.rsvp.enabled ? (
        <section className="px-6 py-24" style={{ backgroundColor: C.accent }}>
          <motion.div className="mx-auto max-w-md" {...fadeUp}>
            <div className="mb-10 text-center">
              <p
                style={{
                  ...F.label,
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "9px",
                  letterSpacing: "0.6em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                RSVP
              </p>
              <h2
                style={{
                  ...F.display,
                  fontSize: "3rem",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                ΕΠΙΒΕΒΑΙΩΣΗ
              </h2>
              {data.rsvpDeadline ? (
                <p
                  style={{
                    ...F.label,
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
                <p
                  style={{
                    ...F.display,
                    fontSize: "1.8rem",
                    color: "#FFFFFF",
                    fontWeight: 700,
                  }}
                >
                  ΕΥΧΑΡΙΣΤΟΥΜΕ
                </p>
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
                  style={F.label}
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
                        ...F.label,
                        borderColor:
                          rsvp.attending === key ? C.gold : "rgba(255,255,255,0.22)",
                        backgroundColor: rsvp.attending === key ? C.gold : "transparent",
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
                  className="w-full py-3 text-xs uppercase tracking-[0.4em] transition-all hover:opacity-85 disabled:opacity-30"
                  style={{ ...F.label, backgroundColor: C.gold, color: C.accent }}
                >
                  {rsvp.submitting ? "Αποστολή..." : "Αποστολή"}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      ) : null}

      <footer className="px-12 py-16" style={{ backgroundColor: C.bg }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <GreenLeaves className="w-16 opacity-60" />
          <div className="text-center">
            <p
              style={{
                ...F.display,
                fontSize: "1.5rem",
                color: `${C.accent}60`,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {data.footerText || data.title}
            </p>
            {dateMain ? (
              <p
                style={{
                  ...F.label,
                  color: C.muted,
                  fontSize: "9px",
                  letterSpacing: "0.45em",
                  textTransform: "uppercase",
                  marginTop: "0.5rem",
                }}
              >
                {dateMain}
              </p>
            ) : null}
          </div>
          <GoldTulip className="w-8 opacity-60" />
        </div>
      </footer>
    </div>
  );
}

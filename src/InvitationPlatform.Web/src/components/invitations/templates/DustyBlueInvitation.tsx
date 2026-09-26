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
} from "../format";
import { InvitationExtraSections } from "../InvitationExtraSections";

const F = {
  script: { fontFamily: '"Great Vibes", cursive' },
  display: { fontFamily: '"Cormorant Garamond", Georgia, serif' },
  label: { fontFamily: '"Lato", system-ui, sans-serif' },
};

const C = {
  bg: "#D9E2EE",
  bgDeep: "#C8D5E5",
  card: "#FFFFFF",
  accent: "#4A6A8A",
  blush: "#C49898",
  gold: "#B8965A",
  text: "#1A2030",
  muted: "#6A7A8A",
  border: "rgba(74,106,138,0.15)",
};

const FALLBACK_CARD =
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=800&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function FloralCorner({ flip = false, flipY = false }: { flip?: boolean; flipY?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className="h-full w-full"
      style={{ transform: `${flip ? "scaleX(-1)" : ""} ${flipY ? "scaleY(-1)" : ""}` }}
    >
      <ellipse cx="30" cy="35" rx="18" ry="11" transform="rotate(-40 30 35)" fill="#7A90AA" opacity="0.55" />
      <ellipse cx="20" cy="50" rx="20" ry="11" transform="rotate(-20 20 50)" fill="#6A82A0" opacity="0.5" />
      <ellipse cx="10" cy="70" rx="22" ry="10" transform="rotate(-10 10 70)" fill="#8A9EBA" opacity="0.45" />
      <ellipse cx="45" cy="25" rx="16" ry="10" transform="rotate(-55 45 25)" fill="#D4A8A8" opacity="0.5" />
      <ellipse cx="60" cy="18" rx="14" ry="9" transform="rotate(-70 60 18)" fill="#C89898" opacity="0.4" />
      <path d="M0 100 C20 70 35 40 55 15" stroke="#8A9EBA" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M0 90 C15 65 28 45 48 22" stroke="#7A90AA" strokeWidth="0.8" fill="none" opacity="0.35" />
      <path d="M5 80 C12 65 18 50 28 35" stroke={C.gold} strokeWidth="0.7" fill="none" opacity="0.45" />
      <path d="M28 35 C22 28 18 22 20 14" stroke={C.gold} strokeWidth="0.6" fill="none" opacity="0.35" />
      <path d="M28 35 C34 30 38 25 38 18" stroke={C.gold} strokeWidth="0.6" fill="none" opacity="0.35" />
      <circle cx="55" cy="55" r="10" fill="white" opacity="0.65" />
      <circle cx="55" cy="55" r="5" fill="#5A6A7A" opacity="0.4" />
      <ellipse cx="55" cy="43" rx="6" ry="10" fill="white" opacity="0.5" />
      <ellipse cx="67" cy="55" rx="10" ry="6" fill="white" opacity="0.45" />
    </svg>
  );
}

function venueRole(venueType: string, index: number): string {
  if (venueType === "Church" || venueType === "Ceremony") return "Τελετή";
  if (venueType === "Reception") return "Δεξίωση";
  return index === 0 ? "Τελετή" : "Δεξίωση";
}

export function DustyBlueInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const cardImg = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_CARD;
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Elegant";
  const dayNum = data.eventDate ? new Date(data.eventDate).getDate().toString() : "";
  const monthYear = data.eventDate
    ? formatEventDate(data.eventDate, data.locale, { month: "long", year: "numeric" })
    : "";
  const venueA = data.venues[0];
  const welcome =
    data.welcomeText ||
    "Με αγάπη και χαρά σας καλούμε να γιορτάσουμε μαζί την πιο σημαντική μέρα της ζωής μας.";

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="invitation-wedding-fonts min-h-screen overflow-x-hidden"
    >
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20"
        style={{
          background: `linear-gradient(135deg, ${C.bgDeep} 0%, ${C.bg} 50%, #D4DDF0 100%)`,
        }}
      >
        <div className="absolute left-0 top-0 h-48 w-48 opacity-80 md:h-64 md:w-64">
          <FloralCorner />
        </div>
        <div className="absolute right-0 top-0 h-48 w-48 opacity-80 md:h-64 md:w-64">
          <FloralCorner flip />
        </div>
        <div className="absolute bottom-0 left-0 h-48 w-48 opacity-80 md:h-64 md:w-64">
          <FloralCorner flipY />
        </div>
        <div className="absolute bottom-0 right-0 h-48 w-48 opacity-80 md:h-64 md:w-64">
          <FloralCorner flip flipY />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md">
          <div
            className="rounded-[50%/40%] bg-white px-10 py-16 text-center shadow-2xl"
            style={{
              boxShadow: `0 24px 70px rgba(74,106,138,0.18), 0 6px 20px rgba(0,0,0,0.06)`,
            }}
          >
            <h1
              style={{
                ...F.script,
                fontSize: "clamp(2.2rem,8vw,4rem)",
                color: C.text,
                lineHeight: 1.15,
              }}
            >
              {data.title}
            </h1>

            <p
              style={{
                ...F.label,
                color: C.muted,
                fontSize: "8.5px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                margin: "1.5rem 0 0.35rem",
              }}
            >
              {data.eyebrow || "Together with their families"}
            </p>
            <p
              style={{
                ...F.label,
                color: C.muted,
                fontSize: "8.5px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              Invite you to their wedding celebration
            </p>

            <div className="mb-1 flex items-center justify-center gap-4">
              {weekday ? (
                <div className="text-right">
                  <div className="mb-1.5 h-px w-10" style={{ backgroundColor: `${C.text}30` }} />
                  <p
                    style={{
                      ...F.label,
                      color: C.muted,
                      fontSize: "9px",
                      letterSpacing: "0.35em",
                      textTransform: "uppercase",
                    }}
                  >
                    {weekday}
                  </p>
                  <div className="mt-1.5 h-px w-10" style={{ backgroundColor: `${C.text}30` }} />
                </div>
              ) : null}
              {dayNum ? (
                <p style={{ ...F.script, fontSize: "3.5rem", color: C.text, lineHeight: 1 }}>
                  {dayNum}
                </p>
              ) : null}
              {time ? (
                <div className="text-left">
                  <div
                    className="mb-1.5 ml-auto h-px w-10"
                    style={{ backgroundColor: `${C.text}30` }}
                  />
                  <p
                    style={{
                      ...F.label,
                      color: C.muted,
                      fontSize: "9px",
                      letterSpacing: "0.35em",
                      textTransform: "uppercase",
                    }}
                  >
                    στις {time}
                  </p>
                  <div className="mt-1.5 h-px w-10" style={{ backgroundColor: `${C.text}30` }} />
                </div>
              ) : null}
            </div>
            {monthYear ? (
              <p
                style={{
                  ...F.label,
                  color: C.gold,
                  fontSize: "9px",
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                }}
              >
                {monthYear}
              </p>
            ) : null}

            {venueA ? (
              <p
                style={{
                  ...F.display,
                  color: C.muted,
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                {formatVenueLocation(venueA.city, venueA.address) || venueA.name}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-6 py-20" style={{ backgroundColor: C.card }}>
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center gap-14 md:flex-row"
          {...fadeUp}
        >
          <div
            className="w-56 shrink-0 overflow-hidden rounded-[4px] md:w-72"
            style={{
              boxShadow: `0 20px 50px rgba(74,106,138,0.15), 0 4px 14px rgba(0,0,0,0.06)`,
              transform: "rotate(-1.5deg)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cardImg} alt="Dusty Blue Πρόσκληση" className="h-auto w-full object-contain" />
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
                ...F.script,
                fontSize: "3rem",
                color: C.text,
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              Dusty Blue Floral
            </h2>
            <p
              style={{
                ...F.display,
                fontSize: "1.05rem",
                lineHeight: 1.9,
                color: `${C.text}88`,
                fontStyle: "italic",
                marginBottom: "1.5rem",
              }}
            >
              Λεπτά υδατογραφικά άνθη σε αποχρώσεις dusty blue και blush, με χρυσές λεπτομέρειες
              που αγκαλιάζουν το λευκό ωοειδές πλαίσιο.
            </p>
            <div className="h-px w-12" style={{ backgroundColor: C.gold, opacity: 0.4 }} />
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-24 text-center" style={{ backgroundColor: C.bg }}>
        <motion.div className="mx-auto max-w-md" {...fadeUp}>
          <div className="mx-auto mb-8 h-px w-12" style={{ backgroundColor: C.accent, opacity: 0.3 }} />
          <p
            style={{
              ...F.display,
              fontSize: "1.35rem",
              lineHeight: 1.9,
              color: `${C.text}88`,
              fontStyle: "italic",
            }}
          >
            &ldquo;{welcome}&rdquo;
          </p>
          <div className="mx-auto mt-8 h-px w-12" style={{ backgroundColor: C.blush, opacity: 0.4 }} />
        </motion.div>
      </section>

      <motion.section
        className="border-y px-6 py-16"
        style={{ backgroundColor: C.card, borderColor: C.border }}
        {...fadeUp}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p
            style={{
              ...F.label,
              color: C.accent,
              fontSize: "10px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}
          >
            Λεπτομέρειες
          </p>
          <div className="grid md:grid-cols-3">
            {[
              {
                label: "Ημερομηνία",
                script: dateMain || "—",
                sub: weekday || "",
              },
              { label: "Ώρα", script: time || "—", sub: "Βραδινή τελετή" },
              { label: "Ενδυμασία", script: dress, sub: "Formal Attire" },
            ].map((d, i) => (
              <div
                key={d.label}
                className="px-6 py-10"
                style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : undefined }}
              >
                <p
                  style={{
                    ...F.label,
                    color: C.muted,
                    fontSize: "9px",
                    letterSpacing: "0.45em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  {d.label}
                </p>
                <p style={{ ...F.script, fontSize: "2.2rem", color: C.accent, lineHeight: 1.1 }}>
                  {d.script}
                </p>
                {d.sub ? (
                  <p
                    style={{
                      ...F.display,
                      fontSize: "0.9rem",
                      color: C.muted,
                      fontStyle: "italic",
                      marginTop: "0.2rem",
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
        <section className="px-6 py-20" style={{ backgroundColor: C.bg }}>
          <motion.div className="mx-auto grid max-w-2xl gap-5 md:grid-cols-2" {...fadeUp}>
            {data.venues.slice(0, 2).map((v, i) => (
              <div
                key={v.id}
                className="rounded-[2px] p-7"
                style={{
                  backgroundColor: C.card,
                  boxShadow: `0 4px 20px rgba(74,106,138,0.08)`,
                }}
              >
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
                    ...F.script,
                    fontSize: "1.9rem",
                    color: C.text,
                    lineHeight: 1.2,
                    marginBottom: "0.5rem",
                  }}
                >
                  {v.name}
                </h3>
                <div className="flex items-start gap-2">
                  <MapPin
                    className="mt-1 h-3 w-3 shrink-0"
                    strokeWidth={1.5}
                    style={{ color: C.blush }}
                  />
                  <p
                    style={{
                      ...F.display,
                      fontSize: "0.9rem",
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
        posterUrl={data.coverImageUrl || data.gallery[0]?.url || undefined}
      />

      {data.rsvp.enabled ? (
        <section className="px-6 py-24" style={{ backgroundColor: C.accent }}>
          <motion.div className="mx-auto max-w-md" {...fadeUp}>
            <div className="mb-10 text-center">
              <h2
                style={{
                  ...F.script,
                  fontSize: "3.5rem",
                  color: "#FFFFFF",
                  lineHeight: 1,
                  marginBottom: "0.25rem",
                }}
              >
                Επιβεβαίωση
              </h2>
              {data.rsvpDeadline ? (
                <p style={{ ...F.label, color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                  Έως {formatEventDateShort(data.rsvpDeadline, data.locale)}
                </p>
              ) : null}
            </div>
            {rsvp.submitted ? (
              <div className="rounded-[50%/20%] border border-white/20 px-8 py-10 text-center">
                <Check className="mx-auto mb-3 h-5 w-5 text-white" />
                <p style={{ ...F.script, fontSize: "2.5rem", color: "#FFFFFF" }}>Ευχαριστούμε!</p>
              </div>
            ) : (
              <form onSubmit={rsvp.submit} className="space-y-4">
                {rsvp.error ? (
                  <p className="rounded-[2px] bg-red-900/30 px-3 py-2 text-sm text-white">
                    {rsvp.error}
                  </p>
                ) : null}
                <input
                  type="text"
                  required
                  placeholder="Ονοματεπώνυμο"
                  value={rsvp.name}
                  onChange={(e) => rsvp.setName(e.target.value)}
                  className="w-full rounded-[2px] border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/50"
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
                      className="rounded-[2px] border py-3 text-sm transition-all"
                      style={{
                        ...F.label,
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
                  className="w-full rounded-[2px] bg-white py-3 text-xs uppercase tracking-[0.35em] transition-all hover:bg-white/90 disabled:opacity-30"
                  style={{ ...F.label, color: C.accent }}
                >
                  {rsvp.submitting ? "Αποστολή..." : "Αποστολή"}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      ) : null}

      <footer className="py-16 text-center" style={{ backgroundColor: C.bg }}>
        <div className="mx-auto mb-6 h-px w-12" style={{ backgroundColor: C.gold, opacity: 0.35 }} />
        <p
          style={{
            ...F.script,
            fontSize: "2.5rem",
            color: `${C.text}55`,
            lineHeight: 1,
            marginBottom: "0.5rem",
          }}
        >
          {data.footerText}
        </p>
        {dateMain ? (
          <p
            style={{
              ...F.label,
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

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
  display: { fontFamily: '"Playfair Display", Georgia, serif' },
  body: { fontFamily: '"Crimson Pro", Georgia, serif' },
  label: { fontFamily: '"Lato", system-ui, sans-serif' },
};

const C = {
  bg: "#F7F0E4",
  card: "#EEE5D5",
  accent: "#8B6070",
  text: "#2C1F1A",
  muted: "#9B8070",
  border: "rgba(139,96,112,0.15)",
  sage: "#8A9B7A",
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1556337137-c7de215dfa78?w=1600&h=900&fit=crop&auto=format";
const FALLBACK_ROSES =
  "https://images.unsplash.com/photo-1724511271868-b644d474326b?w=900&h=700&fit=crop&auto=format";
const FALLBACK_INTIMATE =
  "https://images.unsplash.com/photo-1519741196428-6a2175fa2557?w=900&h=700&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function VintageOrnament() {
  return (
    <svg viewBox="0 0 120 20" fill="none" className="mx-auto w-32" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 10 Q20 4 40 10 Q60 16 80 10 Q100 4 120 10"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.5"
      />
      <circle cx="60" cy="10" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="10" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="100" cy="10" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function VintageInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const hero = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_HERO;
  const roses = data.gallery[1]?.url || FALLBACK_ROSES;
  const intimate = data.gallery[2]?.url || data.coverImageUrl || FALLBACK_INTIMATE;
  const venue = data.venues[0];
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Elegant";
  const welcome =
    data.welcomeText ||
    "Με αγάπη και χαρά σας προσκαλούμε να μοιραστείτε μαζί μας τη μεγαλύτερη στιγμή της ζωής μας. Η παρουσία σας θα είναι το πιο πολύτιμο δώρο.";

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="invitation-wedding-fonts min-h-screen overflow-x-hidden"
    >
      <section className="relative h-screen min-h-[620px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={data.title}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ backgroundColor: C.accent }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: "128px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${C.accent}22 0%, ${C.text}66 50%, ${C.text}CC 100%)`,
          }}
        />

        <div className="pointer-events-none absolute inset-6 border border-white/10 md:inset-10" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
          <p
            style={{
              ...F.label,
              color: "rgba(255,255,255,0.45)",
              fontSize: "9px",
              letterSpacing: "0.6em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}
          >
            {data.eyebrow || "Ρομαντική Πρόσκληση Γάμου"}
          </p>
          <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>
            <VintageOrnament />
          </div>
          <h1
            style={{
              ...F.display,
              fontSize: "clamp(2.8rem,10vw,7.5rem)",
              color: "#FFFFFF",
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: "1rem",
              fontStyle: "italic",
            }}
          >
            {data.title}
          </h1>
          <div style={{ color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem" }}>
            <VintageOrnament />
          </div>
          {dateMain ? (
            <p
              style={{
                ...F.label,
                color: "rgba(255,255,255,0.55)",
                fontSize: "10px",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
              }}
            >
              {weekday ? `${weekday} · ` : ""}
              {dateMain}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <motion.div className="mx-auto max-w-lg" {...fadeUp}>
          <div style={{ color: C.accent, marginBottom: "1.5rem" }}>
            <VintageOrnament />
          </div>
          <p
            style={{
              ...F.body,
              fontSize: "1.3rem",
              lineHeight: 1.9,
              color: `${C.text}99`,
              fontStyle: "italic",
            }}
          >
            &ldquo;{welcome}&rdquo;
          </p>
          <div className="mt-8" style={{ color: C.accent }}>
            <VintageOrnament />
          </div>
        </motion.div>
      </section>

      <motion.section className="px-6 py-16" style={{ backgroundColor: C.card }} {...fadeUp}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p
              style={{
                ...F.label,
                color: C.accent,
                fontSize: "10px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Λεπτομέρειες
            </p>
            <h2 style={{ ...F.display, fontSize: "2.5rem", color: C.text, fontStyle: "italic" }}>
              Η Ημερομηνία
            </h2>
          </div>
          <div className="grid gap-0 border md:grid-cols-3" style={{ borderColor: C.border }}>
            {[
              { label: "Ημερομηνία", main: dateMain || "—", sub: weekday || "" },
              {
                label: "Τελετή",
                main: time || "—",
                sub: venue?.name || "",
              },
              { label: "Ενδυμασία", main: dress, sub: "Παστέλ αποχρώσεις" },
            ].map((d, i) => (
              <div
                key={d.label}
                className="px-6 py-10 text-center"
                style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : undefined }}
              >
                <p
                  style={{
                    ...F.label,
                    color: C.muted,
                    fontSize: "9px",
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  {d.label}
                </p>
                <p style={{ ...F.display, fontSize: "1.3rem", color: C.text, fontWeight: 600 }}>
                  {d.main}
                </p>
                {d.sub ? (
                  <p
                    style={{
                      ...F.body,
                      fontSize: "0.9rem",
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

      {venue ? (
        <section className="grid h-[480px] md:grid-cols-[5fr_4fr]">
          <div className="group relative overflow-hidden" style={{ backgroundColor: C.card }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={roses}
              alt={venue.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${C.text}99 0%, transparent 50%)` }}
            />
            <div className="absolute bottom-6 left-8">
              <p
                style={{
                  ...F.label,
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "9px",
                  letterSpacing: "0.5em",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                Χώρος Δεξίωσης
              </p>
              <h3
                style={{
                  ...F.display,
                  fontSize: "1.5rem",
                  color: "#FFFFFF",
                  fontStyle: "italic",
                }}
              >
                {venue.name}
              </h3>
              <div className="mt-1.5 flex items-center gap-2">
                <MapPin className="h-3 w-3 text-white/50" strokeWidth={1.5} />
                <p style={{ ...F.label, color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
                  {formatVenueLocation(venue.city, venue.address)}
                </p>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden" style={{ backgroundColor: C.accent }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={intimate}
              alt={data.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </section>
      ) : null}

      <InvitationExtraSections
        data={data}
        colors={C}
        fontDisplay={F.display}
        fontLabel={F.label}
        fontSerif={F.body}
        posterUrl={hero}
      />

      {data.rsvp.enabled ? (
        <section className="px-6 py-24" style={{ backgroundColor: C.accent }}>
          <motion.div className="mx-auto max-w-md" {...fadeUp}>
            <div className="mb-10 text-center">
              <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
                <VintageOrnament />
              </div>
              <h2
                style={{
                  ...F.display,
                  fontSize: "2rem",
                  color: "#FFFFFF",
                  fontStyle: "italic",
                }}
              >
                Επιβεβαίωση
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
                <div style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1rem" }}>
                  <VintageOrnament />
                </div>
                <p
                  style={{
                    ...F.display,
                    fontSize: "1.5rem",
                    color: "#FFFFFF",
                    fontStyle: "italic",
                  }}
                >
                  Ευχαριστούμε πολύ!
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
                  style={F.body}
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
        <div className="mb-5" style={{ color: C.accent }}>
          <VintageOrnament />
        </div>
        <p
          style={{
            ...F.display,
            fontSize: "1.8rem",
            color: `${C.text}66`,
            fontStyle: "italic",
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
              marginTop: "0.75rem",
            }}
          >
            {dateMain}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

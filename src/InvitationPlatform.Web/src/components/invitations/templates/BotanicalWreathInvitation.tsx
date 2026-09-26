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

const SCRIPT = { fontFamily: '"Great Vibes", cursive' };
const SERIF = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const LABEL = { fontFamily: '"Lato", system-ui, sans-serif' };

const C = {
  bg: "#FAFAF7",
  card: "#F3F6F0",
  accent: "#2D5A3D",
  gold: "#B8943A",
  sage: "#6A8E7A",
  text: "#1A2A1A",
  muted: "#7A8A7A",
  border: "rgba(45,90,61,0.12)",
};

const FALLBACK_VENUE =
  "https://images.unsplash.com/photo-1605016093827-a6b6d4d85792?w=900&h=600&fit=crop&auto=format";
const FALLBACK_GARDEN =
  "https://images.unsplash.com/photo-1519741196428-6a2175fa2557?w=900&h=600&fit=crop&auto=format";
const FALLBACK_CARD =
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=800&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function WreathSVG() {
  return (
    <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      <circle cx="180" cy="180" r="135" stroke="#B8943A" strokeWidth="1.8" />
      <circle cx="180" cy="180" r="128" stroke="#B8943A" strokeWidth="0.6" opacity="0.6" />
      <circle cx="180" cy="45" r="2.5" fill="#B8943A" opacity="0.7" />
      <circle cx="315" cy="180" r="2.5" fill="#B8943A" opacity="0.7" />
      <circle cx="180" cy="315" r="2.5" fill="#B8943A" opacity="0.7" />
      <circle cx="45" cy="180" r="2.5" fill="#B8943A" opacity="0.7" />
      <circle cx="276" cy="84" r="4" stroke="#B8943A" strokeWidth="1" opacity="0.4" />
      <circle cx="84" cy="276" r="4" stroke="#B8943A" strokeWidth="1" opacity="0.4" />
      <g transform="translate(20, 140)">
        <path d="M0 40 Q-8 20 5 5 Q15 18 12 38Z" fill="#3D6B4F" opacity="0.85" />
        <path d="M12 35 Q2 15 14 2 Q24 14 22 34Z" fill="#4A7A5A" opacity="0.75" />
        <path d="M22 30 Q14 12 26 0 Q34 12 30 28Z" fill="#2D5A3D" opacity="0.9" />
        <path d="M5 50 Q-5 35 6 22 Q14 34 10 50Z" fill="#5A8A6A" opacity="0.65" />
        <path d="M30 25 Q22 8 34 -2 Q40 10 38 24Z" fill="#6A9A7A" opacity="0.6" />
        <circle cx="8" cy="15" r="2.5" fill="white" opacity="0.7" />
        <circle cx="20" cy="8" r="2" fill="white" opacity="0.6" />
      </g>
      <g transform="translate(310, 140) scale(-1,1)">
        <path d="M0 40 Q-8 20 5 5 Q15 18 12 38Z" fill="#3D6B4F" opacity="0.85" />
        <path d="M12 35 Q2 15 14 2 Q24 14 22 34Z" fill="#4A7A5A" opacity="0.75" />
        <path d="M22 30 Q14 12 26 0 Q34 12 30 28Z" fill="#2D5A3D" opacity="0.9" />
        <path d="M5 50 Q-5 35 6 22 Q14 34 10 50Z" fill="#5A8A6A" opacity="0.65" />
        <path d="M30 25 Q22 8 34 -2 Q40 10 38 24Z" fill="#6A9A7A" opacity="0.6" />
        <circle cx="8" cy="15" r="2.5" fill="white" opacity="0.7" />
        <circle cx="20" cy="8" r="2" fill="white" opacity="0.6" />
      </g>
      <g transform="translate(130, 15) rotate(-15)">
        <path d="M25 55 Q10 30 20 5 Q35 25 32 52Z" fill="#4A7A5A" opacity="0.7" />
        <path d="M35 50 Q22 26 32 2 Q46 20 44 48Z" fill="#2D5A3D" opacity="0.8" />
        <path d="M15 58 Q2 38 10 15 Q22 32 20 56Z" fill="#5A8A6A" opacity="0.6" />
        <circle cx="22" cy="20" r="2" fill="white" opacity="0.6" />
      </g>
      <g transform="translate(130, 290) rotate(15)">
        <path d="M25 0 Q10 25 20 50 Q35 30 32 3Z" fill="#4A7A5A" opacity="0.7" />
        <path d="M35 5 Q22 29 32 53 Q46 35 44 7Z" fill="#2D5A3D" opacity="0.8" />
        <path d="M15 2 Q2 22 10 40 Q22 23 20 4Z" fill="#5A8A6A" opacity="0.6" />
      </g>
      <g transform="translate(240, 30) rotate(30)">
        <path d="M5 45 Q-2 25 8 8 Q18 22 15 42Z" fill="#6A9A7A" opacity="0.55" />
        <path d="M15 40 Q8 22 18 6 Q26 18 24 38Z" fill="#4A7A5A" opacity="0.6" />
      </g>
      <g transform="translate(85, 35) rotate(-25)">
        <path d="M5 45 Q-2 25 8 8 Q18 22 15 42Z" fill="#6A9A7A" opacity="0.5" />
        <path d="M15 40 Q8 22 18 6 Q26 18 24 38Z" fill="#4A7A5A" opacity="0.55" />
      </g>
    </svg>
  );
}

export function BotanicalWreathInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const venueImg = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_VENUE;
  const garden = data.gallery[1]?.url || FALLBACK_GARDEN;
  const cardImg = data.gallery[2]?.url || FALLBACK_CARD;
  const venue = data.venues[0];
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Garden Party";
  const dayNum = data.eventDate ? new Date(data.eventDate).getDate().toString() : "";
  const monthName = data.eventDate
    ? formatEventDate(data.eventDate, data.locale, { month: "long" })
    : "";
  const welcome =
    data.welcomeText ||
    "Φύλλα ευκαλύπτου, χρυσά δαχτυλίδια και η ηρεμία ενός βοτανικού κήπου — η φύση στολίζει την ξεχωριστή μας μέρα.";

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="invitation-wedding-fonts min-h-screen overflow-x-hidden"
    >
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
        <div className="absolute right-0 top-0 h-32 w-32 opacity-30">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M80 0 Q50 10 40 40" stroke="#2D5A3D" strokeWidth="0.8" />
            <path d="M60 5 Q55 25 35 35" stroke="#2D5A3D" strokeWidth="0.7" />
            <ellipse cx="72" cy="12" rx="8" ry="4" transform="rotate(25 72 12)" fill="#2D5A3D" opacity="0.5" />
            <ellipse cx="55" cy="22" rx="7" ry="3.5" transform="rotate(15 55 22)" fill="#4A7A5A" opacity="0.4" />
          </svg>
        </div>
        <div
          className="absolute bottom-0 left-0 h-32 w-32 opacity-30"
          style={{ transform: "rotate(180deg)" }}
        >
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M80 0 Q50 10 40 40" stroke="#2D5A3D" strokeWidth="0.8" />
            <path d="M60 5 Q55 25 35 35" stroke="#2D5A3D" strokeWidth="0.7" />
            <ellipse cx="72" cy="12" rx="8" ry="4" transform="rotate(25 72 12)" fill="#2D5A3D" opacity="0.5" />
          </svg>
        </div>

        <div className="relative mb-10 h-[280px] w-[280px] md:h-[360px] md:w-[360px]">
          <WreathSVG />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
            <div
              style={{
                ...SCRIPT,
                fontSize: "clamp(1.6rem,5vw,2.6rem)",
                color: C.text,
                lineHeight: 1.15,
              }}
            >
              {data.title}
            </div>
          </div>
        </div>

        <p
          style={{
            ...SERIF,
            fontSize: "1.1rem",
            color: `${C.text}80`,
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: "380px",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          {data.eyebrow ? (
            <>
              {data.eyebrow.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </>
          ) : (
            <>
              We invite you to come &amp; shower blessings
              <br />
              to us on our wedding day
            </>
          )}
        </p>

        <div className="flex items-center gap-6 md:gap-10">
          {weekday ? (
            <p
              style={{
                ...LABEL,
                color: C.muted,
                fontSize: "0.8rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              {weekday}
            </p>
          ) : null}
          {dayNum ? (
            <div className="text-center">
              <div style={{ ...SCRIPT, fontSize: "3.5rem", color: C.accent, lineHeight: 1 }}>
                {dayNum}
              </div>
              {time ? (
                <p
                  style={{
                    ...LABEL,
                    color: C.muted,
                    fontSize: "0.65rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginTop: "0.25rem",
                  }}
                >
                  {time}
                </p>
              ) : null}
            </div>
          ) : null}
          {monthName ? (
            <p
              style={{
                ...LABEL,
                color: C.muted,
                fontSize: "0.8rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              {monthName}
            </p>
          ) : null}
        </div>

        {venue ? (
          <div className="mt-6 flex items-center gap-2">
            <MapPin className="h-3 w-3" strokeWidth={1.5} style={{ color: C.muted }} />
            <p style={{ ...LABEL, color: C.muted, fontSize: "0.75rem" }}>
              {venue.name}
              {venue.city || venue.address
                ? `, ${formatVenueLocation(venue.city, venue.address)}`
                : ""}
            </p>
          </div>
        ) : null}
      </section>

      <section className="px-6 py-20" style={{ backgroundColor: C.card }}>
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center gap-12 md:flex-row-reverse"
          {...fadeUp}
        >
          <div className="flex-1 text-center md:text-left">
            <p
              style={{
                ...LABEL,
                color: C.gold,
                fontSize: "9px",
                letterSpacing: "0.55em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Botanical Wreath
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
              Η πρόσκλησή σας
              <br />
              στη φύση
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
            className="w-[220px] flex-shrink-0 md:w-[260px]"
            style={{
              transform: "rotate(-2deg)",
              filter: "drop-shadow(0 20px 40px rgba(45,90,61,0.12))",
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

      <section className="px-6 py-20">
        <motion.div className="mx-auto max-w-3xl text-center" {...fadeUp}>
          <p
            style={{
              ...LABEL,
              color: C.gold,
              fontSize: "9px",
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Λεπτομέρειες
          </p>
          <h2
            style={{
              ...SERIF,
              fontSize: "2.5rem",
              color: C.text,
              fontStyle: "italic",
              marginBottom: "3rem",
            }}
          >
            Η ημέρα της γιορτής
          </h2>
          <div className="grid md:grid-cols-3" style={{ border: `1px solid ${C.border}` }}>
            {[
              { label: "Ημερομηνία", main: dateMain || "—", sub: weekday || "" },
              {
                label: "Τελετή",
                main: time || "—",
                sub: venue?.name || "",
              },
              { label: "Dress Code", main: dress, sub: "Ανοιξιάτικες αποχρώσεις" },
            ].map((d, i) => (
              <div
                key={d.label}
                className="px-6 py-10 text-center"
                style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : undefined }}
              >
                <p
                  style={{
                    ...LABEL,
                    color: C.muted,
                    fontSize: "9px",
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  {d.label}
                </p>
                <p style={{ ...SERIF, fontSize: "1.2rem", color: C.text, fontWeight: 600 }}>
                  {d.main}
                </p>
                {d.sub ? (
                  <p
                    style={{
                      ...SERIF,
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
        </motion.div>
      </section>

      {venue ? (
        <section className="grid h-[380px] md:h-[440px] md:grid-cols-2">
          <div className="group relative overflow-hidden" style={{ backgroundColor: C.accent }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={venueImg}
              alt={venue.name}
              className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-[1.05]"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${C.text}AA, transparent 50%)` }}
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
          <div className="group relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={garden}
              alt={data.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${C.accent}66, transparent 50%)` }}
            />
          </div>
        </section>
      ) : null}

      <InvitationExtraSections
        data={data}
        colors={C}
        fontDisplay={SERIF}
        fontLabel={LABEL}
        posterUrl={venueImg}
      />

      {data.rsvp.enabled ? (
        <section className="px-6 py-24" style={{ backgroundColor: C.accent }}>
          <motion.div className="mx-auto max-w-md" {...fadeUp}>
            <div className="mb-10 text-center">
              <div className="relative mx-auto mb-5 h-14 w-14">
                <svg viewBox="0 0 56 56" fill="none" className="h-full w-full">
                  <circle cx="28" cy="28" r="22" stroke="#B8943A" strokeWidth="1" opacity="0.5" />
                  <circle cx="28" cy="28" r="18" stroke="#B8943A" strokeWidth="0.5" opacity="0.4" />
                </svg>
              </div>
              <h2 style={{ ...SCRIPT, fontSize: "2.8rem", color: "#FFFFFF" }}>Επιβεβαίωση</h2>
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
            color: C.gold,
            fontSize: "9px",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          <span style={LABEL}>✦</span>
        </div>
        <div
          style={{
            ...SCRIPT,
            fontSize: "2.2rem",
            color: `${C.text}55`,
            marginBottom: "0.5rem",
          }}
        >
          {data.footerText || data.title}
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

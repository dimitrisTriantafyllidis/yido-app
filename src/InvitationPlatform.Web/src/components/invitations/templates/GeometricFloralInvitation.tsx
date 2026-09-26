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
  script: { fontFamily: '"Great Vibes", cursive' },
  display: { fontFamily: '"Cormorant Garamond", Georgia, serif' },
  label: { fontFamily: '"Lato", system-ui, sans-serif' },
};

const C = {
  bg: "#FAF7F0",
  card: "#F3EFE6",
  accent: "#7A6A48",
  gold: "#C9A840",
  blush: "#E0A898",
  sage: "#6A8A6A",
  text: "#2A2018",
  muted: "#8A8070",
  border: "rgba(201,168,64,0.2)",
};

const FALLBACK_CARD =
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=800&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function GoldFlourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 28" fill="none" className={className}>
      <path
        d="M50 14 C44 8 36 4 28 8 C36 8 42 12 50 14Z"
        stroke={C.gold}
        strokeWidth="0.8"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M50 14 C56 8 64 4 72 8 C64 8 58 12 50 14Z"
        stroke={C.gold}
        strokeWidth="0.8"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M50 14 C44 20 36 24 28 20 C36 20 42 16 50 14Z"
        stroke={C.gold}
        strokeWidth="0.8"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M50 14 C56 20 64 24 72 20 C64 20 58 16 50 14Z"
        stroke={C.gold}
        strokeWidth="0.8"
        fill="none"
        opacity="0.8"
      />
      <circle cx="50" cy="14" r="2" fill={C.gold} opacity="0.7" />
      <circle cx="28" cy="14" r="1.2" fill={C.gold} opacity="0.5" />
      <circle cx="72" cy="14" r="1.2" fill={C.gold} opacity="0.5" />
      <path d="M20 14 L28 14" stroke={C.gold} strokeWidth="0.7" opacity="0.5" />
      <path d="M72 14 L80 14" stroke={C.gold} strokeWidth="0.7" opacity="0.5" />
    </svg>
  );
}

function PalmFrond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M10 90 C20 65 40 40 70 20 C50 42 28 66 10 90Z" fill="#4A7A5A" opacity="0.7" />
      <path d="M20 95 C28 72 46 50 74 32 C56 52 36 74 20 95Z" fill="#3D6B4F" opacity="0.75" />
      <path d="M5 75 C18 55 35 38 60 22 C42 40 22 60 5 75Z" fill="#5A8A6A" opacity="0.6" />
      <path d="M30 98 C36 78 52 60 76 44 C60 62 42 80 30 98Z" fill="#6A9A7A" opacity="0.5" />
    </svg>
  );
}

function GeometricFrame({ size = 420 }: { size?: number }) {
  const s = size;
  const pts = [
    [s * 0.38, s * 0.1],
    [s * 0.78, s * 0.08],
    [s * 0.92, s * 0.3],
    [s * 0.88, s * 0.72],
    [s * 0.62, s * 0.9],
    [s * 0.18, s * 0.88],
    [s * 0.08, s * 0.6],
    [s * 0.12, s * 0.28],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${s} ${s}`} fill="none" className="absolute inset-0 h-full w-full">
      <polygon points={pts} stroke={C.gold} strokeWidth="1.8" fill="none" />
      <polygon
        points={pts}
        stroke={C.gold}
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
        style={{ transform: `scale(0.94) translate(${s * 0.03}px, ${s * 0.03}px)` }}
      />
      <g transform="translate(40, 20)">
        <circle cx="55" cy="55" r="14" fill="#F0EDE8" opacity="0.9" />
        <circle cx="55" cy="55" r="9" fill="#E8E4DE" opacity="0.8" />
        <ellipse cx="38" cy="48" rx="12" ry="8" transform="rotate(-30 38 48)" fill="#E8B0A0" opacity="0.7" />
        <ellipse cx="42" cy="34" rx="11" ry="7" transform="rotate(-50 42 34)" fill="#D49888" opacity="0.65" />
        <ellipse cx="30" cy="58" rx="10" ry="7" transform="rotate(-10 30 58)" fill="#E0A898" opacity="0.6" />
        <path d="M72 30 C70 20 68 12 70 4" stroke="#D4B88A" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M76 35 C76 25 74 16 76 8" stroke="#C8AA78" strokeWidth="1.2" fill="none" opacity="0.6" />
        <ellipse cx="70" cy="6" rx="4" ry="7" fill="#D4B88A" opacity="0.55" />
        <ellipse cx="76" cy="9" rx="3.5" ry="6" fill="#C8AA78" opacity="0.5" />
        <path d="M50 70 C38 60 30 44 36 32 C42 46 48 60 50 70Z" fill="#3D5A3A" opacity="0.75" />
        <path d="M62 68 C50 56 46 40 54 30 C58 44 62 58 62 68Z" fill="#4A6A48" opacity="0.7" />
        <path d="M42 72 C30 64 26 50 32 40 C36 52 40 64 42 72Z" fill="#2D4A2A" opacity="0.8" />
      </g>
      <g transform={`translate(${s * 0.55}, ${s * 0.6})`}>
        <circle cx="55" cy="55" r="16" fill="#F0EDE8" opacity="0.9" />
        <circle cx="55" cy="55" r="10" fill="#E8E4DE" opacity="0.8" />
        <ellipse cx="76" cy="50" rx="13" ry="9" transform="rotate(20 76 50)" fill="#E8B0A0" opacity="0.7" />
        <ellipse cx="74" cy="70" rx="12" ry="8" transform="rotate(40 74 70)" fill="#D49888" opacity="0.65" />
        <ellipse cx="40" cy="72" rx="11" ry="7" transform="rotate(10 40 72)" fill="#E0A898" opacity="0.6" />
        <path d="M30 38 C28 28 30 18 28 10" stroke="#D4B88A" strokeWidth="1.4" fill="none" opacity="0.65" />
        <ellipse cx="28" cy="10" rx="3.5" ry="6" fill="#D4B88A" opacity="0.5" />
        <path d="M42 36 C30 26 26 10 34 0 C38 12 40 26 42 36Z" fill="#3D5A3A" opacity="0.75" />
        <path d="M56 32 C44 22 42 8 50 -2 C54 10 56 24 56 32Z" fill="#4A6A48" opacity="0.7" />
        <path d="M30 48 C18 40 14 26 20 16 C24 28 28 40 30 48Z" fill="#2D4A2A" opacity="0.8" />
      </g>
    </svg>
  );
}

function venueRole(venueType: string, index: number): string {
  if (venueType === "Church" || venueType === "Ceremony") return "Τελετή";
  if (venueType === "Reception") return "Δεξίωση";
  return index === 0 ? "Τελετή" : "Δεξίωση";
}

export function GeometricFloralInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const cardImg = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_CARD;
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Garden";
  const venue = data.venues[0];

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="invitation-wedding-fonts min-h-screen overflow-x-hidden"
    >
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute left-0 top-0 w-32 opacity-70 md:w-44">
          <PalmFrond />
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 w-32 opacity-70 md:w-44"
          style={{ transform: "scaleX(-1)" }}
        >
          <PalmFrond />
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-32 opacity-70 md:w-44"
          style={{ transform: "scaleY(-1)" }}
        >
          <PalmFrond />
        </div>
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-32 opacity-70 md:w-44"
          style={{ transform: "scale(-1,-1)" }}
        >
          <PalmFrond />
        </div>

        <div className="absolute left-1/2 top-10 -translate-x-1/2">
          <GoldFlourish className="w-24 opacity-80" />
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <GoldFlourish className="w-24 opacity-80" />
        </div>

        <div className="relative h-[min(440px,88vw)] w-[min(440px,88vw)]">
          <GeometricFrame size={440} />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-14 text-center">
            <p
              style={{
                ...F.label,
                color: C.muted,
                fontSize: "8px",
                letterSpacing: "0.55em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              {data.eyebrow || "Μαζί με τις οικογένειές τους"}
            </p>
            <div
              style={{
                ...F.script,
                fontSize: "clamp(1.8rem,5.5vw,3.2rem)",
                color: C.text,
                lineHeight: 1.15,
              }}
            >
              {data.title}
            </div>
            <div className="my-3 h-px w-10" style={{ backgroundColor: `${C.gold}60` }} />
            {dateMain ? (
              <p
                style={{
                  ...F.label,
                  color: C.muted,
                  fontSize: "8px",
                  letterSpacing: "0.45em",
                  textTransform: "uppercase",
                }}
              >
                {weekday ? `${weekday} · ` : ""}
                {dateMain}
              </p>
            ) : null}
          </div>
        </div>

        <p
          style={{
            ...F.display,
            fontSize: "1rem",
            color: `${C.text}70`,
            fontStyle: "italic",
            marginTop: "2rem",
            textAlign: "center",
          }}
        >
          Σας προσκαλούν να γιορτάσουν μαζί τους
        </p>
        {venue ? (
          <div className="mt-3 flex items-center gap-2">
            <MapPin className="h-3 w-3" strokeWidth={1.5} style={{ color: C.muted }} />
            <p style={{ ...F.label, color: C.muted, fontSize: "11px", letterSpacing: "0.08em" }}>
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
          className="mx-auto flex max-w-4xl flex-col items-center gap-14 md:flex-row-reverse"
          {...fadeUp}
        >
          <div
            className="w-52 shrink-0 md:w-64"
            style={{
              transform: "rotate(2deg)",
              filter: "drop-shadow(0 16px 40px rgba(122,106,72,0.14))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImg}
              alt="Geometric Floral Πρόσκληση"
              className="h-auto w-full object-contain"
            />
          </div>
          <div>
            <p
              style={{
                ...F.label,
                color: C.gold,
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
              Geometric Floral
            </h2>
            <p
              style={{
                ...F.display,
                fontSize: "1.1rem",
                lineHeight: 1.9,
                color: `${C.text}88`,
                fontStyle: "italic",
                maxWidth: "360px",
              }}
            >
              {data.welcomeText ||
                "Ένα χρυσό γεωμετρικό πλαίσιο αγκαλιασμένο από βαμβακετά άνθη, ροζ παιώνιες και βότανα — ομορφιά με δομή."}
            </p>
          </div>
        </motion.div>
      </section>

      <motion.section className="px-6 py-20" {...fadeUp}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <GoldFlourish className="mx-auto mb-4 w-20" />
            <p
              style={{
                ...F.label,
                color: C.gold,
                fontSize: "10px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
              }}
            >
              Λεπτομέρειες
            </p>
          </div>
          <div className="grid border md:grid-cols-3" style={{ borderColor: C.border }}>
            {[
              {
                label: "Ημερομηνία",
                script: dateMain || "—",
                sub: weekday || "",
              },
              {
                label: "Τελετή",
                script: time || "—",
                sub: venue?.name || "",
              },
              { label: "Dress Code", script: dress, sub: "Floral & Elegant" },
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
        <section className="px-6 py-16" style={{ backgroundColor: C.card }}>
          <motion.div className="mx-auto grid max-w-2xl gap-5 md:grid-cols-2" {...fadeUp}>
            {data.venues.slice(0, 2).map((v, i) => (
              <div key={v.id} className="border p-7" style={{ borderColor: C.border }}>
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
                    fontSize: "2rem",
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
              <GoldFlourish className="mx-auto mb-5 w-16 opacity-70" />
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
              <div className="border border-white/20 p-10 text-center">
                <Check className="mx-auto mb-3 h-5 w-5 text-white" />
                <p style={{ ...F.script, fontSize: "2.5rem", color: "#FFFFFF" }}>Ευχαριστούμε!</p>
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
                  className="w-full py-3 text-xs uppercase tracking-[0.35em] transition-all hover:opacity-85 disabled:opacity-30"
                  style={{ ...F.label, backgroundColor: C.gold, color: C.accent }}
                >
                  {rsvp.submitting ? "Αποστολή..." : "Αποστολή"}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      ) : null}

      <footer className="py-16 text-center" style={{ backgroundColor: C.bg }}>
        <GoldFlourish className="mx-auto mb-5 w-20" />
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
              marginTop: "0.5rem",
            }}
          >
            {dateMain}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

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
  display: { fontFamily: '"Crimson Pro", Georgia, serif' },
  body: { fontFamily: '"Raleway", system-ui, sans-serif' },
};

const C = {
  bg: "#FAF5EE",
  card: "#F2EAE0",
  accent: "#C4704F",
  text: "#2E1F13",
  muted: "#A08060",
  border: "rgba(196,112,79,0.18)",
  sage: "#7B9B8A",
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1758565177095-f3dbdbd00e4f?w=1600&h=900&fit=crop&auto=format";
const FALLBACK_FIELD =
  "https://images.unsplash.com/photo-1608021810200-8669e65bd24f?w=900&h=700&fit=crop&auto=format";
const FALLBACK_OUTDOORS =
  "https://images.unsplash.com/photo-1649289659524-db596c839bfa?w=900&h=700&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function PampasOrnament({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 80 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path d="M40 48 C40 30 38 18 35 8" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M35 8 C30 3 22 2 18 6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M35 8 C38 3 46 2 50 6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M37 18 C32 14 24 13 20 16" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M37 18 C42 14 50 13 54 16" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M38 28 C33 24 25 23 22 26" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M38 28 C43 24 51 23 54 26" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <ellipse cx="18" cy="7" rx="4" ry="2.5" transform="rotate(-20 18 7)" fill="currentColor" opacity="0.4" />
      <ellipse cx="50" cy="7" rx="4" ry="2.5" transform="rotate(20 50 7)" fill="currentColor" opacity="0.4" />
      <ellipse cx="20" cy="17" rx="3.5" ry="2" transform="rotate(-15 20 17)" fill="currentColor" opacity="0.35" />
      <ellipse cx="54" cy="17" rx="3.5" ry="2" transform="rotate(15 54 17)" fill="currentColor" opacity="0.35" />
      <ellipse cx="22" cy="27" rx="3" ry="2" transform="rotate(-10 22 27)" fill="currentColor" opacity="0.3" />
      <ellipse cx="54" cy="27" rx="3" ry="2" transform="rotate(10 54 27)" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function BohoInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const hero = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_HERO;
  const field = data.gallery[1]?.url || FALLBACK_FIELD;
  const outdoors = data.gallery[2]?.url || FALLBACK_OUTDOORS;
  const venueA = data.venues[0];
  const venueB = data.venues[1];
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Boho Chic";
  const welcome =
    data.welcomeText ||
    "Η αγάπη μας είναι άγρια, ελεύθερη και αυθεντική. Σας καλούμε να γίνετε μέρος αυτής της μοναδικής γιορτής κάτω από τον ανοιχτό ουρανό.";

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text, fontFamily: F.body.fontFamily }}
      className="invitation-wedding-fonts min-h-screen overflow-x-hidden"
    >
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={data.title}
          className="absolute inset-0 h-full w-full object-cover object-top"
          style={{ backgroundColor: C.accent }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${C.accent}22 0%, ${C.text}55 55%, ${C.text}DD 100%)`,
          }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <PampasOrnament className="mb-6 w-20" style={{ color: "rgba(255,255,255,0.4)" }} />
          <p
            className="mb-7 text-[10px] uppercase tracking-[0.5em] text-white/50"
            style={F.body}
          >
            {data.eyebrow || "Ελεύθερες ψυχές, ενωμένες καρδιές"}
          </p>
          <h1
            className="mb-6 text-[clamp(3rem,11vw,8rem)] font-normal leading-[1.08] text-white"
            style={F.display}
          >
            {data.title}
          </h1>
          <div className="mb-7 flex items-center gap-4">
            <div className="h-px w-12 bg-white/25" />
            <span className="text-xs text-white/40">✦</span>
            <div className="h-px w-12 bg-white/25" />
          </div>
          {dateMain ? (
            <p
              className="text-[10px] uppercase tracking-[0.4em] text-white/55"
              style={F.body}
            >
              {weekday ? `${weekday} · ` : ""}
              {dateMain}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-24">
        <motion.div className="mx-auto max-w-xl text-center" {...fadeUp}>
          <PampasOrnament className="mx-auto mb-8 w-14" style={{ color: `${C.accent}60` }} />
          <p
            className="text-[22px] italic leading-[1.8]"
            style={{ ...F.display, color: `${C.text}AA` }}
          >
            &ldquo;{welcome}&rdquo;
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-10" style={{ backgroundColor: `${C.accent}40` }} />
            <span style={{ color: `${C.accent}60`, fontSize: "10px" }}>✦</span>
            <div className="h-px w-10" style={{ backgroundColor: `${C.accent}40` }} />
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-16" style={{ backgroundColor: C.card }}>
        <motion.div className="mx-auto max-w-3xl text-center" {...fadeUp}>
          <p
            className="mb-2 text-[10px] uppercase tracking-[0.5em]"
            style={{ ...F.body, color: C.accent }}
          >
            Η Μέρα μας
          </p>
          <h2 className="mb-12 text-4xl" style={{ ...F.display, color: C.text }}>
            Λεπτομέρειες
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              { emoji: "🌅", label: "Ημερομηνία", main: dateMain || "—", sub: weekday || "" },
              { emoji: "⏰", label: "Ώρα Έναρξης", main: time || "—", sub: "Υπαίθρια τελετή" },
              { emoji: "🌿", label: "Ενδυμασία", main: dress, sub: "Γήινα χρώματα" },
            ].map((d) => (
              <div key={d.label} className="flex flex-col items-center gap-2">
                <div className="mb-1 text-2xl">{d.emoji}</div>
                <p
                  className="text-[9px] uppercase tracking-[0.4em]"
                  style={{ ...F.body, color: C.muted }}
                >
                  {d.label}
                </p>
                <p className="text-xl font-semibold" style={{ ...F.display, color: C.text }}>
                  {d.main}
                </p>
                {d.sub ? (
                  <p className="text-sm italic" style={{ ...F.display, color: C.muted }}>
                    {d.sub}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {venueA || venueB ? (
        <section className="grid h-[480px] md:grid-cols-2">
          {venueA ? (
            <div className="group relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={field}
                alt={venueA.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${C.text}88, transparent)` }}
              />
              <div className="absolute bottom-6 left-7">
                <p
                  className="mb-1 text-[9px] uppercase tracking-[0.5em] text-white/55"
                  style={F.body}
                >
                  Τελετή
                </p>
                <h3 className="text-xl text-white" style={F.display}>
                  {venueA.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-white/50" strokeWidth={1.5} />
                  <p className="text-xs text-white/55" style={F.body}>
                    {formatVenueLocation(venueA.city, venueA.address)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {venueB ? (
            <div className="group relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={outdoors}
                alt={venueB.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${C.text}88, transparent)` }}
              />
              <div className="absolute bottom-6 left-7">
                <p
                  className="mb-1 text-[9px] uppercase tracking-[0.5em] text-white/55"
                  style={F.body}
                >
                  Δεξίωση
                </p>
                <h3 className="text-xl text-white" style={F.display}>
                  {venueB.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-white/50" strokeWidth={1.5} />
                  <p className="text-xs text-white/55" style={F.body}>
                    {formatVenueLocation(venueB.city, venueB.address)}
                  </p>
                </div>
              </div>
            </div>
          ) : venueA ? (
            <div className="group relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={outdoors}
                alt={data.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <InvitationExtraSections
        data={data}
        colors={C}
        fontDisplay={F.display}
        fontLabel={F.body}
        posterUrl={hero}
      />

      {data.rsvp.enabled ? (
        <section className="px-6 py-24" style={{ backgroundColor: C.accent }}>
          <motion.div className="mx-auto max-w-md" {...fadeUp}>
            <div className="mb-10 text-center">
              <PampasOrnament
                className="mx-auto mb-6 w-12"
                style={{ color: "rgba(255,255,255,0.35)" }}
              />
              <h2 className="mb-2 text-3xl text-white" style={F.display}>
                Επιβεβαίωση Παρουσίας
              </h2>
              {data.rsvpDeadline ? (
                <p className="text-sm text-white/50" style={F.body}>
                  Έως {formatEventDateShort(data.rsvpDeadline, data.locale)}
                </p>
              ) : null}
            </div>
            {rsvp.submitted ? (
              <div className="rounded-full border border-white/20 px-8 py-10 text-center">
                <Check className="mx-auto mb-3 h-5 w-5 text-white" />
                <p className="text-xl text-white" style={F.display}>
                  Ευχαριστούμε!
                </p>
              </div>
            ) : (
              <form onSubmit={rsvp.submit} className="space-y-4">
                {rsvp.error ? (
                  <p className="rounded-full bg-red-900/30 px-3 py-2 text-sm text-white">
                    {rsvp.error}
                  </p>
                ) : null}
                <input
                  type="text"
                  required
                  placeholder="Ονοματεπώνυμο"
                  value={rsvp.name}
                  onChange={(e) => rsvp.setName(e.target.value)}
                  className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/50"
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
                      className={`rounded-full border py-3 text-sm transition-all ${
                        rsvp.attending === key
                          ? "border-white bg-white"
                          : "border-white/25 bg-transparent text-white/65 hover:border-white/50"
                      }`}
                      style={{
                        ...F.body,
                        color: rsvp.attending === key ? C.accent : undefined,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!rsvp.name || !rsvp.attending || rsvp.submitting}
                  className="w-full rounded-full bg-white py-3 text-xs uppercase tracking-[0.35em] transition-all hover:bg-white/90 disabled:opacity-30"
                  style={{ ...F.body, color: C.accent }}
                >
                  {rsvp.submitting ? "Αποστολή..." : "Αποστολή"}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      ) : null}

      <footer className="py-14 text-center" style={{ backgroundColor: C.bg }}>
        <PampasOrnament className="mx-auto mb-5 w-12" style={{ color: `${C.accent}50` }} />
        <p className="text-2xl italic" style={{ ...F.display, color: `${C.text}65` }}>
          {data.footerText}
        </p>
        {dateMain ? (
          <p
            className="mt-3 text-[9px] uppercase tracking-[0.45em]"
            style={{ ...F.body, color: C.muted }}
          >
            {dateMain}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

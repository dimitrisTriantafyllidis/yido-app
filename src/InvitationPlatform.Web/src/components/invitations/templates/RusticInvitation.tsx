"use client";

import { motion } from "motion/react";
import { MapPin, Calendar, Clock, Check } from "lucide-react";
import type { InvitationViewModel } from "../types";
import { useInvitationRsvp } from "../use-invitation-rsvp";
import { Turnstile } from "../../ui/Turnstile";
import {
  formatEventDateShort,
  formatWeekday,
  formatVenueLocation,
  primaryVenueTime,
} from "../format";
import { InvitationExtraSections } from "../InvitationExtraSections";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const F = {
  display: { fontFamily: '"Playfair Display", Georgia, serif' },
  body: { fontFamily: '"Lato", system-ui, sans-serif' },
};

const C = {
  bg: "#F5F0E8",
  card: "#EDE7D8",
  accent: "#7A5C3A",
  text: "#2C1F10",
  muted: "#9B8B75",
  border: "rgba(122,92,58,0.15)",
  section: "#DDD4C2",
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&h=900&fit=crop&auto=format";
const FALLBACK_COUPLE =
  "https://images.unsplash.com/photo-1511285560929-80b456fe9cab?w=900&h=1100&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export function RusticInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const hero = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_HERO;
  const couple = data.gallery[1]?.url || data.coverImageUrl || FALLBACK_COUPLE;
  const venue = data.venues[0];
  const venueImg = data.gallery[2]?.url || hero;
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Smart Casual";
  const welcome =
    data.welcomeText ||
    "Κάτω από τον ανοιχτό ουρανό και ανάμεσα στη φύση που αγαπάμε, σας καλούμε να γιορτάσουμε μαζί ένα νέο ξεκίνημα.";

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
          className="absolute inset-0 h-full w-full object-cover"
          style={{ backgroundColor: C.accent }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${C.accent}44 0%, ${C.text}99 60%, ${C.text}EE 100%)`,
          }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-10 bg-white/30" />
            <span className="text-sm text-white/50">🌿</span>
            <div className="h-px w-10 bg-white/30" />
          </div>
          <p
            className="mb-7 text-[10px] uppercase tracking-[0.5em] text-white/55"
            style={F.body}
          >
            {data.eyebrow || "Με χαρά σας προσκαλούμε"}
          </p>
          <h1
            className="mb-6 text-[clamp(3rem,11vw,8rem)] font-normal italic leading-[1.05] tracking-tight text-white"
            style={F.display}
          >
            {data.title}
          </h1>
          <div className="mb-6 h-px w-16 bg-white/25" />
          {dateMain ? (
            <p
              className="text-[10px] uppercase tracking-[0.4em] text-white/60"
              style={F.body}
            >
              {weekday ? `${weekday} · ` : ""}
              {dateMain}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-24">
        <motion.div className="mx-auto max-w-lg text-center" {...fadeUp}>
          <div className="mx-auto mb-8 h-px w-8" style={{ backgroundColor: C.accent }} />
          <p
            className="text-xl italic leading-[1.9]"
            style={{ ...F.display, color: `${C.text}BB` }}
          >
            &ldquo;{welcome}&rdquo;
          </p>
          <div className="mx-auto mt-8 h-px w-8" style={{ backgroundColor: C.accent }} />
        </motion.div>
      </section>

      <section className="px-6 py-16" style={{ backgroundColor: C.card }}>
        <motion.div className="mx-auto max-w-3xl" {...fadeUp}>
          <p
            className="mb-3 text-center text-[10px] uppercase tracking-[0.5em]"
            style={{ ...F.body, color: C.accent }}
          >
            Λεπτομέρειες
          </p>
          <h2 className="mb-14 text-center text-3xl" style={{ ...F.display, color: C.text }}>
            Η Μέρα μας
          </h2>
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            {[
              {
                icon: <Calendar className="h-4 w-4" />,
                label: "Ημερομηνία",
                main: dateMain || "—",
                sub: weekday || "",
              },
              {
                icon: <Clock className="h-4 w-4" />,
                label: "Ώρα",
                main: time || "—",
                sub: "Τελετή",
              },
              {
                icon: <span className="text-sm">🌿</span>,
                label: "Ενδυμασία",
                main: dress,
                sub: "Dress Code",
              },
            ].map((d) => (
              <div
                key={d.label}
                className="flex flex-col items-center gap-3 border-b py-8 last:border-0 md:border-b-0 md:border-r"
                style={{ borderColor: C.border }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ border: `1px solid ${C.accent}33`, color: C.accent }}
                >
                  {d.icon}
                </div>
                <p
                  className="text-[9px] uppercase tracking-[0.4em]"
                  style={{ ...F.body, color: C.muted }}
                >
                  {d.label}
                </p>
                <p
                  className="text-xl font-semibold leading-tight"
                  style={{ ...F.display, color: C.text }}
                >
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

      {venue ? (
        <section className="py-0">
          <div className="grid md:grid-cols-[3fr_2fr]">
            <div
              className="relative h-[360px] overflow-hidden md:h-[520px]"
              style={{ backgroundColor: C.accent }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={venueImg}
                alt={venue.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${C.text}88, transparent)` }}
              />
              <div className="absolute bottom-0 left-0 p-8">
                <p
                  className="mb-2 text-[9px] uppercase tracking-[0.5em] text-white/55"
                  style={F.body}
                >
                  Χώρος Τελετής & Δεξίωσης
                </p>
                <h3 className="text-2xl text-white" style={F.display}>
                  {venue.name}
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-white/50" strokeWidth={1.5} />
                  <p className="text-sm text-white/60" style={F.body}>
                    {formatVenueLocation(venue.city, venue.address)}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="relative h-[360px] overflow-hidden md:h-[520px]"
              style={{ backgroundColor: C.section }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={couple}
                alt={data.title}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </div>
          </div>
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
              <p
                className="mb-3 text-[10px] uppercase tracking-[0.5em] text-white/45"
                style={F.body}
              >
                Απαντήστε
              </p>
              <h2 className="text-3xl text-white" style={F.display}>
                Επιβεβαίωση
              </h2>
              {data.rsvpDeadline ? (
                <p className="mt-2 text-sm text-white/50" style={F.body}>
                  Έως {formatEventDateShort(data.rsvpDeadline, data.locale)}
                </p>
              ) : null}
            </div>
            {rsvp.submitted ? (
              <div className="rounded-[2px] border border-white/15 p-10 text-center">
                <Check className="mx-auto mb-4 h-5 w-5 text-white" />
                <p className="text-xl text-white" style={F.display}>
                  Ευχαριστούμε!
                </p>
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
                      className={`rounded-[2px] border py-3 text-sm transition-all ${
                        rsvp.attending === key
                          ? "border-white bg-white"
                          : "border-white/20 bg-transparent text-white/65 hover:border-white/40"
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
                {TURNSTILE_SITE_KEY ? (
                  <div className="flex justify-center py-2">
                    <Turnstile
                      siteKey={TURNSTILE_SITE_KEY}
                      onVerify={rsvp.onTurnstileVerify}
                      onExpire={rsvp.onTurnstileExpire}
                      theme="dark"
                    />
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={
                    !rsvp.name ||
                    !rsvp.attending ||
                    rsvp.submitting ||
                    !!(TURNSTILE_SITE_KEY && !rsvp.turnstileToken)
                  }
                  className="w-full rounded-[2px] bg-white py-3 text-xs uppercase tracking-[0.35em] transition-all hover:bg-white/90 disabled:opacity-30"
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
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="h-px w-10" style={{ backgroundColor: `${C.accent}50` }} />
          <span style={{ color: `${C.accent}70` }}>🌿</span>
          <div className="h-px w-10" style={{ backgroundColor: `${C.accent}50` }} />
        </div>
        <p className="text-2xl italic" style={{ ...F.display, color: `${C.text}70` }}>
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

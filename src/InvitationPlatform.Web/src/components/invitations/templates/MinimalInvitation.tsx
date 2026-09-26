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
  display: { fontFamily: '"DM Serif Display", Georgia, serif' },
  body: { fontFamily: '"DM Sans", system-ui, sans-serif' },
};

const C = {
  bg: "#FFFFFF",
  card: "#F7F7F6",
  accent: "#1A1A18",
  text: "#1A1A18",
  muted: "#888886",
  border: "rgba(26,26,24,0.08)",
  line: "rgba(26,26,24,0.12)",
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1765478212424-31ae078c7e9f?w=1600&h=900&fit=crop&auto=format";
const FALLBACK_BRIDE =
  "https://images.unsplash.com/photo-1606216794079-73f85bbd57d5?w=800&h=1000&fit=crop&auto=format";
const FALLBACK_TEXTILE =
  "https://images.unsplash.com/photo-1616661318190-283f3b47da08?w=900&h=700&fit=crop&auto=format";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" as const },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

export function MinimalInvitation({ data }: { data: InvitationViewModel }) {
  const rsvp = useInvitationRsvp(data);
  const hero = data.coverImageUrl || data.gallery[0]?.url || FALLBACK_HERO;
  const textile = data.gallery[1]?.url || FALLBACK_TEXTILE;
  const bride = data.gallery[2]?.url || data.coverImageUrl || FALLBACK_BRIDE;
  const venueA = data.venues[0];
  const venueB = data.venues[1];
  const dateMain = formatEventDateShort(data.eventDate, data.locale);
  const weekday = formatWeekday(data.eventDate, data.locale);
  const time = primaryVenueTime(data.venues);
  const dress = data.dressCode || "Formal";
  const city = venueA?.city || "";
  const welcome =
    data.welcomeText || "Με εκτίμηση και χαρά, σας καλούμε να παραστείτε.";

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
          style={{ backgroundColor: C.card }}
        />
        <div className="absolute inset-0 bg-white/45" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-16 text-center">
          {(dateMain || city) ? (
            <p
              className="mb-12 text-[10px] uppercase tracking-[0.6em]"
              style={{ ...F.body, color: C.muted }}
            >
              {[dateMain, city].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          <h1
            className="mb-10 text-[clamp(2.8rem,10vw,8rem)] font-normal leading-[1.0] tracking-tight"
            style={{ ...F.display, color: C.text }}
          >
            {data.title}
          </h1>
          <div className="h-px w-12" style={{ backgroundColor: C.text }} />
        </div>
      </section>

      <section className="px-6 py-28" style={{ borderBottom: `1px solid ${C.border}` }}>
        <motion.div className="mx-auto max-w-md text-center" {...fadeUp}>
          <p
            className="text-[2rem] font-normal leading-[1.6]"
            style={{ ...F.display, color: C.text }}
          >
            {welcome}
          </p>
        </motion.div>
      </section>

      <section className="px-6 py-20">
        <motion.div className="mx-auto max-w-2xl" {...fadeUp}>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              { label: "Ημερομηνία", main: dateMain || "—", sub: weekday || "" },
              { label: "Τελετή", main: time || "—", sub: venueA?.name || "Ιερός Ναός" },
              { label: "Ενδυμασία", main: dress, sub: "Επίσημο" },
            ].map((d, i) => (
              <div
                key={d.label}
                className="px-6 py-10 text-center"
                style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : undefined }}
              >
                <p
                  className="mb-4 text-[9px] uppercase tracking-[0.5em]"
                  style={{ ...F.body, color: C.muted }}
                >
                  {d.label}
                </p>
                <p
                  className="mb-1 text-2xl font-normal"
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

      {(venueA || venueB) ? (
        <section
          className="grid h-[500px] md:grid-cols-[3fr_2fr]"
          style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
        >
          {venueA ? (
            <div className="group relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={textile}
                alt={venueA.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-white/10" />
              <div className="absolute bottom-8 left-8">
                <p
                  className="mb-1 text-[9px] uppercase tracking-[0.5em] text-white/60"
                  style={F.body}
                >
                  Χώρος Τελετής
                </p>
                <h3 className="text-2xl text-white" style={F.display}>
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
          <div
            className="group relative overflow-hidden"
            style={{ backgroundColor: C.card }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bride}
              alt={data.title}
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
            />
            {venueB ? (
              <div className="absolute bottom-8 right-8 text-right">
                <p
                  className="mb-1 text-[9px] uppercase tracking-[0.5em] text-white/55"
                  style={F.body}
                >
                  Δεξίωση
                </p>
                <h3 className="text-xl text-white" style={F.display}>
                  {venueB.name}
                </h3>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <MapPin className="h-3 w-3 text-white/50" strokeWidth={1.5} />
                  <p className="text-xs text-white/55" style={F.body}>
                    {formatVenueLocation(venueB.city, venueB.address)}
                  </p>
                </div>
              </div>
            ) : null}
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
        <section className="px-6 py-24" style={{ backgroundColor: C.card }}>
          <motion.div className="mx-auto max-w-sm" {...fadeUp}>
            <div className="mb-10">
              <p
                className="mb-3 text-[9px] uppercase tracking-[0.5em]"
                style={{ ...F.body, color: C.muted }}
              >
                Επιβεβαίωση
              </p>
              <h2
                className="mb-2 text-3xl font-normal"
                style={{ ...F.display, color: C.text }}
              >
                Παρουσία
              </h2>
              {data.rsvpDeadline ? (
                <p className="mt-2 text-sm" style={{ ...F.body, color: C.muted }}>
                  Έως {formatEventDateShort(data.rsvpDeadline, data.locale)}
                </p>
              ) : null}
              <div className="mt-4 h-px w-8" style={{ backgroundColor: C.text }} />
            </div>
            {rsvp.submitted ? (
              <div className="border py-10 text-center" style={{ borderColor: C.line }}>
                <Check className="mx-auto mb-3 h-4 w-4" style={{ color: C.accent }} />
                <p className="text-lg" style={{ ...F.display, color: C.text }}>
                  Ευχαριστούμε.
                </p>
              </div>
            ) : (
              <form onSubmit={rsvp.submit} className="space-y-3">
                {rsvp.error ? (
                  <p className="border px-3 py-2 text-sm text-red-700" style={{ borderColor: C.line }}>
                    {rsvp.error}
                  </p>
                ) : null}
                <input
                  type="text"
                  required
                  placeholder="Ονοματεπώνυμο"
                  value={rsvp.name}
                  onChange={(e) => rsvp.setName(e.target.value)}
                  className="w-full border bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[#1A1A18]"
                  style={{ ...F.body, borderColor: C.line, color: C.text }}
                />
                <div className="grid grid-cols-2 gap-2">
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
                        borderColor: rsvp.attending === key ? C.accent : C.line,
                        backgroundColor: rsvp.attending === key ? C.accent : "transparent",
                        color: rsvp.attending === key ? "#FFFFFF" : C.muted,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!rsvp.name || !rsvp.attending || rsvp.submitting}
                  className="w-full py-3 text-xs uppercase tracking-[0.4em] transition-all hover:opacity-80 disabled:opacity-25"
                  style={{ ...F.body, backgroundColor: C.accent, color: "#FFFFFF" }}
                >
                  {rsvp.submitting ? "Αποστολή..." : "Αποστολή"}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      ) : null}

      <footer className="border-t py-16 text-center" style={{ borderColor: C.border }}>
        <p
          className="mb-3 text-[10px] uppercase tracking-[0.55em]"
          style={{ ...F.body, color: C.muted }}
        >
          {data.title}
        </p>
        <p className="text-2xl font-normal" style={{ ...F.display, color: C.text }}>
          {data.footerText}
        </p>
        {dateMain ? (
          <p
            className="mt-4 text-[9px] uppercase tracking-[0.4em]"
            style={{ ...F.body, color: C.muted }}
          >
            {dateMain}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

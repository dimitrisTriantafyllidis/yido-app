"use client";

import { motion } from "motion/react";
import { ExternalLink, Star } from "lucide-react";

export interface Vendor {
  name: string;
  category: string;
  website?: string;
  logo?: string;
  description?: string;
}

const LOGO_PALETTE = [
  "#6B1A2A", "#2D5A3D", "#4A6A8A", "#7A5C3A",
  "#8B6070", "#C4704F", "#2A4A30", "#C9A840",
];

interface ThankYouVendorsProps {
  vendors?: Vendor[];
  colors: {
    bg: string;
    card: string;
    accent: string;
    text: string;
    muted: string;
    border: string;
  };
  fontDisplay: React.CSSProperties;
  fontLabel: React.CSSProperties;
  title?: string;
  subtitle?: string;
}

export function ThankYouVendors({
  vendors = [],
  colors,
  fontDisplay,
  fontLabel,
  title = "Ευχαριστούμε",
  subtitle = "Οι Συνεργάτες μας",
}: ThankYouVendorsProps) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.card }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="h-px w-10" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
            <Star
              className="w-3.5 h-3.5"
              style={{ color: colors.accent, opacity: 0.5 }}
              strokeWidth={1.5}
            />
            <div className="h-px w-10" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
          </div>
          <p
            style={{
              ...fontLabel,
              color: colors.muted,
              fontSize: "9px",
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            {subtitle}
          </p>
          <h2
            style={{
              ...fontDisplay,
              fontSize: "clamp(1.8rem,4vw,2.5rem)",
              color: colors.text,
              marginBottom: "0.5rem",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              ...fontLabel,
              color: colors.muted,
              fontSize: "0.82rem",
              lineHeight: 1.7,
            }}
          >
            Ευχαριστούμε τους ανθρώπους που έκαναν τη μέρα μας μοναδική
          </p>
        </motion.div>

        {vendors.length === 0 ? (
          <p
            className="text-center text-sm"
            style={{ ...fontLabel, color: colors.muted }}
          >
            Οι συνεργάτες θα εμφανιστούν εδώ μόλις προστεθούν.
          </p>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {vendors.map((vendor, i) => {
            const initial = vendor.name.trim()[0].toUpperCase();
            const logoColor = LOGO_PALETTE[i % LOGO_PALETTE.length];

            return (
              <motion.div
                key={i}
                className="border p-6 flex flex-col items-center text-center transition-all"
                style={{ borderColor: colors.border, backgroundColor: colors.bg }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, boxShadow: `0 8px 30px rgba(0,0,0,0.06)` }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.07 }}
              >
                <div className="mb-4">
                  {vendor.logo ? (
                    <div
                      className="w-14 h-14 rounded-full overflow-hidden mx-auto relative"
                      style={{ border: `1.5px solid ${colors.border}` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vendor.logo}
                        alt={vendor.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-white text-lg font-semibold"
                      style={{
                        backgroundColor: logoColor,
                        fontFamily: fontDisplay.fontFamily,
                      }}
                    >
                      {initial}
                    </div>
                  )}
                </div>

                <p
                  style={{
                    ...fontLabel,
                    color: colors.accent,
                    fontSize: "7.5px",
                    letterSpacing: "0.45em",
                    textTransform: "uppercase",
                    marginBottom: "0.35rem",
                  }}
                >
                  {vendor.category}
                </p>

                <p
                  style={{
                    ...fontDisplay,
                    fontSize: "1rem",
                    color: colors.text,
                    marginBottom: "0.3rem",
                    lineHeight: 1.3,
                  }}
                >
                  {vendor.name}
                </p>

                {vendor.description && (
                  <p
                    style={{
                      ...fontLabel,
                      color: colors.muted,
                      fontSize: "0.72rem",
                      lineHeight: 1.5,
                      marginBottom: "1rem",
                    }}
                  >
                    {vendor.description}
                  </p>
                )}

                {vendor.website && vendor.website !== "#" ? (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
                    style={{
                      ...fontLabel,
                      color: colors.accent,
                      fontSize: "9px",
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Επισκεφτείτε
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span
                    style={{
                      ...fontLabel,
                      color: colors.muted,
                      fontSize: "9px",
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      opacity: 0.45,
                    }}
                  >
                    Επισκεφτείτε
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
        )}

        {vendors.length > 0 ? (
        <motion.p
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            ...fontLabel,
            color: colors.muted,
            fontSize: "0.78rem",
            fontStyle: "italic",
          }}
        >
          "Χωρίς εσάς, αυτή η μέρα δεν θα ήταν το ίδιο."
        </motion.p>
        ) : null}
      </div>
    </section>
  );
}

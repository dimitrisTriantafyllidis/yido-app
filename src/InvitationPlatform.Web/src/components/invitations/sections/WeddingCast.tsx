"use client";

import { motion } from "motion/react";
import { Users } from "lucide-react";

export interface CastMember {
  role: string;
  name: string;
  photo: string;
  note?: string;
}

interface WeddingCastProps {
  members?: CastMember[];
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
  fontSerif?: React.CSSProperties;
  title?: string;
  subtitle?: string;
}

export function WeddingCast({
  members = [],
  colors,
  fontDisplay,
  fontLabel,
  fontSerif,
  title = "Πρωταγωνιστές",
  subtitle = "Η Ομάδα μας",
}: WeddingCastProps) {
  const bodyFont = fontSerif || fontDisplay;

  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
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
            <Users className="w-3.5 h-3.5" style={{ color: colors.accent, opacity: 0.5 }} />
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
            }}
          >
            {title}
          </h2>
        </motion.div>

        {members.length === 0 ? (
          <p
            className="text-center text-sm"
            style={{ ...fontLabel, color: colors.muted }}
          >
            Οι πρωταγωνιστές θα εμφανιστούν εδώ μόλις προστεθούν.
          </p>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-6">
          {members.map((member, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <div
                className="relative mb-4 overflow-hidden"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: `2px solid ${colors.accent}`,
                  padding: "3px",
                }}
              >
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{ borderRadius: "50%", backgroundColor: colors.card }}
                >
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-lg"
                      style={{ color: colors.accent }}
                    >
                      {member.name.trim()[0]?.toUpperCase() ?? "•"}
                    </div>
                  )}
                </div>
              </div>

              <p
                style={{
                  ...fontLabel,
                  color: colors.accent,
                  fontSize: "8px",
                  letterSpacing: "0.45em",
                  textTransform: "uppercase",
                  marginBottom: "0.35rem",
                }}
              >
                {member.role}
              </p>

              <p
                style={{
                  ...bodyFont,
                  color: colors.text,
                  fontSize: "0.9rem",
                  lineHeight: 1.3,
                }}
              >
                {member.name}
              </p>

              {member.note && (
                <p
                  style={{
                    ...fontLabel,
                    color: colors.muted,
                    fontSize: "0.7rem",
                    fontStyle: "italic",
                    marginTop: "0.2rem",
                  }}
                >
                  {member.note}
                </p>
              )}
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}

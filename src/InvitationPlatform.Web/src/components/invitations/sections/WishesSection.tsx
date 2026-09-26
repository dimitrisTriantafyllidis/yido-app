"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Send, Heart } from "lucide-react";
import type { GuestWishItem } from "../extra-section-config";

interface Wish {
  name: string;
  message: string;
  time: string;
  color: string;
}

const AVATAR_COLORS = ["#6B1A2A", "#2D5A3D", "#4A6A8A", "#7A5C3A", "#8B6070", "#C4704F"];
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function formatWishTime(createdAt?: string): string {
  if (!createdAt) return "Μόλις τώρα";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Μόλις τώρα";
  return date.toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toWish(item: GuestWishItem, index: number): Wish {
  return {
    name: item.name,
    message: item.message,
    time: formatWishTime(item.createdAt),
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
}

interface WishesSectionProps {
  initialWishes?: GuestWishItem[];
  slug?: string;
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
  onSubmitWish?: (name: string, message: string) => void;
}

export function WishesSection({
  initialWishes = [],
  slug,
  colors,
  fontDisplay,
  fontLabel,
  fontSerif,
  title = "Οι Ευχές σας",
  subtitle = "Βιβλίο Ευχών",
  onSubmitWish,
}: WishesSectionProps) {
  const [wishes, setWishes] = useState<Wish[]>(() =>
    initialWishes.map((w, i) => toWish(w, i))
  );
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const bodyFont = fontSerif || fontDisplay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || sending) return;
    setSending(true);
    setSubmitError("");

    try {
      if (slug) {
        const res = await fetch(`${API_BASE}/api/v1/public/invitations/${slug}/wishes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), message: message.trim() }),
        });
        if (!res.ok) {
          setSubmitError("Η αποστολή απέτυχε. Δοκιμάστε ξανά.");
          return;
        }
      }

      const newWish = {
        name: name.trim(),
        message: message.trim(),
        time: "Μόλις τώρα",
        color: AVATAR_COLORS[wishes.length % AVATAR_COLORS.length],
      };

      setWishes((prev) => [newWish, ...prev]);
      onSubmitWish?.(name.trim(), message.trim());
      setName("");
      setMessage("");
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
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
          <div className="flex items-center gap-3 justify-center mt-4">
            <div className="h-px w-10" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
            <Heart className="w-3 h-3" style={{ color: colors.accent, opacity: 0.5 }} />
            <div className="h-px w-10" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto mb-14 space-y-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <input
            type="text"
            required
            placeholder="Το όνομά σας"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none border bg-transparent transition-colors"
            style={{
              ...fontLabel,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
          <textarea
            required
            rows={3}
            placeholder="Γράψτε τις ευχές σας για το ζευγάρι..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none border bg-transparent resize-none transition-colors"
            style={{
              ...fontLabel,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
          {submitError ? (
            <p className="text-center text-xs" style={{ color: "#CC3333" }}>
              {submitError}
            </p>
          ) : null}
          {justSubmitted ? (
            <div className="py-3 text-center border" style={{ borderColor: colors.border }}>
              <p
                style={{
                  ...fontLabel,
                  color: colors.accent,
                  fontSize: "0.8rem",
                  letterSpacing: "0.1em",
                }}
              >
                ✓ Η ευχή σας καταχωρήθηκε!
              </p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 flex items-center justify-center gap-2 transition-all hover:opacity-80 disabled:opacity-60"
              style={{
                ...fontLabel,
                backgroundColor: colors.accent,
                color: "#FFFFFF",
                fontSize: "10px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
              }}
            >
              <Send className="w-3 h-3" />
              {sending ? "Αποστολή..." : "Αποστολή Ευχής"}
            </button>
          )}
        </motion.form>

        {wishes.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishes.map((w, i) => (
              <motion.div
                key={`${w.name}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.35) }}
                className="p-5 border"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ backgroundColor: w.color }}
                  >
                    {w.name.trim()[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ ...fontLabel, color: colors.text }}
                    >
                      {w.name}
                    </p>
                    <p className="text-xs" style={{ ...fontLabel, color: colors.muted }}>
                      {w.time}
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    ...bodyFont,
                    color: `${colors.text}99`,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{w.message}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

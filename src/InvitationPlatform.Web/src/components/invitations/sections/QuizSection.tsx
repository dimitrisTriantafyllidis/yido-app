"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, RotateCcw } from "lucide-react";

export interface Question {
  q: string;
  options: string[];
  correct: number;
  emoji: string;
}

interface QuizSectionProps {
  questions?: Question[];
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
  coupleNames?: string;
  title?: string;
  subtitle?: string;
}

const SCORE_MSGS = [
  { min: 5, label: "Τέλειο! 🏆", msg: "Τους ξέρετε καλύτερα και από τους ίδιους!" },
  { min: 3, label: "Πολύ καλά! 🎉", msg: "Σχεδόν τέλεια! Περνάτε πολύ χρόνο μαζί τους!" },
  { min: 1, label: "Καλή αρχή! 🌸", msg: "Δεν πειράζει — ο γάμος είναι η ευκαιρία να τους γνωρίσετε!" },
  { min: 0, label: "Χαχα! 😅", msg: "Καλό είναι που ήρθατε στον γάμο — θα μάθετε πολλά!" },
];

export function QuizSection({
  questions,
  colors,
  fontDisplay,
  fontLabel,
  coupleNames = "το ζευγάρι",
  title = "Πόσο τους ξέρετε;",
  subtitle = "Διασκέδαση",
}: QuizSectionProps) {
  const items = questions ?? [];
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const q = items[currentQ];

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === q.correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentQ < items.length - 1) {
        setCurrentQ((c) => c + 1);
        setSelected(null);
        setRevealed(false);
      } else {
        setPhase("result");
      }
    }, 950);
  };

  const reset = () => {
    setPhase("intro");
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setRevealed(false);
  };

  const scoreMsg = SCORE_MSGS.find((m) => score >= m.min) ?? SCORE_MSGS[SCORE_MSGS.length - 1];

  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.card }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
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
              fontSize: "clamp(1.5rem,3.5vw,2.2rem)",
              color: colors.text,
              marginBottom: "0.5rem",
            }}
          >
            {title}
          </h2>
          <p style={{ ...fontLabel, color: colors.muted, fontSize: "0.8rem" }}>
            Ένα διασκεδαστικό κουίζ για {coupleNames}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-sm" style={{ ...fontLabel, color: colors.muted }}>
            Προσθέστε ερωτήσεις κουίζ στον επεξεργαστή πρόσκλησης.
          </p>
        ) : null}

        {items.length > 0 && phase === "intro" && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-5xl mb-4">🎉</p>
            <p
              style={{
                ...fontLabel,
                color: colors.muted,
                fontSize: "0.85rem",
                lineHeight: 1.75,
                marginBottom: "2rem",
              }}
            >
              {items.length} ερωτήσεις · Πολλαπλή επιλογή
              <br />
              Βλέπουμε ποιος τους ξέρει καλύτερα!
            </p>
            <button
              onClick={() => setPhase("playing")}
              className="inline-flex items-center gap-2 px-8 py-3 transition-all hover:opacity-80"
              style={{
                ...fontLabel,
                backgroundColor: colors.accent,
                color: "#FFFFFF",
                fontSize: "10px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              Ξεκινήστε
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {items.length > 0 && phase === "playing" && q && (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32 }}
          >
            <div className="flex items-center gap-3 mb-7">
              <div
                className="flex-1 h-0.5 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentQ / items.length) * 100}%`,
                    backgroundColor: colors.accent,
                  }}
                />
              </div>
              <p
                style={{
                  ...fontLabel,
                  color: colors.muted,
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                }}
              >
                {currentQ + 1} / {items.length}
              </p>
            </div>

            <div className="text-center mb-8">
              <p className="text-4xl mb-4">{q.emoji}</p>
              <p
                style={{
                  ...fontDisplay,
                  fontSize: "clamp(1rem,2.8vw,1.3rem)",
                  color: colors.text,
                  lineHeight: 1.55,
                }}
              >
                {q.q}
              </p>
            </div>

            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                let borderColor = colors.border;
                let bgColor = "transparent";
                let textColor = colors.text;

                if (revealed) {
                  if (i === q.correct) {
                    borderColor = "#22A159";
                    bgColor = "rgba(34,161,89,0.07)";
                    textColor = "#22A159";
                  } else if (i === selected && i !== q.correct) {
                    borderColor = "#CC3333";
                    bgColor = "rgba(204,51,51,0.05)";
                    textColor = "#CC3333";
                  } else {
                    textColor = `${colors.text}50`;
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={revealed}
                    className="w-full px-5 py-3.5 border text-left text-sm transition-all hover:opacity-75 disabled:cursor-default"
                    style={{
                      ...fontLabel,
                      borderColor,
                      backgroundColor: bgColor,
                      color: textColor,
                    }}
                  >
                    <span className="mr-3 opacity-40 font-mono text-[11px]">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {items.length > 0 && phase === "result" && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-5xl mb-4">
              {score === items.length ? "🏆" : score >= 3 ? "🎉" : score >= 1 ? "🌸" : "😅"}
            </p>
            <p
              style={{
                ...fontDisplay,
                fontSize: "clamp(1.3rem,3vw,1.8rem)",
                color: colors.accent,
                marginBottom: "0.4rem",
              }}
            >
              {scoreMsg.label}
            </p>
            <p
              style={{
                ...fontDisplay,
                fontSize: "1.4rem",
                color: colors.text,
                marginBottom: "0.5rem",
              }}
            >
              {score} / {items.length} σωστές
            </p>
            <p
              style={{
                ...fontLabel,
                color: colors.muted,
                fontSize: "0.82rem",
                lineHeight: 1.75,
                maxWidth: "300px",
                margin: "0 auto 2rem",
              }}
            >
              {scoreMsg.msg}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-2.5 border transition-all hover:opacity-70"
              style={{
                ...fontLabel,
                borderColor: colors.border,
                color: colors.muted,
                fontSize: "10px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              <RotateCcw className="w-3 h-3" />
              Ξαναπαίξτε
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

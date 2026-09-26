"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { motion } from "motion/react";

interface VideoSectionProps {
  title?: string;
  subtitle?: string;
  posterUrl: string;
  videoId?: string;
  colors: {
    bg?: string;
    text: string;
    accent: string;
    muted: string;
  };
  fontDisplay: React.CSSProperties;
  fontLabel: React.CSSProperties;
}

export function VideoSection({
  title = "Το Βίντεό μας",
  subtitle = "ΣΤΙΓΜΕΣ ΑΓΑΠΗΣ",
  posterUrl,
  videoId,
  colors,
  fontDisplay,
  fontLabel,
}: VideoSectionProps) {
  const [playing, setPlaying] = useState(false);

  if (!posterUrl) return null;

  return (
    <>
      <section className="relative overflow-hidden" style={{ backgroundColor: "#000" }}>
        <div className="h-8 md:h-10 bg-black relative z-10 flex items-center justify-center">
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
            ))}
          </div>
        </div>

        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: "calc(56.25% - 80px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "brightness(0.48) saturate(0.75)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              style={{
                ...fontLabel,
                color: "rgba(255,255,255,0.38)",
                fontSize: "8px",
                letterSpacing: "0.6em",
                textTransform: "uppercase",
              }}
            >
              {subtitle}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                ...fontDisplay,
                fontSize: "clamp(1.4rem,4vw,2.6rem)",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {title}
            </motion.h2>
            <motion.button
              onClick={() => setPlaying(true)}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.94 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-16 h-16 rounded-full border-2 border-white/35 flex items-center justify-center hover:bg-white/12 transition-all"
              style={{ backdropFilter: "blur(6px)" }}
            >
              <Play className="w-5 h-5 text-white ml-0.5" />
            </motion.button>
          </div>
        </div>

        <div className="h-8 md:h-10 bg-black relative z-10 flex items-center justify-center">
          <p
            style={{
              ...fontLabel,
              color: "rgba(255,255,255,0.18)",
              fontSize: "7px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
            }}
          >
            WEDDING FILM
          </p>
        </div>
      </section>

      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.94)" }}
          onClick={() => setPlaying(false)}
        >
          <button
            className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
            onClick={() => setPlaying(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="w-full max-w-4xl aspect-video overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                <Play className="w-10 h-10 text-white/15 mb-5" />
                <p
                  style={{
                    ...fontDisplay,
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "1.1rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Το Βίντεό σας εδώ
                </p>
                <p
                  style={{
                    ...fontLabel,
                    color: "rgba(255,255,255,0.18)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                  }}
                >
                  Προσθέστε το YouTube ID σας
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

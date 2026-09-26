"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

interface CoupleGalleryProps {
  photos?: string[];
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

export function CoupleGallery({
  photos = [],
  colors,
  fontDisplay,
  fontLabel,
  title = "Στιγμές μαζί",
  subtitle = "Φωτογραφίες",
}: CoupleGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const prev = useCallback(
    () => setLightboxIdx((i) => (i !== null ? (i - 1 + photos.length) % photos.length : 0)),
    [photos.length]
  );
  const next = useCallback(
    () => setLightboxIdx((i) => (i !== null ? (i + 1) % photos.length : 0)),
    [photos.length]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightboxIdx(null);
    },
    [prev, next]
  );

  if (photos.length === 0) return null;

  return (
    <>
      <section className="py-20 px-6" style={{ backgroundColor: colors.card }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 justify-center mb-4">
              <div className="h-px w-10" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
              <Camera className="w-3.5 h-3.5" style={{ color: colors.accent, opacity: 0.5 }} />
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

          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              gridAutoRows: "200px",
            }}
          >
            {photos.slice(0, 6).map((photo, i) => {
              const isTall = i === 0 || i === 4;
              return (
                <motion.div
                  key={i}
                  className="relative overflow-hidden cursor-pointer group"
                  style={{
                    gridRow: isTall ? "span 2" : "span 1",
                    gridColumn: i === 5 ? "span 2" : "span 1",
                  }}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.015 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.07 }}
                  onClick={() => setLightboxIdx(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`Φωτογραφία ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center"
                      style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(255,255,255,0.12)" }}
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span
                      style={{
                        ...fontLabel,
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "7px",
                        letterSpacing: "0.3em",
                      }}
                    >
                      {i + 1} / {Math.min(photos.length, 6)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {photos.length > 6 && (
            <p
              className="text-center mt-4"
              style={{ ...fontLabel, color: colors.muted, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase" }}
            >
              +{photos.length - 6} ακόμα φωτογραφίες
            </p>
          )}
        </div>
      </section>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.96)" }}
          onClick={() => setLightboxIdx(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors z-10"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-5 h-5" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <div
            className="max-w-3xl max-h-[80vh] w-full px-16 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ height: "70vh" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[lightboxIdx]}
                alt={`Φωτογραφία ${lightboxIdx + 1}`}
                className="h-full w-full object-contain"
              />
            </div>
            <p
              className="text-center mt-3"
              style={{ ...fontLabel, color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "0.3em" }}
            >
              {lightboxIdx + 1} / {photos.length}
            </p>
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}
    </>
  );
}

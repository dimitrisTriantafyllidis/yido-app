const PREVIEW_STYLES: Record<
  string,
  { bg: string; ink: string; muted: string; accent: string; panel: string }
> = {
  rustic: {
    bg: "#4A2E22",
    ink: "#F5EDE0",
    muted: "#D4C4B0",
    accent: "#C4A574",
    panel: "#2C1A12",
  },
  boho: {
    bg: "#E8D5B7",
    ink: "#3D2B1F",
    muted: "#7A6450",
    accent: "#8B6B4A",
    panel: "#F4E8D4",
  },
  minimal: {
    bg: "#F4F1EC",
    ink: "#1C1516",
    muted: "#8A8078",
    accent: "#1C1516",
    panel: "#FFFFFF",
  },
  vintage: {
    bg: "#F3E6DC",
    ink: "#5C3A3A",
    muted: "#A07A78",
    accent: "#C9A3A0",
    panel: "#FFF8F3",
  },
  elegant: {
    bg: "#1C1516",
    ink: "#F5EFE4",
    muted: "#C39C5E",
    accent: "#C39C5E",
    panel: "#2A1C1E",
  },
  floral: {
    bg: "#4A1221",
    ink: "#FBF9F4",
    muted: "#E8C4C8",
    accent: "#C39C5E",
    panel: "#5C1B2E",
  },
  wreath: {
    bg: "#2E5A4C",
    ink: "#FAFAF7",
    muted: "#C9D8D0",
    accent: "#C4A574",
    panel: "#23463B",
  },
  dusty: {
    bg: "#D5DEE6",
    ink: "#2F3E4A",
    muted: "#6E7F8C",
    accent: "#8FA4B3",
    panel: "#EEF3F6",
  },
  greengold: {
    bg: "#1F3A2E",
    ink: "#F6EED8",
    muted: "#D4C4A0",
    accent: "#C4993D",
    panel: "#163026",
  },
  geometric: {
    bg: "#F7F0EA",
    ink: "#3A1112",
    muted: "#9C6B6E",
    accent: "#C4993D",
    panel: "#FFFFFF",
  },
  classic: {
    bg: "#2E5A4C",
    ink: "#FAFAF7",
    muted: "rgba(255,255,255,0.7)",
    accent: "#C4A574",
    panel: "#1A1A18",
  },
  romantic: {
    bg: "#7A3A48",
    ink: "#FBF4F2",
    muted: "#E8C4C8",
    accent: "#E8B4B8",
    panel: "#5C2A34",
  },
  birthday: {
    bg: "#3D2B5C",
    ink: "#FBF9F4",
    muted: "#D4C4E8",
    accent: "#C4993D",
    panel: "#2A1C42",
  },
};

const KNOWN_CATEGORIES = new Set(Object.keys(PREVIEW_STYLES));

export function templatePreviewCategory(category?: string | null) {
  const key = (category ?? "classic").toLowerCase();
  return KNOWN_CATEGORIES.has(key) ? key : "classic";
}

export function templatePreviewSrc(category?: string | null, remoteUrl?: string | null) {
  if (remoteUrl && remoteUrl.startsWith("/") && !remoteUrl.includes("unsplash")) {
    return remoteUrl;
  }
  return `/templates/${templatePreviewCategory(category)}.svg`;
}

export function TemplatePreviewImage({
  category,
  name,
  className = "",
}: {
  category?: string | null;
  name?: string | null;
  remoteUrl?: string | null;
  className?: string;
}) {
  const style = PREVIEW_STYLES[templatePreviewCategory(category)];
  const label = name?.trim() || "YIDO";

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: style.bg }}>
      <div
        className="pointer-events-none absolute inset-3 rounded-sm border"
        style={{ borderColor: `${style.accent}66` }}
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: style.muted }}
        >
          YIDO
        </span>
        <span
          className="font-display text-lg leading-tight sm:text-xl"
          style={{ color: style.ink }}
        >
          {label}
        </span>
        <span className="h-px w-10" style={{ backgroundColor: style.accent }} />
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: style.muted }}
        >
          Invitation
        </span>
      </div>
    </div>
  );
}

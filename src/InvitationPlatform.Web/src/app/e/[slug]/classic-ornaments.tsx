export function ClassicOrnament({ color = "#2E5A4C" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="h-px w-14" style={{ backgroundColor: `${color}59` }} />
      <span className="text-sm leading-none" style={{ color: `${color}80` }}>
        ✦
      </span>
      <div className="h-px w-14" style={{ backgroundColor: `${color}59` }} />
    </div>
  );
}

export function ClassicLabel({
  children,
  light = false,
  color = "#2E5A4C",
}: {
  children: React.ReactNode;
  light?: boolean;
  color?: string;
}) {
  return (
    <p
      className={`mb-3 text-[10px] uppercase tracking-[0.45em] ${
        light ? "text-white/45" : ""
      }`}
      style={light ? undefined : { color }}
    >
      {children}
    </p>
  );
}

export function OliveBranch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M65 218 C62 185 55 160 50 135 C45 110 48 82 54 58 C60 34 68 18 72 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M56 195 C44 188 30 183 18 179"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <ellipse
        cx="13"
        cy="177"
        rx="9"
        ry="3.5"
        transform="rotate(-20 13 177)"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M54 170 C65 162 78 156 90 152"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <ellipse
        cx="94"
        cy="150"
        rx="9"
        ry="3.5"
        transform="rotate(15 94 150)"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M51 142 C39 134 26 128 14 124"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <ellipse
        cx="10"
        cy="122"
        rx="9"
        ry="3.5"
        transform="rotate(-15 10 122)"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}

export function coupleInitials(title: string): [string, string] {
  const parts = title.split(/\s*(?:&|και|\+)\s*/i);
  if (parts.length >= 2) {
    return [
      parts[0].trim().charAt(0).toUpperCase(),
      parts[1].trim().charAt(0).toUpperCase(),
    ];
  }
  const first = title.trim().charAt(0).toUpperCase();
  return [first || "•", ""];
}

export function cfg(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  return typeof value === "string" ? value : "";
}

export function SectionIntro({
  heading,
  label,
  displayFont,
  primaryColor,
  classic,
  light,
}: {
  heading: string;
  label: string;
  displayFont: string;
  primaryColor: string;
  classic?: boolean;
  light?: boolean;
}) {
  if (!heading && !label) return null;
  return (
    <div className={`text-center ${classic ? "mb-14" : "mb-8"}`}>
      {label ? (
        <ClassicLabel light={light} color={primaryColor}>
          {label}
        </ClassicLabel>
      ) : null}
      {heading ? (
        <h2
          className={
            classic
              ? `text-4xl font-normal ${light ? "text-white" : ""}`
              : "text-2xl font-semibold"
          }
          style={{
            fontFamily: `${displayFont}, serif`,
            color: light ? undefined : classic ? undefined : primaryColor,
          }}
        >
          {heading}
        </h2>
      ) : null}
    </div>
  );
}

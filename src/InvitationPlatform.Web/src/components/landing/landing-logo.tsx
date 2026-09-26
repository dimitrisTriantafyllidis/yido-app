import Link from "next/link";

export function LandingLogo({
  href = "/",
  color = "#4A1221",
  size = "default",
}: {
  href?: string;
  color?: string;
  size?: "default" | "lg";
}) {
  const textSize = size === "lg" ? "text-[36px]" : "text-[28px] md:text-[32px]";
  return (
    <Link href={href} className="flex items-center gap-1.5">
      <span className={`font-display leading-none tracking-tight ${textSize}`} style={{ color }}>
        YIDO
      </span>
      <span className="size-1.5 rounded-[3px] bg-[#C39C5E]" aria-hidden />
    </Link>
  );
}

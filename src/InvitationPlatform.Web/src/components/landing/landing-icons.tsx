export function FeatureIcon({ src }: { src: string }) {
  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-clip rounded-xl bg-[#F5EFE4]">
      <img src={src} alt="" width={24} height={24} className="size-6" />
    </div>
  );
}

export function CheckIcon({ variant = "gold" }: { variant?: "gold" | "burgundy" }) {
  const src = variant === "burgundy" ? "/landing/check-burgundy.svg" : "/landing/check.svg";
  return (
    <span className="inline-flex size-4 shrink-0 overflow-clip">
      <img src={src} alt="" width={16} height={16} className="size-4" />
    </span>
  );
}

export function SocialIcon({ src, label, href }: { src: string; label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex size-8 items-center justify-center overflow-clip rounded-2xl bg-[#F5EFE4] transition-colors hover:bg-[#EADFCB]"
    >
      <img src={src} alt="" width={16} height={16} className="size-4" />
    </a>
  );
}

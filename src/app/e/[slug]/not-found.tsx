import Link from "next/link";
import { Heart } from "lucide-react";

export default function EventNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[var(--color-background)] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-[var(--color-foreground-muted)]" />
        </div>
        <h1 className="text-2xl font-[family-name:var(--font-cormorant)] font-bold text-[var(--color-foreground)] mb-2">
          Event not found
        </h1>
        <p className="text-[var(--color-foreground-muted)] mb-6 text-sm">
          This event page doesn&apos;t exist or is no longer available.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg transition-all duration-200 ease-out cursor-pointer min-h-[44px]"
        >
          Go to YIDO
        </Link>
      </div>
    </div>
  );
}

"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
        Something went wrong
      </h2>
      <p className="text-[var(--color-foreground-muted)] mb-6 text-sm">
        An error occurred while loading this page.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg transition-all duration-200 ease-out cursor-pointer min-h-[44px]"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-foreground)] font-medium rounded-lg hover:bg-[var(--color-muted)] transition-all duration-200 ease-out cursor-pointer min-h-[44px] flex items-center"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

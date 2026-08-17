"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, getApiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password, rememberMe);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getApiErrorMessage(err, "Σφάλμα σύνδεσης. Δοκιμάστε ξανά."));
      } else {
        setError("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Καλωσήρθατε
        </h1>
        <p className="mt-2 text-text-secondary">
          Συνδεθείτε στον λογαριασμό σας
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-sm"
      >
        {error && (
          <div className="rounded-lg bg-destructive-light px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Κωδικός
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-text-secondary">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border accent-accent"
            />
            Να με θυμάσαι
          </label>
          <Link
            href="/forgot-password"
            className="text-accent hover:text-accent-hover transition-colors"
          >
            Ξεχάσατε τον κωδικό;
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitting ? "Σύνδεση..." : "Σύνδεση"}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Δεν έχετε λογαριασμό;{" "}
          <Link
            href="/register"
            className="font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Εγγραφή
          </Link>
        </p>
      </form>
    </>
  );
}

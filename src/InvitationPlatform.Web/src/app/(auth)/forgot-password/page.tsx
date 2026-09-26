"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCenteredShell } from "@/components/auth/auth-centered-shell";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError("Σφάλμα. Δοκιμάστε ξανά.");
      } else {
        setError("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthCenteredShell>
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Ελέγξτε το email σας
        </h1>
        <p className="mt-4 text-text-secondary">
          Αν υπάρχει λογαριασμός με αυτό το email, θα λάβετε σύνδεσμο
          επαναφοράς κωδικού.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Επιστροφή στη σύνδεση
        </Link>
      </div>
      </AuthCenteredShell>
    );
  }

  return (
    <AuthCenteredShell>
    <>
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Επαναφορά κωδικού
        </h1>
        <p className="mt-2 text-text-secondary">
          Εισάγετε το email σας και θα σας στείλουμε σύνδεσμο επαναφοράς
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitting ? "Αποστολή..." : "Αποστολή συνδέσμου"}
        </button>

        <p className="text-center text-sm text-text-secondary">
          <Link
            href="/login"
            className="font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Επιστροφή στη σύνδεση
          </Link>
        </p>
      </form>
    </>
    </AuthCenteredShell>
  );
}

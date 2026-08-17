"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError, getApiErrorMessage } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Οι κωδικοί δεν ταιριάζουν.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? getApiErrorMessage(err)
          : "Αποτυχία επαναφοράς."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8">
      <h1 className="font-display text-2xl font-semibold mb-2">Επαναφορά κωδικού</h1>
      <p className="text-sm text-text-secondary mb-6">{email || "Συμπληρώστε νέο κωδικό"}</p>
      {done ? (
        <p className="text-success text-sm">Ο κωδικός άλλαξε. Μεταφορά στη σύνδεση...</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive-light px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Νέος κωδικός"
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
          />
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Επιβεβαίωση"
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={submitting || !token || !email}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Αποθήκευση..." : "Αποθήκευση"}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-accent">
          Σύνδεση
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <Suspense fallback={<div className="text-sm">Φόρτωση...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

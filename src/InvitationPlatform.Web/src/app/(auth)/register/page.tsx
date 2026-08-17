"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, getApiErrorMessage, getApiFieldErrors } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors([]);

    if (form.password !== form.confirmPassword) {
      setError("Οι κωδικοί δεν ταιριάζουν.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        organizationName: form.organizationName || undefined,
        locale: "el",
      });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getApiErrorMessage(err, "Σφάλμα εγγραφής. Δοκιμάστε ξανά."));
        setFieldErrors(getApiFieldErrors(err));
      } else {
        setError("Σφάλμα εγγραφής. Δοκιμάστε ξανά.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Δημιουργία λογαριασμού
        </h1>
        <p className="mt-2 text-text-secondary">
          Ξεκινήστε δωρεάν σε λίγα λεπτά
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-sm"
      >
        {error && (
          <div className="rounded-lg bg-destructive-light px-4 py-3 text-sm text-destructive">
            <p>{error}</p>
            {fieldErrors.length > 0 && (
              <ul className="mt-1 list-disc pl-4">
                {fieldErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Όνομα
            </label>
            <input
              id="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={inputClass}
              placeholder="Μαρία"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Επώνυμο
            </label>
            <input
              id="lastName"
              type="text"
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={inputClass}
              placeholder="Παπαδοπούλου"
            />
          </div>
        </div>

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
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="orgName"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Όνομα οργάνωσης{" "}
            <span className="text-text-muted font-normal">(προαιρετικό)</span>
          </label>
          <input
            id="orgName"
            type="text"
            value={form.organizationName}
            onChange={(e) => update("organizationName", e.target.value)}
            className={inputClass}
            placeholder="π.χ. Μαρία & Γιώργος"
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
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className={inputClass}
            placeholder="Τουλάχιστον 8 χαρακτήρες"
          />
          <p className="mt-1.5 text-xs text-text-muted">
            Τουλάχιστον 8 χαρακτήρες, με κεφαλαίο, πεζό και αριθμό.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Επιβεβαίωση κωδικού
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className={inputClass}
            placeholder="Επαναλάβετε τον κωδικό"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitting ? "Εγγραφή..." : "Δημιουργία λογαριασμού"}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Έχετε ήδη λογαριασμό;{" "}
          <Link
            href="/login"
            className="font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Σύνδεση
          </Link>
        </p>
      </form>
    </>
  );
}

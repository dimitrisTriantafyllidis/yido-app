"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LandingLogo } from "@/components/landing/landing-logo";
import { AuthEyeIcon } from "@/components/auth/auth-eye-icon";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    "h-12 w-full rounded-lg border border-[#E6DFD5] bg-white px-4 text-sm text-[#1F0F12] placeholder:text-[#6E5B60] outline-none focus:border-[#4A1221] focus:ring-1 focus:ring-[#4A1221]";

  return (
    <div className="w-full max-w-[480px] rounded-2xl bg-white px-10 py-8 shadow-[0_8px_16px_rgba(18,28,23,0.05)]">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <LandingLogo href="/" size="lg" />
        <div className="space-y-1">
          <h1 className="font-display text-[32px] text-[#1F0F12]">Δημιουργία λογαριασμού</h1>
          <p className="text-sm text-[#6E5B60]">Ξεκινήστε δωρεάν σε λίγα λεπτά</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>
            {fieldErrors.length > 0 ? (
              <ul className="mt-1 list-disc pl-4">
                {fieldErrors.map((fieldError, i) => (
                  <li key={i}>{fieldError}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-[#1F0F12]">
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
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-[#1F0F12]">
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

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-[#1F0F12]">
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

        <div className="space-y-2">
          <label htmlFor="orgName" className="block text-sm font-medium text-[#1F0F12]">
            Όνομα οργάνωσης (Προαιρετικό)
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

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-[#1F0F12]">
            Κωδικός
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className={`${inputClass} pr-12`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5B60] hover:text-[#4A1221]"
              aria-label={showPassword ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
            >
              <AuthEyeIcon open={showPassword} />
            </button>
          </div>
          <p className="text-xs leading-snug text-[#6E5B60]">
            Τουλάχιστον 8 χαρακτήρες, με κεφαλαίο, πεζό και αριθμό.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1F0F12]">
            Επιβεβαίωση κωδικού
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              className={`${inputClass} pr-12`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5B60] hover:text-[#4A1221]"
              aria-label={showConfirmPassword ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
            >
              <AuthEyeIcon open={showConfirmPassword} />
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-lg bg-[#4A1221] text-sm font-semibold text-white transition-colors hover:bg-[#3A0E1A] disabled:opacity-50"
          >
            {submitting ? "Εγγραφή..." : "Δημιουργία λογαριασμού"}
          </button>

          <p className="text-center text-[13px] text-[#6E5B60]">
            Έχετε ήδη λογαριασμό;{" "}
            <Link href="/login" className="font-semibold text-[#4A1221] hover:underline">
              Σύνδεση
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

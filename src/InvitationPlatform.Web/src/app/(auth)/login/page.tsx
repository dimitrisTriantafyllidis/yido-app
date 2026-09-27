"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LandingLogo } from "@/components/landing/landing-logo";
import { AuthEyeIcon } from "@/components/auth/auth-eye-icon";
import { useAuth } from "@/lib/auth-context";
import { ApiError, getApiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const inputClass =
    "h-12 w-full rounded-lg border border-[#EADFCB] bg-[#FBF9F4] px-4 text-sm text-[#1F0F12] placeholder:text-[#6E5B60] outline-none focus:border-[#4A1221] focus:ring-1 focus:ring-[#4A1221]";

  return (
    <div className="w-full max-w-[460px] rounded-2xl border border-[#EADFCB] bg-white p-6 shadow-[0_8px_16px_rgba(31,15,18,0.05)] sm:p-10">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <LandingLogo href="/" size="lg" />
        <div className="space-y-1.5">
          <h1 className="font-display text-4xl text-[#4A1221]">Καλωσήρθατε</h1>
          <p className="text-sm text-[#6E5B60]">Συνδεθείτε στον λογαριασμό σας</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-[#1F0F12]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 text-[#1F0F12]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-[18px] rounded border-[#EADFCB] accent-[#4A1221]"
            />
            Να με θυμάσαι
          </label>
          <Link href="/forgot-password" className="font-medium text-[#4A1221] hover:underline">
            Ξεχάσατε τον κωδικό;
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-lg bg-[#4A1221] text-sm font-semibold text-white transition-colors hover:bg-[#3A0E1A] disabled:opacity-50"
        >
          {submitting ? "Σύνδεση..." : "Σύνδεση"}
        </button>

        <p className="text-center text-[13px] text-[#6E5B60]">
          Δεν έχετε λογαριασμό;{" "}
          <Link href="/register" className="font-semibold text-[#4A1221] hover:underline">
            Εγγραφή
          </Link>
        </p>
      </form>
    </div>
  );
}

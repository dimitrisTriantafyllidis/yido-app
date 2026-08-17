"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError, getApiErrorMessage } from "@/lib/api";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("Λείπουν παράμετροι επιβεβαίωσης.");
      return;
    }
    api("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, token }),
    })
      .then(() => {
        setStatus("ok");
        setMessage("Το email επιβεβαιώθηκε.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiError
            ? getApiErrorMessage(err)
            : "Αποτυχία επιβεβαίωσης."
        );
      });
  }, [email, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="font-display text-2xl font-semibold mb-4">Επιβεβαίωση email</h1>
        {status === "loading" && <p className="text-sm text-text-secondary">Επαλήθευση...</p>}
        {status === "ok" && <p className="text-sm text-success">{message}</p>}
        {status === "error" && <p className="text-sm text-destructive">{message}</p>}
        <Link href="/login" className="mt-6 inline-block text-accent text-sm">
          Σύνδεση
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Φόρτωση...</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}

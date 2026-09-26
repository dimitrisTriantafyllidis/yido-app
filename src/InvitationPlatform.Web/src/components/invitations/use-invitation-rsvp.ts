"use client";

import { useState, useCallback } from "react";
import type { InvitationViewModel } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export function useInvitationRsvp(data: InvitationViewModel) {
  const [name, setName] = useState(data.rsvp.guestName ?? "");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const onTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const onTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || !attending) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: data.slug,
          inviteToken: data.rsvp.inviteToken,
          publicGuestName: name.trim(),
          attendingReception: attending === "yes",
          attendingCeremony: attending === "yes",
          adultCount: 1,
          childrenCount: 0,
          turnstileToken,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.title ?? "Σφάλμα");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Σφάλμα. Δοκιμάστε ξανά.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    name,
    setName,
    attending,
    setAttending,
    submitted,
    submitting,
    error,
    submit,
    turnstileToken,
    onTurnstileVerify,
    onTurnstileExpire,
  };
}

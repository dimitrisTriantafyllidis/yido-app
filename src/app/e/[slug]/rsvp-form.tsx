"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HelpCircle, HeartHandshake, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { scaleIn } from "@/lib/animations";
import { useTranslation } from "@/lib/i18n/client";

export function RSVPForm({
  eventId,
  allowPlusOnes,
  maxPlusOnes,
  primaryColor,
}: {
  eventId: string;
  allowPlusOnes: boolean;
  maxPlusOnes: number;
  primaryColor: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"confirmed" | "declined" | "maybe">("confirmed");
  const [plusOnes, setPlusOnes] = useState(0);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          name,
          email: email || null,
          rsvp_status: status,
          plus_ones: allowPlusOnes ? plusOnes : 0,
          dietary_notes: dietaryNotes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        toast.error("Failed to send RSVP. Please try again.");
        setLoading(false);
      } else {
        setSubmitted(true);
        toast.success("RSVP sent successfully!");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Failed to send RSVP. Please try again.");
      setLoading(false);
    }
  }

  if (submitted) {
    const icons = {
      confirmed: <Heart className="w-8 h-8 text-primary" fill="currentColor" />,
      maybe: <HelpCircle className="w-8 h-8 text-[var(--color-accent)]" />,
      declined: <HeartHandshake className="w-8 h-8 text-muted-foreground" />,
    };

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={scaleIn}
        className="bg-card rounded-xl shadow-[var(--shadow-card)] border border-border p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4">
          {icons[status]}
        </div>
        <h3 className="text-xl font-[family-name:var(--font-cormorant)] font-semibold text-foreground mb-2">
          {status === "confirmed"
            ? t("rsvp.thankYes")
            : status === "maybe"
              ? t("rsvp.thankMaybe")
              : t("rsvp.thankNo")}
        </h3>
        <p className="text-muted-foreground">
          {t("rsvp.recorded")}, {name}.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-xl shadow-[var(--shadow-card)] border border-border p-6 space-y-4"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="rsvp-name">{t("rsvp.yourName")}</Label>
        <Input
          id="rsvp-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rsvp-email">{t("rsvp.email")}</Label>
        <Input
          id="rsvp-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
        />
      </div>
      <div>
        <Label className="mb-2 block">{t("rsvp.willAttend")}</Label>
        <div className="flex gap-3">
          {(
            [
              { value: "confirmed", label: t("rsvp.yes") },
              { value: "maybe", label: t("rsvp.maybe") },
              { value: "declined", label: t("rsvp.no") },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`flex-1 py-3 px-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
                status === option.value
                  ? "border-primary bg-background text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {allowPlusOnes && status !== "declined" && (
        <div className="space-y-1.5">
          <Label htmlFor="plus-ones">{t("rsvp.additionalGuests")}</Label>
          <select
            id="plus-ones"
            value={plusOnes}
            onChange={(e) => setPlusOnes(Number(e.target.value))}
            className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Array.from({ length: maxPlusOnes + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? t("rsvp.justMe") : `+${i}`}
              </option>
            ))}
          </select>
        </div>
      )}
      {status !== "declined" && (
        <div className="space-y-1.5">
          <Label htmlFor="dietary">{t("rsvp.dietary")}</Label>
          <Input
            id="dietary"
            type="text"
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            placeholder={t("rsvp.dietaryPlaceholder")}
            className="h-11"
          />
        </div>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? (
          t("rsvp.sending")
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t("rsvp.send")}
          </>
        )}
      </Button>
    </form>
  );
}

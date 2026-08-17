"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircleHeart } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fadeInUp } from "@/lib/animations";
import { useTranslation } from "@/lib/i18n/client";
import type { Wish } from "@/lib/types";

export function WishBook({
  eventId,
  initialWishes,
}: {
  eventId: string;
  initialWishes: Wish[];
}) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          guest_name: name,
          message,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to send wish. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Optimistic update
      setWishes((prev) => [
        {
          id: data.id || crypto.randomUUID(),
          event_id: eventId,
          guest_name: name,
          message,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setSubmitted(true);
      setName("");
      setMessage("");
      toast.success(t("wishes.thankYou"));
    } catch {
      toast.error("Failed to send wish. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing wishes */}
      {wishes.length > 0 ? (
        <div className="space-y-3">
          {wishes.map((wish) => (
            <motion.div
              key={wish.id}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 p-5"
            >
              <p className="font-heading text-foreground italic leading-relaxed">
                &ldquo;{wish.message}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5">
                <MessageCircleHeart className="w-3.5 h-3.5 text-primary/60" />
                {wish.guest_name}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        !submitted && (
          <p className="text-center text-muted-foreground py-4">
            {t("wishes.noWishes")}
          </p>
        )
      )}

      {/* Leave a wish form */}
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl shadow-[var(--shadow-card)] border border-border p-6 text-center"
        >
          <MessageCircleHeart className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="font-heading text-lg font-semibold text-foreground">
            {t("wishes.thankYou")}
          </p>
        </motion.div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl shadow-[var(--shadow-card)] border border-border p-6 space-y-4"
        >
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {t("wishes.leaveWish")}
          </h3>
          <div className="space-y-1.5">
            <Label htmlFor="wish-name">{t("wishes.yourName")}</Label>
            <Input
              id="wish-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wish-message">{t("wishes.yourMessage")}</Label>
            <Textarea
              id="wish-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              placeholder={t("wishes.messagePlaceholder")}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? (
              t("wishes.sending")
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t("wishes.send")}
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

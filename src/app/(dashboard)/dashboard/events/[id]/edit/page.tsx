"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import type { Event, EventType } from "@/lib/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/lib/i18n/client";

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("wedding");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [coupleName1, setCoupleName1] = useState("");
  const [coupleName2, setCoupleName2] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();
  const EVENT_TYPES: { value: EventType; label: string }[] = [
    { value: "wedding", label: t("eventType.wedding") },
    { value: "baptism", label: t("eventType.baptism") },
    { value: "party", label: t("eventType.party") },
    { value: "corporate", label: t("eventType.corporate") },
    { value: "other", label: t("eventType.other") },
  ];

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        const ev = data as Event;
        setEvent(ev);
        setTitle(ev.title);
        setType(ev.type);
        setDate(ev.date);
        setTime(ev.time || "");
        setCoupleName1(ev.couple_name_1 || "");
        setCoupleName2(ev.couple_name_2 || "");
        setDescription(ev.description || "");
      }
      setFetching(false);
    }
    fetchEvent();
  }, [id, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("events")
      .update({
        title,
        type,
        date,
        time: time || null,
        description: description || null,
        couple_name_1: coupleName1 || null,
        couple_name_2: coupleName2 || null,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      toast.error("Αποτυχία αποθήκευσης");
      setLoading(false);
    } else {
      toast.success("Το event ενημερώθηκε!");
      router.push(`/dashboard/events/${id}`);
      router.refresh();
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">{t("error.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/dashboard/events/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        {t("event.backToEvents")}
      </Link>

      <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-8 tracking-tight">
        {t("form.editEvent")}
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">{t("form.eventDetails")}</h2>
            <div className="space-y-1.5">
              <Label htmlFor="type">{t("form.eventType")}</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {EVENT_TYPES.map((et) => (
                  <option key={et.value} value={et.value}>{et.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">{t("form.title")}</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-11"
              />
            </div>
            {type === "wedding" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name1">{t("form.partner1")}</Label>
                  <Input
                    id="name1"
                    type="text"
                    value={coupleName1}
                    onChange={(e) => setCoupleName1(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name2">{t("form.partner2")}</Label>
                  <Input
                    id="name2"
                    type="text"
                    value={coupleName2}
                    onChange={(e) => setCoupleName2(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">{t("form.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">{t("form.timeOptional")}</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">{t("form.description")}</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" size="lg" render={<Link href={`/dashboard/events/${id}`} />}>
            <ArrowLeft className="w-4 h-4" />
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {loading ? t("common.saving") : t("form.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}

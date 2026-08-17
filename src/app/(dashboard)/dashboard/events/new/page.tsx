"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import { Check, ArrowLeft } from "lucide-react";
import type { EventType, PackageTier } from "@/lib/types";
import { DEFAULT_EVENT_SETTINGS, PACKAGES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/lib/i18n/client";

export default function NewEventPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("wedding");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [coupleName1, setCoupleName1] = useState("");
  const [coupleName2, setCoupleName2] = useState("");
  const [description, setDescription] = useState("");
  const [packageTier, setPackageTier] = useState<PackageTier>("premium");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Πρέπει να είστε συνδεδεμένοι");
      setLoading(false);
      return;
    }

    const slug = generateSlug(title);

    const { data, error: insertError } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        slug,
        title,
        type,
        date,
        time: time || null,
        description: description || null,
        couple_name_1: coupleName1 || null,
        couple_name_2: coupleName2 || null,
        template: "classic",
        package_tier: packageTier,
        settings: DEFAULT_EVENT_SETTINGS,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push(`/dashboard/events/${data.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-8 tracking-tight">
        {t("form.createEvent")}
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
                placeholder="Ο Γάμος μας"
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
                    placeholder="Μαρία"
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
                    placeholder="Γιώργος"
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
                placeholder="Πείτε στους καλεσμένους σας για αυτή τη σημαντική μέρα..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">{t("form.choosePackage")}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.tier}
                  type="button"
                  onClick={() => setPackageTier(pkg.tier)}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    packageTier === pkg.tier
                      ? "border-primary bg-[var(--color-gold-50)] shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-heading font-semibold text-foreground">{pkg.name}</span>
                    <span className="text-lg font-heading font-bold text-primary">&euro;{pkg.price}</span>
                  </div>
                  <ul className="space-y-1">
                    {pkg.featureKeys.slice(0, 4).map((fk) => (
                      <li key={fk} className="text-xs text-muted-foreground flex items-start gap-1">
                        <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                        {t(fk as any)}
                      </li>
                    ))}
                    {pkg.featureKeys.length > 4 && (
                      <li className="text-xs text-primary font-medium">
                        +{pkg.featureKeys.length - 4} {t("more.features")}
                      </li>
                    )}
                  </ul>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            size="lg"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
            size="lg"
          >
            {loading ? t("form.creating") : t("form.createEvent")}
          </Button>
        </div>
      </form>
    </div>
  );
}

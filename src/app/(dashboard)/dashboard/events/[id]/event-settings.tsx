"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Event, EventSettings } from "@/lib/types";
import { Settings, Save } from "lucide-react";
import toast from "react-hot-toast";
import { getPackageLimits } from "@/lib/package-limits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/client";

export function EventSettingsEditor({ event }: { event: Event }) {
  const [settings, setSettings] = useState<EventSettings>(event.settings);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();
  const limits = getPackageLimits(event.package_tier);

  function update(partial: Partial<EventSettings>) {
    setSettings((s) => ({ ...s, ...partial }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("events")
      .update({ settings })
      .eq("id", event.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
          <Settings size={18} className="text-primary" />
          {t("settings.title")}
        </h2>

        {/* Section Toggles */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            {t("settings.visibleSections")}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "show_rsvp" as const, label: t("settings.rsvpForm") },
              { key: "show_map" as const, label: t("settings.locationsMap") },
              { key: "show_timeline" as const, label: t("settings.timeline"), requiresPremium: true },
              { key: "show_gallery" as const, label: t("settings.photoGallery"), requiresPremium: true },
              { key: "show_wishes" as const, label: t("settings.wishBook"), requiresPremium: true },
            ].map((item) => {
              const disabled = item.requiresPremium && !limits.hasTimeline;
              return (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Checkbox
                    checked={settings[item.key]}
                    disabled={disabled}
                    onCheckedChange={(checked) => update({ [item.key]: !!checked })}
                  />
                  <span className="text-sm text-foreground">
                    {item.label}
                    {disabled && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (Premium+)
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Plus Ones */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            {t("settings.plusOnes")}
          </h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={settings.allow_plus_ones}
                onCheckedChange={(checked) => update({ allow_plus_ones: !!checked })}
              />
              <span className="text-sm text-foreground">
                {t("settings.allowPlusOnes")}
              </span>
            </label>
            {settings.allow_plus_ones && (
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">{t("settings.max")}</Label>
                <select
                  value={settings.max_plus_ones}
                  onChange={(e) => update({ max_plus_ones: Number(e.target.value) })}
                  className="h-8 px-2 rounded-lg border border-input bg-background text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            {t("settings.colors")}
            {!limits.hasCustomColors && (
              <span className="text-xs text-muted-foreground ml-1 font-normal">
                (Premium+ to customize)
              </span>
            )}
          </h3>
          <div className="flex gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1">{t("settings.primary")}</Label>
              <input
                type="color"
                value={settings.primary_color}
                disabled={!limits.hasCustomColors}
                onChange={(e) => update({ primary_color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer border border-border disabled:opacity-50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">{t("settings.secondary")}</Label>
              <input
                type="color"
                value={settings.secondary_color}
                disabled={!limits.hasCustomColors}
                onChange={(e) => update({ secondary_color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer border border-border disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div className="space-y-2">
          <Label>{t("settings.customMessage")}</Label>
          <Textarea
            value={settings.custom_message || ""}
            onChange={(e) => update({ custom_message: e.target.value || null })}
            rows={2}
            placeholder={t("settings.customMessagePlaceholder")}
          />
        </div>

        {/* Save */}
        <Button onClick={save} disabled={saving}>
          <Save size={15} />
          {saving ? t("common.saving") : t("settings.saveSettings")}
        </Button>
      </CardContent>
    </Card>
  );
}

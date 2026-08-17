"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Guest, PackageTier } from "@/lib/types";
import { LayoutGrid, Save } from "lucide-react";
import toast from "react-hot-toast";
import { getPackageLimits } from "@/lib/package-limits";
import { UpgradePrompt } from "@/app/(dashboard)/components/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/client";

export function SeatingManager({
  eventId,
  initialGuests,
  packageTier,
}: {
  eventId: string;
  initialGuests: Guest[];
  packageTier: PackageTier;
}) {
  const confirmedGuests = initialGuests.filter(
    (g) => g.rsvp_status === "confirmed" || g.rsvp_status === "maybe"
  );
  const [guests, setGuests] = useState(confirmedGuests);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const { t } = useTranslation();
  const limits = getPackageLimits(packageTier);

  if (!limits.hasSeating) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2 mb-4">
            <LayoutGrid size={18} className="text-primary" />
            {t("seating.title")}
          </h2>
          <UpgradePrompt eventId={eventId} currentTier={packageTier} feature="table assignments" />
        </CardContent>
      </Card>
    );
  }

  function updateTableNumber(guestId: string, tableNumber: number | null) {
    setGuests(guests.map((g) => (g.id === guestId ? { ...g, table_number: tableNumber } : g)));
  }

  async function saveAll() {
    setSaving(true);
    let hasError = false;

    for (const guest of guests) {
      const { error } = await supabase
        .from("guests")
        .update({ table_number: guest.table_number })
        .eq("id", guest.id);
      if (error) hasError = true;
    }

    if (hasError) {
      toast.error("Some assignments failed to save");
    } else {
      toast.success("Table assignments saved");
    }
    setSaving(false);
  }

  const tables = new Map<number, Guest[]>();
  const unassigned: Guest[] = [];
  guests.forEach((g) => {
    if (g.table_number) {
      const existing = tables.get(g.table_number) || [];
      existing.push(g);
      tables.set(g.table_number, existing);
    } else {
      unassigned.push(g);
    }
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
            <LayoutGrid size={18} className="text-primary" />
            {t("seating.title")}
          </h2>
          <Button onClick={saveAll} disabled={saving}>
            <Save size={15} />
            {saving ? t("common.saving") : t("seating.saveAll")}
          </Button>
        </div>

        {guests.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            {t("seating.noGuests")}
          </p>
        ) : (
          <>
            {tables.size > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Array.from(tables.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([tableNum, tableGuests]) => (
                    <div
                      key={tableNum}
                      className="p-3 bg-muted rounded-lg border border-border"
                    >
                      <p className="text-xs font-medium text-primary mb-1">
                        {t("seating.table")} {tableNum}
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {tableGuests.reduce((sum, g) => sum + 1 + g.plus_ones, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tableGuests.length} guest{tableGuests.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            <div className="space-y-2">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {guest.name}
                      {guest.plus_ones > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{guest.plus_ones})
                        </span>
                      )}
                    </p>
                    {guest.group_name && (
                      <p className="text-xs text-muted-foreground">{guest.group_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">{t("seating.table")}:</label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={guest.table_number || ""}
                      onChange={(e) =>
                        updateTableNumber(
                          guest.id,
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      placeholder="-"
                      className="w-16 text-center h-8"
                    />
                  </div>
                </div>
              ))}
            </div>

            {unassigned.length > 0 && (
              <p className="text-xs text-amber-600 mt-3">
                {unassigned.length} {t("seating.unassigned")}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

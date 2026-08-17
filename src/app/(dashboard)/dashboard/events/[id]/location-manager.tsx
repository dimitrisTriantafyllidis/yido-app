"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventLocation, PackageTier } from "@/lib/types";
import { MapPin, Plus, Trash2, ExternalLink, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { canAddLocation, getPackageLimits } from "@/lib/package-limits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/client";

type LocationType = EventLocation["type"];

export function LocationManager({
  eventId,
  initialLocations,
  packageTier,
}: {
  eventId: string;
  initialLocations: EventLocation[];
  packageTier: PackageTier;
}) {
  const [locations, setLocations] = useState(initialLocations);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<LocationType>("reception");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { t } = useTranslation();
  const limits = getPackageLimits(packageTier);

  async function addLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!canAddLocation(packageTier, locations.length)) {
      toast.error(`Location limit reached (${limits.maxLocations}). Upgrade your package for more.`);
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("event_locations")
      .insert({
        event_id: eventId,
        name,
        address,
        type,
        time: time || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add location");
    } else if (data) {
      setLocations([...locations, data as EventLocation]);
      setName("");
      setAddress("");
      setType("reception");
      setTime("");
      setShowForm(false);
      toast.success(`${name} added`);
    }
    setLoading(false);
  }

  async function deleteLocation(id: string) {
    const loc = locations.find((l) => l.id === id);
    const { error } = await supabase.from("event_locations").delete().eq("id", id);

    if (error) {
      toast.error("Failed to remove location");
    } else {
      setLocations(locations.filter((l) => l.id !== id));
      toast.success(`${loc?.name || "Location"} removed`);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            {t("locations.title")} ({locations.length}{limits.maxLocations < Infinity ? `/${limits.maxLocations}` : ""})
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowForm(!showForm)}
            disabled={!canAddLocation(packageTier, locations.length) && !showForm}
          >
            <Plus size={15} />
            {showForm ? t("common.cancel") : t("locations.addLocation")}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={addLocation}
            className="mb-6 p-4 bg-muted rounded-lg space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LocationType)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <option value="ceremony">{t("locations.ceremony")}</option>
                <option value="reception">{t("locations.reception")}</option>
                <option value="party">{t("locations.party")}</option>
                <option value="other">{t("locations.other")}</option>
              </select>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time"
              />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t("locations.venueName")}
              />
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder={t("locations.address")}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? t("more.adding") : t("locations.addLocation")}
            </Button>
          </form>
        )}

        {locations.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            {t("locations.noLocations")}
          </p>
        ) : (
          <div className="space-y-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-start justify-between p-4 bg-muted rounded-lg border border-border"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize text-xs">
                      {loc.type}
                    </Badge>
                    {loc.time && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {loc.time}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-foreground mt-1">{loc.name}</p>
                  <p className="text-sm text-muted-foreground">{loc.address}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="link"
                    size="xs"
                    className="text-primary"
                    render={
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ExternalLink size={12} />
                    {t("locations.openMaps")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => deleteLocation(loc.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                    {t("common.remove")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

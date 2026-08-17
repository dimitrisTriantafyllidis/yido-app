"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Guest, PackageTier, RSVPStatus } from "@/lib/types";
import { Users, UserPlus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { canAddGuest, getPackageLimits } from "@/lib/package-limits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/client";

const RSVP_COLORS: Record<RSVPStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-700",
  maybe: "bg-blue-50 text-blue-700",
};

export function GuestList({
  eventId,
  initialGuests,
  packageTier,
}: {
  eventId: string;
  initialGuests: Guest[];
  packageTier: PackageTier;
}) {
  const [guests, setGuests] = useState(initialGuests);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { t } = useTranslation();
  const limits = getPackageLimits(packageTier);
  const maxGuests = limits.maxGuests;

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!canAddGuest(packageTier, guests.length)) {
      toast.error(`Guest limit reached (${maxGuests}). Upgrade your package for more.`);
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("guests")
      .insert({
        event_id: eventId,
        name,
        email: email || null,
        phone: phone || null,
        group_name: groupName || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add guest");
    } else if (data) {
      setGuests([data as Guest, ...guests]);
      setName("");
      setEmail("");
      setPhone("");
      setGroupName("");
      setShowForm(false);
      toast.success(`${name} added to guest list`);
    }
    setLoading(false);
  }

  async function updateRsvp(guestId: string, status: RSVPStatus) {
    const { error } = await supabase
      .from("guests")
      .update({ rsvp_status: status, responded_at: new Date().toISOString() })
      .eq("id", guestId);

    if (error) {
      toast.error("Failed to update RSVP status");
    } else {
      setGuests(guests.map((g) => (g.id === guestId ? { ...g, rsvp_status: status } : g)));
    }
  }

  async function deleteGuest(guestId: string) {
    const guest = guests.find((g) => g.id === guestId);
    const { error } = await supabase.from("guests").delete().eq("id", guestId);

    if (error) {
      toast.error("Failed to remove guest");
    } else {
      setGuests(guests.filter((g) => g.id !== guestId));
      toast.success(`${guest?.name || "Guest"} removed`);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
            <Users size={18} className="text-primary" />
            {t("guests.title")} ({guests.length}{maxGuests < Infinity ? `/${maxGuests}` : ""})
          </h2>
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <UserPlus size={15} />
            {showForm ? t("common.cancel") : t("guests.addGuest")}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={addGuest}
            className="mb-6 p-4 bg-muted rounded-lg space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t("guests.guestName")}
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("common.email")}
              />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("common.phone")}
              />
              <Input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={t("guests.groupPlaceholder")}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !canAddGuest(packageTier, guests.length)}
            >
              {loading ? t("more.adding") : t("guests.addGuest")}
            </Button>
          </form>
        )}

        {guests.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            {t("guests.noGuests")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("common.email")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("guests.group")}</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>+1s</TableHead>
                  <TableHead className="hidden md:table-cell">{t("guests.table")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{guest.email || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{guest.group_name || "-"}</TableCell>
                    <TableCell>
                      <select
                        value={guest.rsvp_status}
                        onChange={(e) => updateRsvp(guest.id, e.target.value as RSVPStatus)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${RSVP_COLORS[guest.rsvp_status]}`}
                      >
                        <option value="pending">{t("guests.rsvpPending")}</option>
                        <option value="confirmed">{t("guests.rsvpConfirmed")}</option>
                        <option value="declined">{t("guests.rsvpDeclined")}</option>
                        <option value="maybe">{t("guests.rsvpMaybe")}</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{guest.plus_ones}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{guest.table_number || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => deleteGuest(guest.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                        {t("common.remove")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

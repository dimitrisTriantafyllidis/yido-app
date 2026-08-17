"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { TimelineItem, PackageTier } from "@/lib/types";
import { Clock, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { getPackageLimits } from "@/lib/package-limits";
import { UpgradePrompt } from "@/app/(dashboard)/components/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/client";

export function TimelineManager({
  eventId,
  initialItems,
  packageTier,
}: {
  eventId: string;
  initialItems: TimelineItem[];
  packageTier: PackageTier;
}) {
  const [items, setItems] = useState(
    [...initialItems].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [showForm, setShowForm] = useState(false);
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();
  const limits = getPackageLimits(packageTier);

  if (!limits.hasTimeline) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2 mb-4">
            <Clock size={18} className="text-primary" />
            {t("timeline.title")}
          </h2>
          <UpgradePrompt eventId={eventId} currentTier={packageTier} feature="event timeline" />
        </CardContent>
      </Card>
    );
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const sortOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;

    const { data, error } = await supabase
      .from("timeline_items")
      .insert({
        event_id: eventId,
        time,
        title,
        description: description || null,
        icon: null,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add timeline item");
    } else if (data) {
      setItems([...items, data as TimelineItem]);
      setTime("");
      setTitle("");
      setDescription("");
      setShowForm(false);
      toast.success("Timeline item added");
      router.refresh();
    }
    setLoading(false);
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("timeline_items").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove item");
    } else {
      setItems(items.filter((i) => i.id !== id));
      toast.success("Timeline item removed");
      router.refresh();
    }
  }

  async function moveItem(id: string, direction: "up" | "down") {
    const index = items.findIndex((i) => i.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    )
      return;

    const newItems = [...items];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

    const updates = newItems.map((item, i) => ({ ...item, sort_order: i }));
    setItems(updates);

    for (const item of updates) {
      await supabase
        .from("timeline_items")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);
    }
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            {t("timeline.title")} ({items.length})
          </h2>
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus size={15} />
            {showForm ? t("common.cancel") : t("timeline.addItem")}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={addItem}
            className="mb-6 p-4 bg-muted rounded-lg space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder={t("timeline.titlePlaceholder")}
              />
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("timeline.descPlaceholder")}
                className="md:col-span-2"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? t("more.adding") : t("timeline.addItem")}
            </Button>
          </form>
        )}

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            {t("timeline.noItems")}
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
              >
                <div className="flex flex-col gap-0.5 text-muted-foreground">
                  <button
                    onClick={() => moveItem(item.id, "up")}
                    disabled={index === 0}
                    className="p-0.5 hover:text-foreground disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveItem(item.id, "down")}
                    disabled={index === items.length - 1}
                    className="p-0.5 hover:text-foreground disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <GripVertical size={14} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-primary w-14 shrink-0">
                  {item.time.slice(0, 5)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => deleteItem(item.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

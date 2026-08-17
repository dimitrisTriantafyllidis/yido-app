"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/types";
import { Copy, CheckCheck, Eye, EyeOff, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n/client";

export function EventActions({
  event,
  publicUrl,
}: {
  event: Event;
  publicUrl: string;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();

  async function togglePublish() {
    setLoading(true);
    const { error } = await supabase
      .from("events")
      .update({ is_published: !event.is_published })
      .eq("id", event.id);
    setLoading(false);

    if (error) {
      toast.error(t("error.somethingWrong"));
    } else {
      toast.success(event.is_published ? t("actions.unpublish") : t("actions.publish"));
      router.refresh();
    }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success(t("actions.copied"));
    setTimeout(() => setCopied(false), 2000);
  }

  async function deleteEvent() {
    setDeleting(true);
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    if (error) {
      toast.error(t("error.somethingWrong"));
      setDeleting(false);
    } else {
      toast.success(t("common.delete"));
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Primary action: Publish/Unpublish */}
      <Button
        onClick={togglePublish}
        disabled={loading}
        className={
          event.is_published
            ? "bg-amber-500 text-white hover:bg-amber-600"
            : ""
        }
      >
        {event.is_published ? (
          <>
            <EyeOff size={15} />
            {t("actions.unpublish")}
          </>
        ) : (
          <>
            <Eye size={15} />
            {t("actions.publish")}
          </>
        )}
      </Button>

      {/* Secondary actions */}
      <Button variant="outline" onClick={copyUrl}>
        {copied ? (
          <>
            <CheckCheck size={15} className="text-emerald-600" />
            {t("actions.copied")}
          </>
        ) : (
          <>
            <Copy size={15} />
            {t("actions.copyLink")}
          </>
        )}
      </Button>

      <Button variant="outline" render={<Link href={`/dashboard/events/${event.id}/edit`} />}>
        <Pencil size={15} />
        {t("common.edit")}
      </Button>

      {/* Destructive action: visually de-emphasized, tucked away in a dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger
          render={
            <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive px-2 py-1.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer" />
          }
        >
          <Trash2 size={13} />
          {t("common.delete")}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.deleteEvent")}</DialogTitle>
            <DialogDescription>
              {t("actions.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={deleteEvent}
              disabled={deleting}
            >
              {deleting ? t("actions.deleting") : t("actions.yesDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

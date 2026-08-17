"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/client";

export function CoverImageUpload({
  eventId,
  currentUrl,
}: {
  eventId: string;
  currentUrl: string | null;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop();
    const filePath = `${eventId}/cover.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("event-covers")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload image");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("event-covers")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("events")
      .update({ cover_image_url: publicUrl })
      .eq("id", eventId);

    if (updateError) {
      toast.error("Failed to update event");
    } else {
      setPreviewUrl(publicUrl);
      toast.success("Cover image uploaded!");
      router.refresh();
    }
    setUploading(false);
  }

  async function removeCover() {
    const { error } = await supabase
      .from("events")
      .update({ cover_image_url: null })
      .eq("id", eventId);

    if (error) {
      toast.error("Failed to remove cover image");
    } else {
      setPreviewUrl(null);
      toast.success("Cover image removed");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2 mb-4">
          <ImagePlus size={18} className="text-primary" />
          {t("cover.title")}
        </h2>

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Event cover"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={removeCover}
              className="absolute top-2 right-2 p-1.5 bg-card rounded-full border border-border shadow-sm hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
              title="Remove cover image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-36 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            <ImagePlus size={24} />
            <span className="text-sm font-medium">
              {uploading ? t("common.uploading") : t("cover.clickToUpload")}
            </span>
            <span className="text-xs">{t("cover.formatNote")}</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />

        {previewUrl && (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-3"
          >
            <ImagePlus size={15} />
            {uploading ? t("common.uploading") : t("cover.changeImage")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

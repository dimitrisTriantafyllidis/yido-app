"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { GalleryPhoto, PackageTier } from "@/lib/types";
import { Images, Upload, Trash2, Star, StarOff } from "lucide-react";
import toast from "react-hot-toast";
import { getPackageLimits, canAddPhoto } from "@/lib/package-limits";
import { UpgradePrompt } from "@/app/(dashboard)/components/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/client";

export function GalleryManager({
  eventId,
  initialPhotos,
  packageTier,
}: {
  eventId: string;
  initialPhotos: GalleryPhoto[];
  packageTier: PackageTier;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();
  const limits = getPackageLimits(packageTier);

  if (!limits.hasGallery) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2 mb-4">
            <Images size={18} className="text-primary" />
            {t("gallery.title")}
          </h2>
          <UpgradePrompt eventId={eventId} currentTier={packageTier} feature="photo gallery" />
        </CardContent>
      </Card>
    );
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploaded: GalleryPhoto[] = [];
    let count = photos.length;

    for (const file of Array.from(files)) {
      if (!canAddPhoto(packageTier, count)) {
        toast.error(`Photo limit reached (${limits.maxGalleryPhotos})`);
        break;
      }
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const ext = file.name.split(".").pop();
      const filePath = `${eventId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-gallery")
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("event-gallery")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("gallery_photos")
        .insert({
          event_id: eventId,
          uploaded_by: "host",
          url: publicUrl,
        })
        .select()
        .single();

      if (!error && data) {
        uploaded.push(data as GalleryPhoto);
        count++;
      }
    }

    if (uploaded.length > 0) {
      setPhotos([...uploaded, ...photos]);
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} uploaded`);
      router.refresh();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function deletePhoto(id: string) {
    const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete photo");
    } else {
      setPhotos(photos.filter((p) => p.id !== id));
      toast.success("Photo deleted");
      router.refresh();
    }
  }

  async function toggleFeatured(id: string, currentValue: boolean) {
    const { error } = await supabase
      .from("gallery_photos")
      .update({ is_featured: !currentValue })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update photo");
    } else {
      setPhotos(photos.map((p) => (p.id === id ? { ...p, is_featured: !currentValue } : p)));
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
            <Images size={18} className="text-primary" />
            {t("gallery.title")} ({photos.length}
            {limits.maxGalleryPhotos < Infinity ? `/${limits.maxGalleryPhotos}` : ""})
          </h2>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !canAddPhoto(packageTier, photos.length)}
          >
            <Upload size={15} />
            {uploading ? t("common.uploading") : t("gallery.uploadPhotos")}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />

        {photos.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-36 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            <Images size={24} />
            <span className="text-sm font-medium">{t("gallery.uploadPhotos")}</span>
            <span className="text-xs">JPG, PNG, WebP (max 10MB each)</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Gallery photo"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => toggleFeatured(photo.id, photo.is_featured)}
                    className="p-2 bg-white/90 rounded-full text-amber-500 hover:text-amber-600 cursor-pointer"
                    title={photo.is_featured ? "Unfeature" : "Feature"}
                  >
                    {photo.is_featured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                  </button>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="p-2 bg-white/90 rounded-full text-red-500 hover:text-red-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {photo.is_featured && (
                  <Badge className="absolute top-1.5 left-1.5 bg-amber-100 text-amber-700 text-xs">
                    {t("gallery.featured")}
                  </Badge>
                )}
                {photo.uploaded_by && photo.uploaded_by !== "host" && (
                  <span className="absolute bottom-1.5 left-1.5 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">
                    by {photo.uploaded_by}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

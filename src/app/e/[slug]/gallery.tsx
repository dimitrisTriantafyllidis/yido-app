"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryPhoto } from "@/lib/types";
import { Camera, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/client";

export function PublicGallery({
  eventId,
  initialPhotos,
  primaryColor,
}: {
  eventId: string;
  initialPhotos: GalleryPhoto[];
  primaryColor: string;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const supabase = createClient();

  async function handleGuestUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!guestName.trim()) {
      toast.error("Please enter your name first");
      return;
    }

    setUploading(true);
    const uploaded: GalleryPhoto[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const ext = file.name.split(".").pop();
      const filePath = `${eventId}/guest-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-gallery")
        .upload(filePath, file);

      if (uploadError) continue;

      const { data: { publicUrl } } = supabase.storage
        .from("event-gallery")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("gallery_photos")
        .insert({
          event_id: eventId,
          uploaded_by: guestName.trim(),
          url: publicUrl,
        })
        .select()
        .single();

      if (!error && data) {
        uploaded.push(data as GalleryPhoto);
      }
    }

    if (uploaded.length > 0) {
      setPhotos([...uploaded, ...photos]);
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} uploaded!`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      {/* Guest upload */}
      <div className="mb-6">
        {!showUpload ? (
          <button
            onClick={() => setShowUpload(true)}
            className="w-full py-3 px-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Camera size={18} />
            {t("gallery.sharePhotos")}
          </button>
        ) : (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <Input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={t("gallery.yourName")}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !guestName.trim()}
                className="flex-1"
                style={{ backgroundColor: primaryColor }}
              >
                <Upload size={15} />
                {uploading ? t("common.uploading") : t("gallery.selectPhotos")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpload(false)}
              >
                {t("common.cancel")}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGuestUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <motion.button
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => setSelectedPhoto(photo)}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            >
              <img
                src={photo.url}
                alt={photo.caption || "Event photo"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {photo.is_featured && (
                <span className="absolute top-2 left-2 text-xs bg-white/80 px-2 py-0.5 rounded-full font-medium">
                  {t("gallery.featured")}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-sm py-6">
          {t("gallery.noPhotos")}
        </p>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || "Event photo"}
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {(selectedPhoto.caption || selectedPhoto.uploaded_by) && (
              <div className="absolute bottom-8 text-center text-white">
                {selectedPhoto.caption && <p>{selectedPhoto.caption}</p>}
                {selectedPhoto.uploaded_by && (
                  <p className="text-sm text-white/60 mt-1">
                    by {selectedPhoto.uploaded_by}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

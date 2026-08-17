"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FileText, Upload, Trash2, Download } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/client";

export function DocumentUpload({
  eventId,
  invitationUrl,
  agendaUrl,
}: {
  eventId: string;
  invitationUrl: string | null;
  agendaUrl: string | null;
}) {
  const [invitation, setInvitation] = useState(invitationUrl);
  const [agenda, setAgenda] = useState(agendaUrl);
  const [uploading, setUploading] = useState<"invitation" | "agenda" | null>(null);
  const invRef = useRef<HTMLInputElement>(null);
  const agendaRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();

  async function handleUpload(
    file: File,
    type: "invitation" | "agenda"
  ) {
    if (!file.type.includes("pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    setUploading(type);
    const filePath = `${eventId}/${type}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("event-documents")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("event-documents")
      .getPublicUrl(filePath);

    const field = type === "invitation" ? "invitation_pdf_url" : "agenda_pdf_url";
    const { error: updateError } = await supabase
      .from("events")
      .update({ [field]: publicUrl })
      .eq("id", eventId);

    if (updateError) {
      toast.error("Failed to save");
    } else {
      if (type === "invitation") setInvitation(publicUrl);
      else setAgenda(publicUrl);
      toast.success(t("documents.title") + " uploaded!");
      router.refresh();
    }
    setUploading(null);
  }

  async function removePdf(type: "invitation" | "agenda") {
    const field = type === "invitation" ? "invitation_pdf_url" : "agenda_pdf_url";
    const { error } = await supabase
      .from("events")
      .update({ [field]: null })
      .eq("id", eventId);

    if (error) {
      toast.error("Failed to remove");
    } else {
      if (type === "invitation") setInvitation(null);
      else setAgenda(null);
      toast.success("Removed");
      router.refresh();
    }
  }

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground inline-flex items-center gap-2 mb-4">
          <FileText size={18} className="text-primary" />
          {t("documents.title")}
        </h2>

        <div className="space-y-4">
          {/* Invitation PDF */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground mb-1">{t("documents.invitation")}</p>
            <p className="text-xs text-muted-foreground mb-3">{t("documents.invitationDesc")}</p>
            {invitation ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<a href={invitation} target="_blank" rel="noopener noreferrer" />}
                >
                  <FileText size={14} />
                  {t("documents.viewPdf")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={<a href={invitation} download />}
                >
                  <Download size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePdf("invitation")}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => invRef.current?.click()}
                disabled={uploading === "invitation"}
              >
                <Upload size={14} />
                {uploading === "invitation" ? t("common.uploading") : t("documents.uploadPdf")}
              </Button>
            )}
            <input
              ref={invRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f, "invitation");
                e.target.value = "";
              }}
              className="hidden"
            />
          </div>

          {/* Agenda PDF */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground mb-1">{t("documents.agenda")}</p>
            <p className="text-xs text-muted-foreground mb-3">{t("documents.agendaDesc")}</p>
            {agenda ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<a href={agenda} target="_blank" rel="noopener noreferrer" />}
                >
                  <FileText size={14} />
                  {t("documents.viewPdf")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={<a href={agenda} download />}
                >
                  <Download size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePdf("agenda")}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => agendaRef.current?.click()}
                disabled={uploading === "agenda"}
              >
                <Upload size={14} />
                {uploading === "agenda" ? t("common.uploading") : t("documents.uploadPdf")}
              </Button>
            )}
            <input
              ref={agendaRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f, "agenda");
                e.target.value = "";
              }}
              className="hidden"
            />
          </div>

          <p className="text-xs text-muted-foreground">{t("documents.maxSize")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Clock, Images, Settings, LayoutDashboard, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

export function EventTabs({
  details,
  guests,
  timeline,
  gallery,
  documents,
  settings,
}: {
  details: React.ReactNode;
  guests: React.ReactNode;
  timeline: React.ReactNode;
  gallery: React.ReactNode;
  documents: React.ReactNode;
  settings: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="details">
      <TabsList variant="line" className="w-full justify-start border-b border-border">
        <TabsTrigger value="details">
          <LayoutDashboard size={14} />
          {t("tabs.details")}
        </TabsTrigger>
        <TabsTrigger value="guests">
          <Users size={14} />
          {t("tabs.guests")}
        </TabsTrigger>
        <TabsTrigger value="timeline">
          <Clock size={14} />
          {t("tabs.timeline")}
        </TabsTrigger>
        <TabsTrigger value="gallery">
          <Images size={14} />
          {t("tabs.gallery")}
        </TabsTrigger>
        <TabsTrigger value="documents">
          <FileText size={14} />
          {t("tabs.documents")}
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings size={14} />
          {t("tabs.settings")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6 pt-6">
        {details}
      </TabsContent>
      <TabsContent value="guests" className="space-y-6 pt-6">
        {guests}
      </TabsContent>
      <TabsContent value="timeline" className="space-y-6 pt-6">
        {timeline}
      </TabsContent>
      <TabsContent value="gallery" className="space-y-6 pt-6">
        {gallery}
      </TabsContent>
      <TabsContent value="documents" className="space-y-6 pt-6">
        {documents}
      </TabsContent>
      <TabsContent value="settings" className="space-y-6 pt-6">
        {settings}
      </TabsContent>
    </Tabs>
  );
}

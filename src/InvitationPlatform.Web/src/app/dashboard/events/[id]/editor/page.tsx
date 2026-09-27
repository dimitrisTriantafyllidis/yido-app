"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardIcon } from "@/components/dashboard/dashboard-icons";
import { WeddingTemplateEditor } from "@/components/invitations/WeddingTemplateEditor";
import { isWeddingStyleId } from "@/components/invitations/types";
import type { InvitationPerson } from "@/components/invitations/types";
import {
  PersonsEditor,
  QuizQuestionsEditor,
  VendorsEditor,
  WishesInbox,
} from "@/components/invitations/ExtraSectionEditors";
import {
  parseQuizQuestions,
  parseVendors,
  type GuestWishItem,
  type QuizQuestionConfig,
  type VendorConfig,
} from "@/components/invitations/extra-section-config";
import { TemplatePreviewImage } from "@/components/templates/template-preview";
import { api } from "@/lib/api";

interface ThemeData {
  id: string;
  name: string;
  displayFontFamily: string;
  bodyFontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  surfaceColor: string;
  borderRadius: string;
}

interface SectionData {
  id: string;
  sectionType: string;
  sortOrder: number;
  isEnabled: boolean;
  configurationJson: string | null;
}

interface InvitationData {
  id: string;
  eventId: string;
  versionNumber: number;
  isPublished: boolean;
  publishedAt: string | null;
  template: { id: string; name: string; eventType: string; category?: string | null };
  theme: ThemeData | null;
  sections: SectionData[];
}

interface TemplateListItem {
  id: string;
  name: string;
  description: string;
  eventType: string;
  category: string;
  previewImageUrl?: string | null;
  isPremium: boolean;
  sectionCount: number;
}

interface ThemeListItem {
  id: string;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  isPremium: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  Wedding: "Γάμος",
  Baptism: "Βάπτιση",
  Party: "Γενέθλια / Πάρτι",
  Engagement: "Αρραβώνας",
  Corporate: "Εταιρική",
  Custom: "Άλλο",
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Κεντρική εικόνα",
  welcome_text: "Καλωσόρισμα",
  event_details: "Λεπτομέρειες",
  countdown: "Αντίστροφη μέτρηση",
  venue: "Τοποθεσία",
  participants: "Πρόσωπα",
  gallery: "Φωτογραφίες",
  rsvp: "RSVP",
  gift_list: "Δώρα",
  video: "Βίντεο",
  audio: "Μουσική",
  footer: "Υποσέλιδο",
  quiz: "Κουίζ",
  wishes: "Ευχές",
  vendors: "Συνεργάτες",
};

export default function EditorPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsTemplate, setNeedsTemplate] = useState(false);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(
    null
  );
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [eventType, setEventType] = useState<string | null>(null);

  const loadInvitation = useCallback(async () => {
    try {
      const data = await api<InvitationData>(
        `/api/v1/events/${eventId}/invitation`
      );
      setInvitation(data);
      if (data.sections.length > 0 && !selectedSection) {
        setSelectedSection(data.sections[0]);
      }
    } catch {
      setNeedsTemplate(true);
    } finally {
      setLoading(false);
    }
  }, [eventId, selectedSection]);

  useEffect(() => {
    loadInvitation();
  }, [loadInvitation]);

  useEffect(() => {
    api<{ eventType: string }>(`/api/v1/events/${eventId}`)
      .then((e) => setEventType(e.eventType))
      .catch(() => setEventType(null));
  }, [eventId]);

  useEffect(() => {
    if (needsTemplate) {
      const qs = eventType ? `?eventType=${encodeURIComponent(eventType)}` : "";
      api<TemplateListItem[]>(`/api/v1/templates${qs}`).then(setTemplates);
    }
  }, [needsTemplate, eventType]);

  const loadThemes = async () => {
    const data = await api<ThemeListItem[]>("/api/v1/templates/themes");
    setThemes(data);
  };

  const selectTemplate = async (templateId: string) => {
    const data = await api<InvitationData>(
      `/api/v1/events/${eventId}/invitation`,
      {
        method: "POST",
        body: JSON.stringify({ templateId }),
      }
    );
    setInvitation(data);
    setNeedsTemplate(false);
    if (data.sections.length > 0) {
      setSelectedSection(data.sections[0]);
    }
  };

  const changeTheme = async (themeId: string) => {
    await api(`/api/v1/events/${eventId}/invitation/theme`, {
      method: "PATCH",
      body: JSON.stringify({ themeId }),
    });
    loadInvitation();
  };

  const changeTemplate = async (templateId: string) => {
    if (!confirm("Η αλλαγή προτύπου θα αντικαταστήσει τις τρέχουσες ενότητες. Θέλετε να συνεχίσετε;")) {
      return;
    }
    await api(`/api/v1/events/${eventId}/invitation/template`, {
      method: "PATCH",
      body: JSON.stringify({ templateId }),
    });
    loadInvitation();
  };

  const loadTemplates = async () => {
    const qs = eventType ? `?eventType=${encodeURIComponent(eventType)}` : "";
    const data = await api<TemplateListItem[]>(`/api/v1/templates${qs}`);
    setTemplates(data);
  };

  const toggleSection = async (section: SectionData) => {
    const updated = await api<SectionData>(
      `/api/v1/events/${eventId}/invitation/sections/${section.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ isEnabled: !section.isEnabled }),
      }
    );
    setInvitation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === section.id ? { ...s, isEnabled: updated.isEnabled } : s
        ),
      };
    });
  };

  const updateSectionConfig = async (
    sectionId: string,
    configurationJson: string
  ) => {
    setSaving(true);
    setSaved(false);
    await api(`/api/v1/events/${eventId}/invitation/sections/${sectionId}`, {
      method: "PUT",
      body: JSON.stringify({ configurationJson }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Update local state
    setInvitation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? { ...s, configurationJson } : s
        ),
      };
    });
    setSelectedSection((prev) =>
      prev?.id === sectionId ? { ...prev, configurationJson } : prev
    );
  };

  const publishInvitation = async () => {
    const result = await api<{ slug: string }>(
      `/api/v1/events/${eventId}/invitation/publish`,
      { method: "POST" }
    );
    setPublishedSlug(result.slug);
    loadInvitation();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6]">
        <div className="size-8 animate-spin rounded-full border-2 border-[#C4993D] border-t-transparent" />
      </div>
    );
  }

  // Template selection screen
  if (needsTemplate) {
    return (
      <main className="flex flex-col gap-8 px-4 py-8 pb-12 sm:px-6 md:px-12 md:py-10">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#C4993D] hover:text-[#A87D2C]"
        >
          <DashboardIcon name="arrow-left" className="size-3.5" />
          Πίσω στην εκδήλωση
        </Link>
        <div>
          <h1 className="font-display text-[28px] text-[#1C1516] sm:text-[32px]">Επιλέξτε πρότυπο</h1>
          <p className="mt-1 text-sm text-[#6E6263]">
            Διαλέξτε ένα πρότυπο για την πρόσκλησή σας
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTemplate(t.id)}
              className="cursor-pointer rounded-xl border border-[#EDE8E3] bg-white p-4 text-left transition-all hover:border-[#C4993D]/40 hover:shadow-sm sm:p-6"
            >
              <TemplatePreviewImage
                category={t.category}
                name={t.name}
                remoteUrl={t.previewImageUrl}
                className="mb-4 h-40 w-full rounded-lg"
              />
              <h3 className="font-display text-lg text-[#1C1516]">{t.name}</h3>
              <p className="mt-1 text-sm text-[#6E6263]">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#9C9293]">
                <span>{EVENT_TYPE_LABELS[t.eventType] ?? t.eventType}</span>
                <span>{t.sectionCount} ενότητες</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (!invitation) return null;

  const weddingCategory = invitation.template.category;
  if (isWeddingStyleId(weddingCategory)) {
    return (
      <WeddingTemplateEditor
        eventId={eventId}
        invitation={invitation}
        styleId={weddingCategory}
        onInvitationChange={(next) => setInvitation(next)}
      />
    );
  }

  const enabledSections = invitation.sections.filter((s) => s.isEnabled);

  const previewContent = (
    <div
      className={`overflow-hidden transition-all ${
        previewMode === "mobile" ? "w-full" : "w-full max-w-3xl rounded-xl border border-[#EDE8E3] shadow-sm"
      }`}
      style={
        invitation.theme
          ? ({
              fontFamily: `${invitation.theme.bodyFontFamily}, sans-serif`,
              backgroundColor: invitation.theme.backgroundColor,
              color: invitation.theme.textColor,
            } as React.CSSProperties)
          : {}
      }
    >
      {enabledSections.map((section) => (
        <SectionPreview
          key={section.id}
          section={section}
          theme={invitation.theme}
          isSelected={selectedSection?.id === section.id}
          onClick={() => setSelectedSection(section)}
        />
      ))}
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-[#F9F8F6] lg:h-dvh">
      <header className="flex shrink-0 flex-col gap-3 border-b border-[#EDE8E3] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="text-sm font-medium text-[#9C9293] transition-colors hover:text-[#1C1516]"
          >
            ← Πίσω
          </Link>
          <span className="hidden h-4 w-px bg-[#EDE8E3] sm:block" aria-hidden />
          <h1 className="truncate font-display text-lg text-[#1C1516] sm:text-xl">
            {invitation.template.name}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              invitation.isPublished
                ? "bg-[#E3F3EA] text-[#1B5E3A]"
                : "bg-[#FDF2F2] text-[#C43D41]"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                invitation.isPublished ? "bg-[#1B5E3A]" : "bg-[#C43D41]"
              }`}
              aria-hidden
            />
            {invitation.isPublished ? "Published" : "Draft"}
          </span>
          {saving ? (
            <span className="text-xs text-[#9C9293]">Αποθήκευση...</span>
          ) : null}
          {saved ? (
            <span className="text-xs font-medium text-[#1B5E3A]">Αποθηκεύτηκε</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {publishedSlug ? (
            <Link
              href={`/e/${publishedSlug}`}
              target="_blank"
              className="rounded-md border border-[#EDE8E3] px-3 py-2 text-[13px] font-semibold text-[#6E6263] transition-colors hover:text-[#1C1516] sm:px-4"
            >
              Άνοιγμα
            </Link>
          ) : null}
          {!invitation.isPublished ? (
            <button
              type="button"
              onClick={publishInvitation}
              className="rounded-md bg-[#C4993D] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#B38935]"
            >
              Δημοσίευση
            </button>
          ) : (
            <button
              type="button"
              onClick={publishInvitation}
              className="rounded-md border border-[#C4993D] px-4 py-2 text-[13px] font-semibold text-[#C4993D] transition-colors hover:bg-[#C4993D]/5"
            >
              Ανανέωση δημοσίευσης
            </button>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="flex max-h-[42vh] w-full shrink-0 flex-col gap-5 overflow-y-auto border-b border-[#EDE8E3] bg-white p-4 lg:max-h-none lg:w-[240px] lg:border-b-0 lg:border-r lg:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9C9293]">
            Ενότητες πρόσκλησης
          </p>

          <div className="flex flex-col gap-0.5">
            {invitation.sections.map((section) => {
              const isSelected = selectedSection?.id === section.id;
              const label =
                SECTION_LABELS[section.sectionType] ?? section.sectionType;

              return (
                <div
                  key={section.id}
                  className={`flex items-center justify-between rounded-md px-2.5 py-2 ${
                    isSelected ? "bg-[#F9F8F6]" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSection(section)}
                    className={`flex-1 text-left text-[13px] transition-colors ${
                      isSelected
                        ? "font-semibold text-[#1C1516]"
                        : section.isEnabled
                          ? "font-medium text-[#6E6263] hover:text-[#1C1516]"
                          : "font-medium text-[#9C9293] hover:text-[#6E6263]"
                    }`}
                  >
                    {label}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSection(section)}
                    className="ml-2 shrink-0 p-0.5"
                    aria-label={section.isEnabled ? `Απενεργοποίηση ${label}` : `Ενεργοποίηση ${label}`}
                  >
                    {section.isEnabled ? (
                      <DashboardIcon name="check" className="size-3.5 text-[#C4993D]" />
                    ) : (
                      <span className="inline-block size-3.5" aria-hidden />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="h-px bg-[#EDE8E3]" />

          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9C9293]">
              Θέμα πρόσκλησης
            </p>
            <div className="relative">
              <select
                value={invitation.theme?.id ?? ""}
                onFocus={() => {
                  if (themes.length === 0) loadThemes();
                }}
                onChange={(e) => {
                  if (e.target.value) changeTheme(e.target.value);
                }}
                className="w-full appearance-none rounded-md border border-[#EDE8E3] bg-white px-3 py-2 pr-8 text-[13px] font-medium text-[#1C1516] outline-none focus:border-[#C4993D] focus:ring-1 focus:ring-[#C4993D]"
              >
                <option value="" disabled>
                  {invitation.theme?.name ?? "Επιλογή θέματος"}
                </option>
                {(themes.length > 0 ? themes : invitation.theme ? [{
                  id: invitation.theme.id,
                  name: invitation.theme.name,
                  primaryColor: invitation.theme.primaryColor,
                  backgroundColor: invitation.theme.backgroundColor,
                  accentColor: invitation.theme.accentColor,
                  isPremium: false,
                }] : []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <DashboardIcon
                name="chevron-down"
                className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-[#9C9293]"
              />
            </div>
          </div>

          <div className="h-px bg-[#EDE8E3]" />

          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9C9293]">
              Πρότυπο πρόσκλησης
            </p>
            <div className="relative">
              <select
                value={invitation.template.id}
                onFocus={() => {
                  if (templates.length === 0) loadTemplates();
                }}
                onChange={(e) => {
                  if (e.target.value && e.target.value !== invitation.template.id) {
                    changeTemplate(e.target.value);
                  }
                }}
                className="w-full appearance-none rounded-md border border-[#EDE8E3] bg-white px-3 py-2 pr-8 text-[13px] font-medium text-[#1C1516] outline-none focus:border-[#C4993D] focus:ring-1 focus:ring-[#C4993D]"
              >
                <option value={invitation.template.id}>
                  {invitation.template.name}
                </option>
                {templates
                  .filter((t) => t.id !== invitation.template.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.isPremium ? "⭐" : ""}
                    </option>
                  ))}
              </select>
              <DashboardIcon
                name="chevron-down"
                className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-[#9C9293]"
              />
            </div>
            <p className="text-[10px] text-[#9C9293]">
              Η αλλαγή θα επαναφέρει τις ενότητες στις προεπιλογές
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col items-center overflow-y-auto px-4 pb-12 pt-6 md:px-6 md:pt-8">
          <div className="mb-5 flex rounded-lg bg-[#EDE8E3] p-0.5">
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                previewMode === "mobile"
                  ? "bg-white font-semibold text-[#1C1516] shadow-sm"
                  : "font-medium text-[#6E6263]"
              }`}
            >
              Κινητό
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                previewMode === "desktop"
                  ? "bg-white font-semibold text-[#1C1516] shadow-sm"
                  : "font-medium text-[#6E6263]"
              }`}
            >
              Υπολογιστής
            </button>
          </div>

          {previewMode === "mobile" ? (
            <div className="h-[520px] w-[300px] shrink-0 rounded-[36px] border-8 border-[#1C1516] bg-white p-2 shadow-[0_16px_16px_rgba(28,21,22,0.02)]">
              <div className="size-full overflow-hidden rounded-[26px]">{previewContent}</div>
            </div>
          ) : (
            previewContent
          )}
        </div>

        {selectedSection ? (
          <aside className="flex w-[320px] shrink-0 flex-col overflow-y-auto border-l border-[#EDE8E3] bg-white p-7">
            <div className="mb-6 flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-wide text-[#9C9293]">
                Ρύθμιση ενότητας
              </p>
              <h2 className="font-display text-2xl text-[#1C1516]">
                {SECTION_LABELS[selectedSection.sectionType] ??
                  selectedSection.sectionType}
              </h2>
            </div>
            <SectionEditor
              eventId={eventId}
              section={selectedSection}
              onSave={(json) => updateSectionConfig(selectedSection.id, json)}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function SectionPreview({
  section,
  theme,
  isSelected,
  onClick,
}: {
  section: SectionData;
  theme: ThemeData | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = section.configurationJson
    ? JSON.parse(section.configurationJson)
    : {};

  const primaryColor = theme?.primaryColor ?? "#2E5A4C";
  const accentColor = theme?.accentColor ?? "#2E5A4C";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-[#C4993D] ring-inset"
          : "hover:ring-1 hover:ring-[#C4993D]/30 hover:ring-inset"
      }`}
    >
      {section.sectionType === "hero" && (
        <div
          className="relative h-64 flex flex-col items-center justify-center text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <h2
            className="text-3xl font-bold"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
            }}
          >
            {config.title || "Τίτλος"}
          </h2>
          <p className="mt-2 text-sm opacity-80">
            {config.subtitle || "Υπότιτλος"}
          </p>
        </div>
      )}

      {section.sectionType === "welcome_text" && (
        <div className="px-8 py-10 text-center">
          <h3
            className="text-xl font-semibold mb-3"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "Καλωσήρθατε"}
          </h3>
          <p className="text-sm leading-relaxed opacity-80">
            {config.text || "Κείμενο καλωσορίσματος..."}
          </p>
        </div>
      )}

      {section.sectionType === "event_details" && (
        <div className="px-8 py-8 text-center" style={{ backgroundColor: theme?.surfaceColor }}>
          <h3
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "Λεπτομέρειες"}
          </h3>
          <div className="text-sm opacity-70">
            Ημερομηνία και ώρα εκδήλωσης
          </div>
        </div>
      )}

      {section.sectionType === "countdown" && (
        <div className="px-8 py-8 text-center">
          <h3
            className="text-lg font-semibold mb-4"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "Αντίστροφη μέτρηση"}
          </h3>
          <div className="flex justify-center gap-4">
            {["Ημέρες", "Ώρες", "Λεπτά"].map((label) => (
              <div key={label} className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: accentColor }}
                >
                  --
                </div>
                <div className="text-xs opacity-60 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section.sectionType === "venue" && (
        <div className="px-8 py-8" style={{ backgroundColor: theme?.surfaceColor }}>
          <h3
            className="text-xl font-semibold mb-4 text-center"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "Τοποθεσία"}
          </h3>
          <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
            Χάρτης τοποθεσιών
          </div>
        </div>
      )}

      {section.sectionType === "participants" && (
        <div className="px-8 py-8 text-center">
          <h3
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "Πρόσωπα"}
          </h3>
          <div className="flex justify-center gap-8">
            {["Νύφη", "Γαμπρός"].map((role) => (
              <div key={role} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-2" />
                <div className="text-xs opacity-60">{role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section.sectionType === "gallery" && (
        <div className="px-8 py-8">
          <h3
            className="text-xl font-semibold mb-4 text-center"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "Φωτογραφίες"}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {section.sectionType === "rsvp" && (
        <div className="px-8 py-8 text-center" style={{ backgroundColor: theme?.surfaceColor }}>
          <h3
            className="text-xl font-semibold mb-2"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "RSVP"}
          </h3>
          <p className="text-sm opacity-70 mb-4">
            {config.description || "Παρακαλούμε απαντήστε"}
          </p>
          <div
            className="inline-block px-6 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: accentColor }}
          >
            Απάντηση
          </div>
        </div>
      )}

      {section.sectionType === "gift_list" && (
        <div className="px-8 py-8 text-center">
          <h3
            className="text-xl font-semibold mb-2"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "Δώρα"}
          </h3>
        </div>
      )}

      {section.sectionType === "video" && (
        <div className="px-8 py-8">
          <h3
            className="text-xl font-semibold mb-4 text-center"
            style={{
              fontFamily: theme?.displayFontFamily ?? "serif",
              color: primaryColor,
            }}
          >
            {config.heading || "Βίντεο"}
          </h3>
          <div className="h-40 bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
            </div>
          </div>
        </div>
      )}

      {section.sectionType === "footer" && (
        <div
          className="px-8 py-6 text-center text-sm opacity-60"
          style={{ backgroundColor: primaryColor, color: "white" }}
        >
          {config.text || "Υποσέλιδο"}
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  eventId,
  section,
  onSave,
}: {
  eventId: string;
  section: SectionData;
  onSave: (json: string) => void;
}) {
  const config = section.configurationJson
    ? JSON.parse(section.configurationJson)
    : {};

  const [fields, setFields] = useState<Record<string, unknown>>(config);

  // Reset fields when section changes
  useEffect(() => {
    setFields(
      section.configurationJson
        ? JSON.parse(section.configurationJson)
        : {}
    );
  }, [section.id, section.configurationJson]);

  const update = (key: string, value: unknown) => {
    const next = { ...fields, [key]: value };
    setFields(next);
  };

  const save = () => onSave(JSON.stringify(fields));

  const inputClass =
    "w-full rounded-md border border-[#EDE8E3] bg-white px-3 py-2 text-[13px] text-[#1C1516] outline-none transition-colors focus:border-[#C4993D] focus:ring-1 focus:ring-[#C4993D]";
  const labelClass = "mb-1.5 block text-xs font-semibold text-[#6E6263]";

  return (
    <div className="flex flex-col gap-4">
      {section.sectionType !== "hero" && section.sectionType !== "footer" && (
        <>
          <div>
            <label className={labelClass}>
              Μικρή ετικέτα
            </label>
            <input
              type="text"
              value={(fields.label as string) ?? ""}
              onChange={(e) => update("label", e.target.value)}
              className={inputClass}
              placeholder="π.χ. Τοποθεσίες"
            />
          </div>
          <div>
            <label className={labelClass}>
              Επικεφαλίδα
            </label>
            <input
              type="text"
              value={(fields.heading as string) ?? ""}
              onChange={(e) => update("heading", e.target.value)}
              className={inputClass}
            />
          </div>
        </>
      )}

      {/* Hero section */}
      {section.sectionType === "hero" && (
        <>
          <div>
            <label className={labelClass}>Τίτλος Πρόσκλησης</label>
            <input
              type="text"
              value={(fields.title as string) ?? ""}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Υπότιτλος / Κάλεσμα</label>
            <input
              type="text"
              value={(fields.subtitle as string) ?? ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#6E6263]">
                Διαφάνεια overlay
              </label>
              <span className="text-xs font-semibold text-[#1C1516]">
                {Math.round(((fields.overlayOpacity as number) ?? 0.3) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={(fields.overlayOpacity as number) ?? 0.3}
              onChange={(e) =>
                update("overlayOpacity", parseFloat(e.target.value))
              }
              className="w-full accent-[#C4993D]"
            />
          </div>
        </>
      )}

      {/* Event details */}
      {section.sectionType === "event_details" && (
        <>
          <div>
            <label className={labelClass}>
              Ενδυμασία
            </label>
            <input
              type="text"
              value={(fields.dressCode as string) ?? ""}
              onChange={(e) => update("dressCode", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Ετικέτα ημερομηνίας
            </label>
            <input
              type="text"
              value={(fields.dateLabel as string) ?? ""}
              onChange={(e) => update("dateLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Ετικέτα ώρας
            </label>
            <input
              type="text"
              value={(fields.timeLabel as string) ?? ""}
              onChange={(e) => update("timeLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Ετικέτα ενδυμασίας
            </label>
            <input
              type="text"
              value={(fields.attireLabel as string) ?? ""}
              onChange={(e) => update("attireLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Υπότιτλος ενδυμασίας
            </label>
            <input
              type="text"
              value={(fields.attireSub as string) ?? ""}
              onChange={(e) => update("attireSub", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Σύνδεσμος χάρτη
            </label>
            <input
              type="text"
              value={(fields.mapsLabel as string) ?? ""}
              onChange={(e) => update("mapsLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={(fields.showPrintedCard as boolean) ?? false}
              onChange={(e) => update("showPrintedCard", e.target.checked)}
              className="rounded border-border accent-accent"
            />
            Έντυπη πρόσκληση
          </label>
          {(fields.showPrintedCard as boolean) && (
            <>
              <div>
                <label className={labelClass}>
                  Ετικέτα έντυπης
                </label>
                <input
                  type="text"
                  value={(fields.paperLabel as string) ?? ""}
                  onChange={(e) => update("paperLabel", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Τίτλος έντυπης
                </label>
                <input
                  type="text"
                  value={(fields.paperHeading as string) ?? ""}
                  onChange={(e) => update("paperHeading", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Τύπος εκδήλωσης στην κάρτα
                </label>
                <input
                  type="text"
                  value={(fields.paperEventType as string) ?? ""}
                  onChange={(e) => update("paperEventType", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Γραμμή πρόσκλησης
                </label>
                <input
                  type="text"
                  value={(fields.paperInviteLine as string) ?? ""}
                  onChange={(e) => update("paperInviteLine", e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}
        </>
      )}

      {(section.sectionType === "welcome_text" ||
        section.sectionType === "gift_list") && (
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Κείμενο
          </label>
          <textarea
            value={(fields.text as string) ?? ""}
            onChange={(e) => update("text", e.target.value)}
            rows={4}
            className={inputClass}
          />
        </div>
      )}

      {/* RSVP section */}
      {section.sectionType === "rsvp" && (
        <>
          <div>
            <label className={labelClass}>
              Περιγραφή
            </label>
            <textarea
              value={(fields.description as string) ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Προθεσμία
            </label>
            <input
              type="date"
              value={(fields.deadline as string) ?? ""}
              onChange={(e) => update("deadline", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Ναι
            </label>
            <input
              type="text"
              value={(fields.attendingYes as string) ?? ""}
              onChange={(e) => update("attendingYes", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Όχι
            </label>
            <input
              type="text"
              value={(fields.attendingNo as string) ?? ""}
              onChange={(e) => update("attendingNo", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Κουμπί αποστολής
            </label>
            <input
              type="text"
              value={(fields.submitLabel as string) ?? ""}
              onChange={(e) => update("submitLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Ετικέτα ονόματος
            </label>
            <input
              type="text"
              value={(fields.nameLabel as string) ?? ""}
              onChange={(e) => update("nameLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Ετικέτα παρουσίας
            </label>
            <input
              type="text"
              value={(fields.attendingLabel as string) ?? ""}
              onChange={(e) => update("attendingLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Μήνυμα επιτυχίας
            </label>
            <input
              type="text"
              value={(fields.successTitle as string) ?? ""}
              onChange={(e) => update("successTitle", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Κείμενο επιτυχίας
            </label>
            <input
              type="text"
              value={(fields.successText as string) ?? ""}
              onChange={(e) => update("successText", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            {[
              ["showPlusOne", "+1 συνοδός"],
              ["showChildrenCount", "Αριθμός παιδιών"],
              ["showMealPreference", "Προτίμηση γεύματος"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-text-primary cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(fields[key] as boolean) ?? false}
                  onChange={(e) => update(key, e.target.checked)}
                  className="rounded border-border accent-accent"
                />
                {label}
              </label>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      {section.sectionType === "footer" && (
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Κείμενο
          </label>
          <textarea
            value={(fields.text as string) ?? ""}
            onChange={(e) => update("text", e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>
      )}

      {section.sectionType === "video" && (
        <>
          <div>
            <label className={labelClass}>Τίτλος</label>
            <input
              type="text"
              value={(fields.title as string) ?? ""}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>YouTube ID</label>
            <input
              type="text"
              value={(fields.youtubeId as string) ?? ""}
              onChange={(e) => update("youtubeId", e.target.value)}
              className={inputClass}
              placeholder="π.χ. dQw4w9WgXcQ"
            />
          </div>
        </>
      )}

      {(section.sectionType === "quiz" ||
        section.sectionType === "wishes" ||
        section.sectionType === "vendors" ||
        section.sectionType === "participants") && (
        <>
          <div>
            <label className={labelClass}>Υπότιτλος</label>
            <input
              type="text"
              value={(fields.subtitle as string) ?? ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Τίτλος</label>
            <input
              type="text"
              value={(fields.title as string) ?? (fields.heading as string) ?? ""}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
            />
          </div>
        </>
      )}

      {section.sectionType === "participants" && (
        <ParticipantsFields eventId={eventId} />
      )}

      {section.sectionType === "vendors" && (
        <VendorsEditor
          vendors={parseVendors(fields)}
          onChange={(vendors: VendorConfig[]) => update("vendors", vendors)}
        />
      )}

      {section.sectionType === "quiz" && (
        <QuizQuestionsEditor
          questions={
            Array.isArray(fields.questions) && fields.questions.length > 0
              ? (fields.questions as QuizQuestionConfig[])
              : parseQuizQuestions(fields)
          }
          onChange={(questions: QuizQuestionConfig[]) => update("questions", questions)}
        />
      )}

      {section.sectionType === "wishes" && <WishesFields eventId={eventId} />}

      {/* Gallery */}
      {section.sectionType === "gallery" && (
        <>
          <div>
            <label className={labelClass}>
              Υπόδειξη
            </label>
            <input
              type="text"
              value={(fields.hint as string) ?? ""}
              onChange={(e) => update("hint", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Στήλες
            </label>
          <select
            value={(fields.columns as number) ?? 3}
            onChange={(e) => update("columns", parseInt(e.target.value))}
            className={inputClass}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        </>
      )}

      {/* Venue */}
      {section.sectionType === "venue" && (
        <>
          <div>
            <label className={labelClass}>
              Σύνδεσμος χάρτη
            </label>
            <input
              type="text"
              value={(fields.mapsLabel as string) ?? ""}
              onChange={(e) => update("mapsLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={(fields.showMap as boolean) ?? true}
              onChange={(e) => update("showMap", e.target.checked)}
              className="rounded border-border accent-accent"
            />
            Εμφάνιση χάρτη
          </label>
        </>
      )}

      <button
        type="button"
        onClick={save}
        className="mt-3 w-full rounded-lg bg-[#C4993D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B38935]"
      >
        Αποθήκευση
      </button>
    </div>
  );
}

function ParticipantsFields({ eventId }: { eventId: string }) {
  const [persons, setPersons] = useState<InvitationPerson[]>([]);

  useEffect(() => {
    api<InvitationPerson[]>(`/api/v1/events/${eventId}/persons`)
      .then(setPersons)
      .catch(() => setPersons([]));
  }, [eventId]);

  return <PersonsEditor eventId={eventId} persons={persons} onChange={setPersons} />;
}

function WishesFields({ eventId }: { eventId: string }) {
  const [wishes, setWishes] = useState<GuestWishItem[]>([]);

  useEffect(() => {
    api<GuestWishItem[]>(`/api/v1/events/${eventId}/wishes`)
      .then(setWishes)
      .catch(() => setWishes([]));
  }, [eventId]);

  return <WishesInbox wishes={wishes} />;
}

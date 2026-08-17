"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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
  template: { id: string; name: string; eventType: string };
  theme: ThemeData | null;
  sections: SectionData[];
}

interface TemplateListItem {
  id: string;
  name: string;
  description: string;
  eventType: string;
  category: string;
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
};

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { logout } = useAuth();
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
    if (needsTemplate) {
      api<TemplateListItem[]>("/api/v1/templates").then(setTemplates);
    }
  }, [needsTemplate]);

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
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  // Template selection screen
  if (needsTemplate) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="border-b border-border bg-surface">
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
            <Link
              href={`/dashboard/events/${eventId}`}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              ← Πίσω στην εκδήλωση
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="font-display text-2xl font-semibold text-text-primary mb-2">
            Επιλέξτε πρότυπο
          </h1>
          <p className="text-text-secondary mb-8">
            Διαλέξτε ένα πρότυπο για την πρόσκλησή σας
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t.id)}
                className="text-left bg-surface border border-border rounded-xl p-6 hover:border-accent/40 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="w-full h-32 rounded-lg bg-accent-light mb-4 flex items-center justify-center">
                  <span className="text-accent text-sm font-medium">
                    Προεπισκόπηση
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  {t.name}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {t.description}
                </p>
                <div className="flex gap-3 mt-3 text-xs text-text-muted">
                  <span>{t.eventType}</span>
                  <span>{t.sectionCount} ενότητες</span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!invitation) return null;

  const enabledSections = invitation.sections.filter((s) => s.isEnabled);
  const config = selectedSection?.configurationJson
    ? JSON.parse(selectedSection.configurationJson)
    : {};

  return (
    <div className="flex h-screen flex-col bg-bg">
      {/* Top bar */}
      <header className="flex h-12 items-center justify-between border-b border-border bg-surface px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Πίσω
          </Link>
          <span className="text-sm font-medium text-text-primary">
            {invitation.template.name}
          </span>
          {saving && (
            <span className="text-xs text-text-muted">Αποθήκευση...</span>
          )}
          {saved && (
            <span className="text-xs text-success">Αποθηκεύτηκε</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2 py-1 rounded-md ${
              invitation.isPublished
                ? "bg-success-light text-success"
                : "bg-warning-light text-warning"
            }`}
          >
            {invitation.isPublished ? "Δημοσιευμένη" : "Πρόχειρη"}
          </span>
          {publishedSlug && (
            <Link
              href={`/e/${publishedSlug}`}
              target="_blank"
              className="px-3 py-1.5 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent-light transition-colors"
            >
              Άνοιγμα πρόσκλησης
            </Link>
          )}
          {!invitation.isPublished && (
            <button
              onClick={publishInvitation}
              className="px-4 py-1.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
            >
              Δημοσίευση
            </button>
          )}
          {invitation.isPublished && !publishedSlug && (
            <button
              onClick={publishInvitation}
              className="px-3 py-1.5 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent-light transition-colors cursor-pointer"
            >
              Ανανέωση δημοσίευσης
            </button>
          )}
          <button
            onClick={logout}
            className="text-xs text-text-muted hover:text-text-primary cursor-pointer"
          >
            Αποσύνδεση
          </button>
        </div>
      </header>

      {/* Editor layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - sections */}
        <div className="w-60 border-r border-border bg-surface overflow-y-auto shrink-0">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Ενότητες
            </h3>
            <div className="space-y-1">
              {invitation.sections.map((section) => (
                <div key={section.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSection(section)}
                    className={`w-4 h-4 rounded border shrink-0 cursor-pointer ${
                      section.isEnabled
                        ? "bg-accent border-accent"
                        : "border-border-strong"
                    }`}
                  >
                    {section.isEnabled && (
                      <svg
                        viewBox="0 0 12 12"
                        className="w-full h-full text-white"
                      >
                        <path
                          d="M3 6l2 2 4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedSection(section)}
                    className={`flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors cursor-pointer ${
                      selectedSection?.id === section.id
                        ? "bg-accent-light text-accent font-medium"
                        : section.isEnabled
                          ? "text-text-primary hover:bg-bg"
                          : "text-text-muted hover:bg-bg"
                    }`}
                  >
                    {SECTION_LABELS[section.sectionType] ??
                      section.sectionType}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme selector */}
          <div className="p-4 border-t border-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Θέμα
            </h3>
            <button
              onClick={() => {
                if (themes.length === 0) loadThemes();
              }}
              className="w-full text-left px-3 py-2 text-sm bg-bg rounded-lg border border-border hover:border-accent/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {invitation.theme && (
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{
                      backgroundColor: invitation.theme.primaryColor,
                    }}
                  />
                )}
                <span className="text-text-primary">
                  {invitation.theme?.name ?? "Επιλογή θέματος"}
                </span>
              </div>
            </button>
            {themes.length > 0 && (
              <div className="mt-2 space-y-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                      invitation.theme?.id === t.id
                        ? "bg-accent-light text-accent"
                        : "hover:bg-bg text-text-primary"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: t.primaryColor }}
                    />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - preview */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto bg-bg p-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                previewMode === "mobile"
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary border border-border"
              }`}
            >
              Κινητό
            </button>
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                previewMode === "desktop"
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary border border-border"
              }`}
            >
              Υπολογιστής
            </button>
          </div>
          <div
            className={`bg-white border border-border rounded-xl shadow-sm overflow-hidden transition-all ${
              previewMode === "mobile" ? "w-[390px]" : "w-full max-w-3xl"
            }`}
            style={
              invitation.theme
                ? ({
                    "--preview-bg": invitation.theme.backgroundColor,
                    "--preview-text": invitation.theme.textColor,
                    "--preview-primary": invitation.theme.primaryColor,
                    "--preview-surface": invitation.theme.surfaceColor,
                    "--preview-accent": invitation.theme.accentColor,
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
        </div>

        {/* Right sidebar - section editor */}
        {selectedSection && (
          <div className="w-80 border-l border-border bg-surface overflow-y-auto shrink-0">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-text-primary">
                {SECTION_LABELS[selectedSection.sectionType] ??
                  selectedSection.sectionType}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Επεξεργασία ρυθμίσεων ενότητας
              </p>
            </div>
            <SectionEditor
              section={selectedSection}
              onSave={(json) => updateSectionConfig(selectedSection.id, json)}
            />
          </div>
        )}
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
        isSelected ? "ring-2 ring-accent ring-inset" : "hover:ring-1 hover:ring-accent/30 hover:ring-inset"
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
  section,
  onSave,
}: {
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
    "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

  return (
    <div className="p-4 space-y-4">
      {/* Common heading field */}
      {"heading" in config && (
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Επικεφαλίδα
          </label>
          <input
            type="text"
            value={(fields.heading as string) ?? ""}
            onChange={(e) => update("heading", e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {/* Hero section */}
      {section.sectionType === "hero" && (
        <>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Τίτλος
            </label>
            <input
              type="text"
              value={(fields.title as string) ?? ""}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Υπότιτλος
            </label>
            <input
              type="text"
              value={(fields.subtitle as string) ?? ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Αδιαφάνεια overlay ({((fields.overlayOpacity as number) ?? 0.3) * 100}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={(fields.overlayOpacity as number) ?? 0.3}
              onChange={(e) =>
                update("overlayOpacity", parseFloat(e.target.value))
              }
              className="w-full accent-accent"
            />
          </div>
        </>
      )}

      {/* Welcome text */}
      {section.sectionType === "welcome_text" && (
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
            <label className="block text-xs font-medium text-text-secondary mb-1">
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
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Προθεσμία
            </label>
            <input
              type="date"
              value={(fields.deadline as string) ?? ""}
              onChange={(e) => update("deadline", e.target.value)}
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

      {/* Gallery */}
      {section.sectionType === "gallery" && (
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
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
      )}

      {/* Venue */}
      {section.sectionType === "venue" && (
        <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
          <input
            type="checkbox"
            checked={(fields.showMap as boolean) ?? true}
            onChange={(e) => update("showMap", e.target.checked)}
            className="rounded border-border accent-accent"
          />
          Εμφάνιση χάρτη
        </label>
      )}

      <button
        onClick={save}
        className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
      >
        Αποθήκευση
      </button>
    </div>
  );
}

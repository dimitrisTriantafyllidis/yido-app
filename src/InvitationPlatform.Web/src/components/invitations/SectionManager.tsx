"use client";

import { useState } from "react";
import { GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Save } from "lucide-react";
import type { InvitationSection } from "./types";

interface SectionManagerProps {
  sections: InvitationSection[];
  onUpdate: (sections: InvitationSection[]) => Promise<void>;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Κεντρική Εικόνα",
  welcome: "Καλωσόρισμα",
  countdown: "Αντίστροφη Μέτρηση",
  event_details: "Λεπτομέρειες Εκδήλωσης",
  venue: "Τοποθεσίες",
  participants: "Συμμετέχοντες",
  gallery: "Φωτογραφίες",
  video: "Βίντεο",
  rsvp: "Επιβεβαίωση Παρουσίας",
  gift_list: "Λίστα Δώρων",
  couple_gallery: "Γκαλερί Ζευγαριού",
  quiz: "Κουίζ",
  wedding_cast: "Κουμπάροι & Παρανυφάκια",
  wishes: "Ευχές",
  vendors: "Ευχαριστίες Προμηθευτών",
  footer: "Υποσέλιδο",
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "Κύρια εικόνα και τίτλος",
  welcome: "Μήνυμα καλωσορίσματος",
  countdown: "Χρονομέτρηση μέχρι την εκδήλωση",
  event_details: "Ημερομηνία, ώρα, τοποθεσία",
  venue: "Εκκλησία, δεξίωση",
  participants: "Νύφη, γαμπρός, κουμπάρος",
  gallery: "Φωτογραφίες του ζευγαριού",
  video: "Βίντεο πρόσκλησης",
  rsvp: "Φόρμα απάντησης καλεσμένων",
  gift_list: "IBAN για δώρα",
  couple_gallery: "Εκτενής γκαλερί φωτογραφιών",
  quiz: "Παιχνίδι γνώσεων για το ζευγάρι",
  wedding_cast: "Ομάδα γάμου",
  wishes: "Μηνύματα ευχών από καλεσμένους",
  vendors: "Ευχαριστίες σε προμηθευτές",
  footer: "Πληροφορίες επικοινωνίας",
};

export function SectionManager({ sections: initialSections, onUpdate }: SectionManagerProps) {
  const [sections, setSections] = useState(initialSections);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleToggle = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [removed] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, removed);
    
    // Update sortOrder
    const updatedSections = newSections.map((s, idx) => ({
      ...s,
      sortOrder: idx,
    }));
    
    setSections(updatedSections);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(sections);
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    handleReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleConfigChange = (sectionId: string, field: string, value: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          const config = s.configuration ? JSON.parse(s.configuration) : {};
          return {
            ...s,
            configuration: JSON.stringify({ ...config, [field]: value }),
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Διαχείριση Ενοτήτων</h3>
          <p className="text-sm text-muted-foreground">
            Ενεργοποιήστε, απενεργοποιήστε ή αναδιατάξτε τις ενότητες της πρόσκλησης
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Αποθήκευση..." : "Αποθήκευση Αλλαγών"}
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => {
          const isExpanded = expandedSection === section.id;
          const config = section.configuration ? JSON.parse(section.configuration) : {};

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`rounded-lg border bg-card transition-all ${
                draggedIndex === index ? "opacity-50" : ""
              } ${section.isEnabled ? "border-border" : "border-border/50 opacity-70"}`}
            >
              <div className="flex items-center gap-3 p-4">
                <button className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleToggle(section.id)}
                  className="flex-shrink-0"
                >
                  {section.isEnabled ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="font-medium">
                    {SECTION_LABELS[section.sectionType] || section.sectionType}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {SECTION_DESCRIPTIONS[section.sectionType]}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExpandedSection(isExpanded ? null : section.id)
                  }
                  className="flex-shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t p-4 space-y-4">
                  <SectionConfig
                    sectionType={section.sectionType}
                    config={config}
                    onChange={(field, value) =>
                      handleConfigChange(section.id, field, value)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SectionConfigProps {
  sectionType: string;
  config: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

function SectionConfig({ sectionType, config, onChange }: SectionConfigProps) {
  switch (sectionType) {
    case "hero":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Τίτλος</label>
            <input
              type="text"
              value={config.title || ""}
              onChange={(e) => onChange("title", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="π.χ. Μαρία & Γιώργος"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Υπότιτλος</label>
            <input
              type="text"
              value={config.subtitle || ""}
              onChange={(e) => onChange("subtitle", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="π.χ. Σας προσκαλούμε στον γάμο μας"
            />
          </div>
        </div>
      );

    case "welcome":
      return (
        <div>
          <label className="text-sm font-medium">Μήνυμα Καλωσορίσματος</label>
          <textarea
            value={config.text || ""}
            onChange={(e) => onChange("text", e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={4}
            placeholder="Γράψτε το μήνυμα καλωσορίσματός σας..."
          />
        </div>
      );

    case "rsvp":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Τίτλος</label>
            <input
              type="text"
              value={config.heading || ""}
              onChange={(e) => onChange("heading", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="π.χ. Επιβεβαίωση Παρουσίας"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Περιγραφή</label>
            <textarea
              value={config.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={2}
              placeholder="Παρακαλούμε απαντήστε έως..."
            />
          </div>
        </div>
      );

    case "gift_list":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Τίτλος</label>
            <input
              type="text"
              value={config.heading || ""}
              onChange={(e) => onChange("heading", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="π.χ. Λίστα Δώρων"
            />
          </div>
          <div>
            <label className="text-sm font-medium">IBAN</label>
            <input
              type="text"
              value={config.iban || ""}
              onChange={(e) => onChange("iban", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              placeholder="GR..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Όνομα Δικαιούχου</label>
            <input
              type="text"
              value={config.beneficiary || ""}
              onChange={(e) => onChange("beneficiary", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="π.χ. Μαρία Παπαδοπούλου"
            />
          </div>
        </div>
      );

    case "video":
      return (
        <div>
          <label className="text-sm font-medium">YouTube/Vimeo URL</label>
          <input
            type="url"
            value={config.videoUrl || ""}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Βάλτε το link του βίντεό σας από YouTube ή Vimeo
          </p>
        </div>
      );

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Αυτή η ενότητα δεν έχει επιπλέον ρυθμίσεις.
        </div>
      );
  }
}

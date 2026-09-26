"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { WEDDING_TEMPLATE_COMPONENTS } from "./templates";
import type {
  InvitationPerson,
  InvitationViewModel,
  InvitationVenue,
  WeddingStyleId,
} from "./types";
import {
  parseQuizQuestions,
  parseVendors,
  type GuestWishItem,
  type QuizQuestionConfig,
  type VendorConfig,
} from "./extra-section-config";
import {
  PersonsEditor,
  QuizQuestionsEditor,
  VendorsEditor,
  WishesInbox,
} from "./ExtraSectionEditors";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const WEDDING_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;1,6..96,400&family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&family=Great+Vibes&family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Raleway:wght@300;400;500;600&display=swap";

interface SectionData {
  id: string;
  sectionType: string;
  sortOrder: number;
  isEnabled: boolean;
  configurationJson: string | null;
}

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
  eventType: string;
  category: string;
  isPremium: boolean;
}

const EXTRA_SECTION_LABELS: { type: string; label: string }[] = [
  { type: "video", label: "Βίντεο" },
  { type: "gallery", label: "Γκαλερί" },
  { type: "participants", label: "Πρωταγωνιστές" },
  { type: "wishes", label: "Ευχές" },
  { type: "quiz", label: "Κουίζ" },
  { type: "vendors", label: "Συνεργάτες" },
];

interface EventDetail {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  eventEndDate: string | null;
  description: string | null;
  coverImageUrl: string | null;
  locale: string;
  slug: string | null;
  venues: {
    id: string;
    name: string;
    venueType: string;
    address: string | null;
    city: string | null;
    googleMapsUrl: string | null;
    time: string | null;
    notes: string | null;
    sortOrder: number;
  }[];
}

interface MediaItem {
  id: string;
  mediaType: string;
  sortOrder: number;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  isGuestUpload: boolean;
}

type ImageSlot = { sortOrder: number; label: string; hint: string };

const STYLE_IMAGE_SLOTS: Record<WeddingStyleId, ImageSlot[]> = {
  rustic: [
    { sortOrder: 0, label: "Κύρια φωτογραφία", hint: "Εξώφυλλο / ήρωας" },
    { sortOrder: 1, label: "Ζευγάρι", hint: "Δεύτερη εικόνα" },
    { sortOrder: 2, label: "Τοποθεσία", hint: "Τρίτη εικόνα" },
  ],
  boho: [
    { sortOrder: 0, label: "Κύρια φωτογραφία", hint: "Εξώφυλλο" },
    { sortOrder: 1, label: "Τοπίο / φύση", hint: "Δεύτερη εικόνα" },
    { sortOrder: 2, label: "Εξωτερικός χώρος", hint: "Τρίτη εικόνα" },
  ],
  minimal: [
    { sortOrder: 0, label: "Κύρια φωτογραφία", hint: "Εξώφυλλο" },
    { sortOrder: 1, label: "Υφή / λεπτομέρεια", hint: "Δεύτερη εικόνα" },
    { sortOrder: 2, label: "Πορτρέτο", hint: "Τρίτη εικόνα" },
  ],
  vintage: [
    { sortOrder: 0, label: "Κύρια φωτογραφία", hint: "Εξώφυλλο" },
    { sortOrder: 1, label: "Άνθη / λεπτομέρεια", hint: "Δεύτερη εικόνα" },
    { sortOrder: 2, label: "Οικεία στιγμή", hint: "Τρίτη εικόνα" },
  ],
  elegant: [
    { sortOrder: 0, label: "Κύρια φωτογραφία", hint: "Εξώφυλλο" },
    { sortOrder: 1, label: "Τραπέζια / χώρος", hint: "Δεύτερη εικόνα" },
    { sortOrder: 2, label: "Ζευγάρι", hint: "Τρίτη εικόνα" },
  ],
  floral: [
    { sortOrder: 0, label: "Κύρια φωτογραφία", hint: "Εξώφυλλο" },
    { sortOrder: 1, label: "Τοποθεσία", hint: "Δεύτερη εικόνα" },
    { sortOrder: 2, label: "Κάρτα / λεπτομέρεια", hint: "Τρίτη εικόνα" },
  ],
  wreath: [
    { sortOrder: 0, label: "Κύρια / χώρος", hint: "Εξώφυλλο" },
    { sortOrder: 1, label: "Κήπος", hint: "Δεύτερη εικόνα" },
    { sortOrder: 2, label: "Κάρτα", hint: "Τρίτη εικόνα" },
  ],
  dusty: [{ sortOrder: 0, label: "Κάρτα / εξώφυλλο", hint: "Κύρια εικόνα" }],
  greengold: [{ sortOrder: 0, label: "Κάρτα / εξώφυλλο", hint: "Κύρια εικόνα" }],
  geometric: [{ sortOrder: 0, label: "Κάρτα / εξώφυλλο", hint: "Κύρια εικόνα" }],
};

const VENUE_TYPES = ["Church", "Reception", "Ceremony", "Party", "Custom"] as const;
const VENUE_TYPE_LABELS: Record<string, string> = {
  Church: "Εκκλησία",
  Reception: "Δεξίωση",
  Ceremony: "Τελετή",
  Party: "Πάρτι",
  Custom: "Άλλο",
};

const inputClass =
  "w-full rounded-md border border-[#EDE8E3] bg-white px-3 py-2 text-sm text-[#1C1516] outline-none focus:border-[#C4993D]";
const labelClass = "mb-1 block text-xs font-semibold text-[#6E6263]";

function parseConfig(json: string | null): Record<string, unknown> {
  if (!json) return {};
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function str(config: Record<string, unknown>, key: string): string {
  const v = config[key];
  return typeof v === "string" ? v : "";
}

function sectionByType(sections: SectionData[], type: string) {
  return sections.find((s) => s.sectionType === type) ?? null;
}

function sectionState(sections: SectionData[], type: string) {
  const section = sectionByType(sections, type);
  return {
    enabled: section?.isEnabled ?? false,
    config: parseConfig(section?.configurationJson ?? null),
  };
}

type VenueDraft = {
  id?: string;
  name: string;
  venueType: string;
  address: string;
  city: string;
  googleMapsUrl: string;
  time: string;
};

const emptyVenue = (): VenueDraft => ({
  name: "",
  venueType: "Church",
  address: "",
  city: "",
  googleMapsUrl: "",
  time: "",
});

export function WeddingTemplateEditor({
  eventId,
  invitation,
  styleId,
  onInvitationChange,
}: {
  eventId: string;
  invitation: InvitationData;
  styleId: WeddingStyleId;
  onInvitationChange: (next: InvitationData) => void;
}) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [title, setTitle] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [footerText, setFooterText] = useState("");
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [venues, setVenues] = useState<[VenueDraft, VenueDraft]>([
    emptyVenue(),
    emptyVenue(),
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [persons, setPersons] = useState<InvitationPerson[]>([]);
  const [youtubeId, setYoutubeId] = useState("");
  const [vendors, setVendors] = useState<VendorConfig[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionConfig[]>([]);
  const [wishes, setWishes] = useState<GuestWishItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<number>(0);

  const slots = STYLE_IMAGE_SLOTS[styleId];
  const Template = WEDDING_TEMPLATE_COMPONENTS[styleId];

  const hydrateFromSections = useCallback(
    (inv: InvitationData, evt: EventDetail) => {
      const hero = parseConfig(sectionByType(inv.sections, "hero")?.configurationJson ?? null);
      const welcome = parseConfig(
        sectionByType(inv.sections, "welcome_text")?.configurationJson ?? null
      );
      const details = parseConfig(
        sectionByType(inv.sections, "event_details")?.configurationJson ?? null
      );
      const footer = parseConfig(
        sectionByType(inv.sections, "footer")?.configurationJson ?? null
      );
      const rsvp = parseConfig(sectionByType(inv.sections, "rsvp")?.configurationJson ?? null);
      const video = parseConfig(sectionByType(inv.sections, "video")?.configurationJson ?? null);
      const vendorsSection = parseConfig(
        sectionByType(inv.sections, "vendors")?.configurationJson ?? null
      );
      const quizSection = parseConfig(sectionByType(inv.sections, "quiz")?.configurationJson ?? null);

      setTitle(str(hero, "title") || evt.title || "");
      setYoutubeId(str(video, "youtubeId"));
      setVendors(parseVendors(vendorsSection));
      setQuizQuestions(parseQuizQuestions(quizSection));
      setEyebrow(str(hero, "subtitle"));
      setWelcomeText(str(welcome, "text") || evt.description || "");
      setDressCode(str(details, "dressCode"));
      setFooterText(str(footer, "text") || "Σας περιμένουμε με χαρά!");
      setRsvpDeadline(str(rsvp, "deadline"));

      const sorted = [...evt.venues].sort((a, b) => a.sortOrder - b.sortOrder);
      setVenues([
        sorted[0]
          ? {
              id: sorted[0].id,
              name: sorted[0].name,
              venueType: sorted[0].venueType,
              address: sorted[0].address ?? "",
              city: sorted[0].city ?? "",
              googleMapsUrl: sorted[0].googleMapsUrl ?? "",
              time: sorted[0].time ?? "",
            }
          : emptyVenue(),
        sorted[1]
          ? {
              id: sorted[1].id,
              name: sorted[1].name,
              venueType: sorted[1].venueType,
              address: sorted[1].address ?? "",
              city: sorted[1].city ?? "",
              googleMapsUrl: sorted[1].googleMapsUrl ?? "",
              time: sorted[1].time ?? "",
            }
          : { ...emptyVenue(), venueType: "Reception" },
      ]);
    },
    []
  );

  const loadMedia = useCallback(async () => {
    const items = await api<MediaItem[]>(
      `/api/v1/events/${eventId}/media?source=owner`
    );
    setMedia(items.filter((m) => m.mediaType === "Image"));
  }, [eventId]);

  const loadAll = useCallback(async () => {
    const evt = await api<EventDetail>(`/api/v1/events/${eventId}`);
    setEvent(evt);
    if (evt.slug) setPublishedSlug(evt.slug);
    hydrateFromSections(invitation, evt);
    await loadMedia();
    try {
      const people = await api<InvitationPerson[]>(`/api/v1/events/${eventId}/persons`);
      setPersons(people);
    } catch {
      setPersons([]);
    }
    try {
      const guestWishes = await api<GuestWishItem[]>(`/api/v1/events/${eventId}/wishes`);
      setWishes(guestWishes);
    } catch {
      setWishes([]);
    }
  }, [eventId, hydrateFromSections, invitation, loadMedia]);

  useEffect(() => {
    // Hydrate once when the editor mounts for this event / invitation version
    loadAll().catch(() => setError("Αδυναμία φόρτωσης δεδομένων εκδήλωσης."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, invitation.id]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = WEDDING_FONTS_HREF;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  const slotMedia = useMemo(() => {
    const byOrder = new Map<number, MediaItem>();
    for (const m of [...media].sort((a, b) => a.sortOrder - b.sortOrder)) {
      if (!byOrder.has(m.sortOrder)) byOrder.set(m.sortOrder, m);
    }
    return byOrder;
  }, [media]);

  const previewVenues: InvitationVenue[] = venues
    .filter((v) => v.name.trim())
    .map((v, i) => ({
      id: v.id ?? `draft-${i}`,
      name: v.name.trim(),
      venueType: v.venueType,
      address: v.address,
      city: v.city,
      googleMapsUrl: v.googleMapsUrl || null,
      time: v.time || null,
    }));

  const previewGallery = slots
    .map((slot) => {
      const m = slotMedia.get(slot.sortOrder);
      if (!m) return null;
      return {
        id: m.id,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        altText: m.altText,
      };
    })
    .filter(Boolean) as InvitationViewModel["gallery"];

  const coverUrl =
    event?.coverImageUrl ||
    slotMedia.get(0)?.url ||
    previewGallery[0]?.url ||
    null;

  const previewData: InvitationViewModel = {
    title: title.trim() || event?.title || "Ο γάμος μας",
    eventDate: event?.eventDate ?? null,
    description: event?.description ?? null,
    coverImageUrl: coverUrl,
    locale: event?.locale || "el",
    slug: publishedSlug || event?.slug || "preview",
    styleId,
    isPreview: true,
    eyebrow: eyebrow.trim() || null,
    dressCode: dressCode.trim() || null,
    welcomeText: welcomeText.trim() || null,
    footerText: footerText.trim() || null,
    rsvpDeadline: rsvpDeadline.trim() || null,
    venues: previewVenues,
    persons,
    gallery: previewGallery,
    rsvp: {
      enabled: true,
      inviteToken: null,
      guestName: null,
      questions: [],
    },
    wishes,
    sections: {
      video: {
        ...sectionState(invitation.sections, "video"),
        config: {
          ...sectionState(invitation.sections, "video").config,
          youtubeId: youtubeId.trim() || undefined,
        },
      },
      coupleGallery: sectionState(invitation.sections, "gallery"),
      weddingCast: sectionState(invitation.sections, "participants"),
      wishes: sectionState(invitation.sections, "wishes"),
      quiz: {
        ...sectionState(invitation.sections, "quiz"),
        config: {
          ...sectionState(invitation.sections, "quiz").config,
          questions: quizQuestions,
        },
      },
      vendors: {
        ...sectionState(invitation.sections, "vendors"),
        config: {
          ...sectionState(invitation.sections, "vendors").config,
          vendors,
        },
      },
    },
  };

  const patchSectionLocal = (sectionType: string, configurationJson: string) => {
    const section = sectionByType(invitation.sections, sectionType);
    if (!section) return;
    const next: InvitationData = {
      ...invitation,
      sections: invitation.sections.map((s) =>
        s.id === section.id ? { ...s, configurationJson } : s
      ),
    };
    onInvitationChange(next);
  };

  const saveVenueSlot = async (index: 0 | 1, draft: VenueDraft) => {
    if (!draft.name.trim()) {
      if (draft.id) {
        await api(`/api/v1/events/${eventId}/venues/${draft.id}`, {
          method: "DELETE",
        });
        setVenues((prev) => {
          const next = [...prev] as [VenueDraft, VenueDraft];
          next[index] = index === 0 ? emptyVenue() : { ...emptyVenue(), venueType: "Reception" };
          return next;
        });
      }
      return;
    }

    const body = {
      name: draft.name.trim(),
      venueType: draft.venueType,
      address: draft.address || null,
      city: draft.city || null,
      googleMapsUrl: draft.googleMapsUrl || null,
      latitude: null,
      longitude: null,
      time: draft.time || null,
      notes: null,
      sortOrder: index,
    };

    if (draft.id) {
      await api(`/api/v1/events/${eventId}/venues/${draft.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    } else {
      const created = await api<{ id: string }>(`/api/v1/events/${eventId}/venues`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setVenues((prev) => {
        const next = [...prev] as [VenueDraft, VenueDraft];
        next[index] = { ...draft, id: created.id };
        return next;
      });
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      if (event) {
        await api(`/api/v1/events/${eventId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: title.trim() || event.title,
            eventType: event.eventType,
            eventDate: event.eventDate,
            eventEndDate: event.eventEndDate,
            description: welcomeText.trim() || event.description,
            locale: event.locale || "el",
          }),
        });
      }

      const updates: { type: string; json: string }[] = [];

      const heroSection = sectionByType(invitation.sections, "hero");
      if (heroSection) {
        updates.push({
          type: "hero",
          json: JSON.stringify({
            ...parseConfig(heroSection.configurationJson),
            title: title.trim(),
            subtitle: eyebrow.trim(),
          }),
        });
      }

      const welcomeSection = sectionByType(invitation.sections, "welcome_text");
      if (welcomeSection) {
        updates.push({
          type: "welcome_text",
          json: JSON.stringify({
            ...parseConfig(welcomeSection.configurationJson),
            text: welcomeText.trim(),
          }),
        });
      }

      const detailsSection = sectionByType(invitation.sections, "event_details");
      if (detailsSection) {
        updates.push({
          type: "event_details",
          json: JSON.stringify({
            ...parseConfig(detailsSection.configurationJson),
            dressCode: dressCode.trim(),
          }),
        });
      }

      const footerSection = sectionByType(invitation.sections, "footer");
      if (footerSection) {
        updates.push({
          type: "footer",
          json: JSON.stringify({
            ...parseConfig(footerSection.configurationJson),
            text: footerText.trim(),
          }),
        });
      }

      const rsvpSection = sectionByType(invitation.sections, "rsvp");
      if (rsvpSection) {
        updates.push({
          type: "rsvp",
          json: JSON.stringify({
            ...parseConfig(rsvpSection.configurationJson),
            deadline: rsvpDeadline.trim(),
          }),
        });
      }

      const videoSection = sectionByType(invitation.sections, "video");
      if (videoSection) {
        updates.push({
          type: "video",
          json: JSON.stringify({
            ...parseConfig(videoSection.configurationJson),
            youtubeId: youtubeId.trim(),
          }),
        });
      }

      const vendorsSection = sectionByType(invitation.sections, "vendors");
      if (vendorsSection) {
        updates.push({
          type: "vendors",
          json: JSON.stringify({
            ...parseConfig(vendorsSection.configurationJson),
            vendors,
          }),
        });
      }

      const quizSection = sectionByType(invitation.sections, "quiz");
      if (quizSection) {
        updates.push({
          type: "quiz",
          json: JSON.stringify({
            ...parseConfig(quizSection.configurationJson),
            questions: quizQuestions,
          }),
        });
      }

      for (const u of updates) {
        const section = sectionByType(invitation.sections, u.type);
        if (!section) continue;
        await api(`/api/v1/events/${eventId}/invitation/sections/${section.id}`, {
          method: "PUT",
          body: JSON.stringify({ configurationJson: u.json }),
        });
        patchSectionLocal(u.type, u.json);
      }

      await saveVenueSlot(0, venues[0]);
      await saveVenueSlot(1, venues[1]);

      const evt = await api<EventDetail>(`/api/v1/events/${eventId}`);
      setEvent(evt);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Η αποθήκευση απέτυχε. Δοκιμάστε ξανά.");
    } finally {
      setSaving(false);
    }
  };

  const loadTemplates = async () => {
    if (templates.length > 0) return;
    const qs = event?.eventType ? `?eventType=${encodeURIComponent(event.eventType)}` : "";
    const data = await api<TemplateListItem[]>(`/api/v1/templates${qs}`);
    setTemplates(data);
  };

  const changeTemplate = async (templateId: string) => {
    if (templateId === invitation.template.id) return;
    if (
      !confirm(
        "Η αλλαγή προτύπου θα αντικαταστήσει τις τρέχουσες ενότητες. Θέλετε να συνεχίσετε;"
      )
    ) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const next = await api<InvitationData>(
        `/api/v1/events/${eventId}/invitation/template`,
        {
          method: "PATCH",
          body: JSON.stringify({ templateId }),
        }
      );
      onInvitationChange(next);
    } catch {
      setError("Η αλλαγή προτύπου απέτυχε.");
    } finally {
      setSaving(false);
    }
  };

  const toggleExtraSection = async (sectionType: string) => {
    const section = sectionByType(invitation.sections, sectionType);
    if (!section) return;
    const updated = await api<SectionData>(
      `/api/v1/events/${eventId}/invitation/sections/${section.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ isEnabled: !section.isEnabled }),
      }
    );
    onInvitationChange({
      ...invitation,
      sections: invitation.sections.map((s) =>
        s.id === section.id ? { ...s, isEnabled: updated.isEnabled } : s
      ),
    });
  };

  const publishInvitation = async () => {
    setError("");
    try {
      await saveAll();
      const result = await api<{ slug: string }>(
        `/api/v1/events/${eventId}/invitation/publish`,
        { method: "POST" }
      );
      setPublishedSlug(result.slug);
      onInvitationChange({
        ...invitation,
        isPublished: true,
        publishedAt: new Date().toISOString(),
      });
    } catch {
      setError("Η δημοσίευση απέτυχε.");
    }
  };

  const uploadForSlot = async (sortOrder: number, file: File) => {
    setUploadingSlot(sortOrder);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${API_BASE}/api/v1/events/${eventId}/media?sortOrder=${sortOrder}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.title ?? "Upload failed");
      }
      await loadMedia();
      const evt = await api<EventDetail>(`/api/v1/events/${eventId}`);
      setEvent(evt);
    } catch {
      setError("Αποτυχία ανεβάσματος εικόνας.");
    } finally {
      setUploadingSlot(null);
    }
  };

  const clearSlot = async (sortOrder: number) => {
    const m = slotMedia.get(sortOrder);
    if (!m) return;
    if (!confirm("Αφαίρεση αυτής της εικόνας;")) return;
    await api(`/api/v1/events/${eventId}/media/${m.id}`, { method: "DELETE" });
    await loadMedia();
    if (sortOrder === 0) {
      const evt = await api<EventDetail>(`/api/v1/events/${eventId}`);
      setEvent(evt);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F9F8F6]">
      <header className="flex shrink-0 items-center justify-between border-b border-[#EDE8E3] bg-white px-6 py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="shrink-0 text-sm font-medium text-[#9C9293] transition-colors hover:text-[#1C1516]"
          >
            ← Πίσω
          </Link>
          <span className="h-4 w-px bg-[#EDE8E3]" aria-hidden />
          <h1 className="truncate font-display text-xl text-[#1C1516]">
            {invitation.template.name}
          </h1>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              invitation.isPublished
                ? "bg-[#E3F3EA] text-[#1B5E3A]"
                : "bg-[#FDF2F2] text-[#C43D41]"
            }`}
          >
            {invitation.isPublished ? "Published" : "Draft"}
          </span>
          {saving ? (
            <span className="text-xs text-[#9C9293]">Αποθήκευση...</span>
          ) : null}
          {saved ? (
            <span className="text-xs font-medium text-[#1B5E3A]">Αποθηκεύτηκε</span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {publishedSlug ? (
            <Link
              href={`/e/${publishedSlug}`}
              target="_blank"
              className="rounded-md border border-[#EDE8E3] px-3 py-2 text-[13px] font-semibold text-[#6E6263] transition-colors hover:text-[#1C1516]"
            >
              Άνοιγμα
            </Link>
          ) : null}
          <button
            type="button"
            onClick={saveAll}
            disabled={saving}
            className="rounded-md border border-[#C4993D] px-3 py-2 text-[13px] font-semibold text-[#C4993D] transition-colors hover:bg-[#C4993D]/5 disabled:opacity-50"
          >
            Αποθήκευση
          </button>
          <button
            type="button"
            onClick={publishInvitation}
            disabled={saving}
            className="rounded-md bg-[#C4993D] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#B38935] disabled:opacity-50"
          >
            {invitation.isPublished ? "Ανανέωση" : "Δημοσίευση"}
          </button>
        </div>
      </header>

      {error ? (
        <div className="border-b border-[#F5C6C7] bg-[#FDF2F2] px-6 py-2 text-sm text-[#C43D41]">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-full max-w-[420px] shrink-0 flex-col overflow-y-auto border-r border-[#EDE8E3] bg-white p-6">
          <p className="mb-5 text-xs font-bold uppercase tracking-wide text-[#9C9293]">
            Περιεχόμενο προτύπου
          </p>

          <section className="mb-8 space-y-3">
            <h2 className="font-display text-lg text-[#1C1516]">Πρότυπο</h2>
            <select
              value={invitation.template.id}
              onFocus={() => {
                void loadTemplates();
              }}
              onChange={(e) => {
                if (e.target.value) void changeTemplate(e.target.value);
              }}
              className={inputClass}
            >
              <option value={invitation.template.id}>{invitation.template.name}</option>
              {templates
                .filter((t) => t.id !== invitation.template.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.isPremium ? " ★" : ""}
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-[#9C9293]">
              Η αλλαγή επαναφέρει τις ενότητες στις προεπιλογές του νέου προτύπου.
            </p>
          </section>

          <section className="mb-8 space-y-3">
            <h2 className="font-display text-lg text-[#1C1516]">Επιπλέον ενότητες</h2>
            <p className="text-xs text-[#9C9293]">
              Ενεργοποιήστε ή απενεργοποιήστε βίντεο, γκαλερί, κουίζ και άλλες ενότητες.
            </p>
            <div className="space-y-1">
              {EXTRA_SECTION_LABELS.map(({ type, label }) => {
                const section = sectionByType(invitation.sections, type);
                if (!section) return null;
                return (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 hover:bg-[#F9F8F6]"
                  >
                    <span className="text-[13px] font-medium text-[#1C1516]">{label}</span>
                    <input
                      type="checkbox"
                      checked={section.isEnabled}
                      onChange={() => {
                        void toggleExtraSection(type);
                      }}
                      className="accent-[#C4993D]"
                    />
                  </label>
                );
              })}
            </div>
            {sectionByType(invitation.sections, "video")?.isEnabled ? (
              <div>
                <label className={labelClass}>YouTube ID βίντεο</label>
                <input
                  className={inputClass}
                  value={youtubeId}
                  onChange={(e) => setYoutubeId(e.target.value)}
                  placeholder="π.χ. dQw4w9WgXcQ"
                />
              </div>
            ) : null}
            {sectionByType(invitation.sections, "participants")?.isEnabled ? (
              <div className="space-y-2 pt-3">
                <h3 className="text-sm font-semibold text-[#1C1516]">Πρωταγωνιστές</h3>
                <PersonsEditor eventId={eventId} persons={persons} onChange={setPersons} />
              </div>
            ) : null}
            {sectionByType(invitation.sections, "vendors")?.isEnabled ? (
              <div className="space-y-2 pt-3">
                <h3 className="text-sm font-semibold text-[#1C1516]">Συνεργάτες</h3>
                <VendorsEditor vendors={vendors} onChange={setVendors} />
              </div>
            ) : null}
            {sectionByType(invitation.sections, "quiz")?.isEnabled ? (
              <div className="space-y-2 pt-3">
                <h3 className="text-sm font-semibold text-[#1C1516]">Κουίζ</h3>
                <QuizQuestionsEditor questions={quizQuestions} onChange={setQuizQuestions} />
              </div>
            ) : null}
            {sectionByType(invitation.sections, "wishes")?.isEnabled ? (
              <div className="space-y-2 pt-3">
                <h3 className="text-sm font-semibold text-[#1C1516]">Ευχές καλεσμένων</h3>
                <WishesInbox wishes={wishes} />
              </div>
            ) : null}
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-display text-lg text-[#1C1516]">Κείμενα</h2>
            <div>
              <label className={labelClass}>Τίτλος (ονόματα)</label>
              <input
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="π.χ. Μαρία & Γιώργος"
              />
            </div>
            <div>
              <label className={labelClass}>Υπότιτλος / γραμμή ήρωα</label>
              <input
                className={inputClass}
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="π.χ. Με χαρά σας προσκαλούμε"
              />
            </div>
            <div>
              <label className={labelClass}>Κείμενο καλωσορίσματος</label>
              <textarea
                className={`${inputClass} min-h-[96px] resize-y`}
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                placeholder="Το μήνυμα πρόσκλησης…"
              />
            </div>
            <div>
              <label className={labelClass}>Ενδυμασία</label>
              <input
                className={inputClass}
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="π.χ. Smart Casual"
              />
            </div>
            <div>
              <label className={labelClass}>Προθεσμία RSVP</label>
              <input
                type="date"
                className={inputClass}
                value={rsvpDeadline}
                onChange={(e) => setRsvpDeadline(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Υποσέλιδο</label>
              <input
                className={inputClass}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="Σας περιμένουμε με χαρά!"
              />
            </div>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-display text-lg text-[#1C1516]">Εικόνες</h2>
            <p className="text-xs text-[#9C9293]">
              Ανεβάστε τις φωτογραφίες που χρειάζεται αυτό το πρότυπο. Χωρίς δικές σας,
              εμφανίζονται δείγματα.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadForSlot(pendingSlotRef.current, file);
                e.target.value = "";
              }}
            />
            <div className="space-y-3">
              {slots.map((slot) => {
                const m = slotMedia.get(slot.sortOrder);
                const busy = uploadingSlot === slot.sortOrder;
                return (
                  <div
                    key={slot.sortOrder}
                    className="flex gap-3 rounded-lg border border-[#EDE8E3] p-3"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[#F9F8F6]">
                      {m ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.thumbnailUrl || m.url}
                          alt={slot.label}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-[#9C9293]">
                          Κενό
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1C1516]">{slot.label}</p>
                      <p className="text-xs text-[#9C9293]">{slot.hint}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            pendingSlotRef.current = slot.sortOrder;
                            fileInputRef.current?.click();
                          }}
                          className="rounded-md bg-[#3A1112] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {busy ? "…" : m ? "Αλλαγή" : "Ανέβασμα"}
                        </button>
                        {m ? (
                          <button
                            type="button"
                            onClick={() => clearSlot(slot.sortOrder)}
                            className="rounded-md border border-[#EDE8E3] px-2.5 py-1 text-xs font-medium text-[#6E6263]"
                          >
                            Αφαίρεση
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mb-4 space-y-5">
            <h2 className="font-display text-lg text-[#1C1516]">Τοποθεσίες</h2>
            <p className="text-xs text-[#9C9293]">
              Έως δύο τοποθεσίες (π.χ. εκκλησία και δεξίωση).
            </p>
            {([0, 1] as const).map((index) => {
              const draft = venues[index];
              return (
                <div
                  key={index}
                  className="space-y-2 rounded-lg border border-[#EDE8E3] p-3"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9C9293]">
                    {index === 0 ? "1η τοποθεσία" : "2η τοποθεσία"}
                  </p>
                  <input
                    className={inputClass}
                    placeholder="Όνομα"
                    value={draft.name}
                    onChange={(e) =>
                      setVenues((prev) => {
                        const next = [...prev] as [VenueDraft, VenueDraft];
                        next[index] = { ...draft, name: e.target.value };
                        return next;
                      })
                    }
                  />
                  <select
                    className={inputClass}
                    value={draft.venueType}
                    onChange={(e) =>
                      setVenues((prev) => {
                        const next = [...prev] as [VenueDraft, VenueDraft];
                        next[index] = { ...draft, venueType: e.target.value };
                        return next;
                      })
                    }
                  >
                    {VENUE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {VENUE_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    placeholder="Διεύθυνση"
                    value={draft.address}
                    onChange={(e) =>
                      setVenues((prev) => {
                        const next = [...prev] as [VenueDraft, VenueDraft];
                        next[index] = { ...draft, address: e.target.value };
                        return next;
                      })
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputClass}
                      placeholder="Πόλη"
                      value={draft.city}
                      onChange={(e) =>
                        setVenues((prev) => {
                          const next = [...prev] as [VenueDraft, VenueDraft];
                          next[index] = { ...draft, city: e.target.value };
                          return next;
                        })
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Ώρα (π.χ. 18:00)"
                      value={draft.time}
                      onChange={(e) =>
                        setVenues((prev) => {
                          const next = [...prev] as [VenueDraft, VenueDraft];
                          next[index] = { ...draft, time: e.target.value };
                          return next;
                        })
                      }
                    />
                  </div>
                  <input
                    className={inputClass}
                    placeholder="Σύνδεσμος Google Maps"
                    value={draft.googleMapsUrl}
                    onChange={(e) =>
                      setVenues((prev) => {
                        const next = [...prev] as [VenueDraft, VenueDraft];
                        next[index] = { ...draft, googleMapsUrl: e.target.value };
                        return next;
                      })
                    }
                  />
                </div>
              );
            })}
          </section>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#EDE8E3]/40">
          <div className="flex shrink-0 items-center justify-center gap-2 border-b border-[#EDE8E3] bg-white/80 px-4 py-3">
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                previewMode === "mobile"
                  ? "bg-[#3A1112] text-white"
                  : "text-[#6E6263] hover:bg-[#F9F8F6]"
              }`}
            >
              Κινητό
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                previewMode === "desktop"
                  ? "bg-[#3A1112] text-white"
                  : "text-[#6E6263] hover:bg-[#F9F8F6]"
              }`}
            >
              Desktop
            </button>
            <span className="ml-2 text-xs text-[#9C9293]">Ζωντανή προεπισκόπηση</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div
              className={`mx-auto overflow-hidden bg-white shadow-lg ${
                previewMode === "mobile"
                  ? "w-full max-w-[390px] rounded-[1.5rem] border border-[#EDE8E3]"
                  : "w-full max-w-4xl rounded-xl border border-[#EDE8E3]"
              }`}
            >
              <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
                <Template data={previewData} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

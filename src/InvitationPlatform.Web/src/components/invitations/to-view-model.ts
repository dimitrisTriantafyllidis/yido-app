import {
  isWeddingStyleId,
  type InvitationSectionState,
  type InvitationViewModel,
  type PublicInvitationPayload,
  type WeddingStyleId,
} from "./types";
import type { GuestWishItem } from "./extra-section-config";

function parseConfig(json: string | null): Record<string, unknown> {
  if (!json) return {};
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function getSectionState(
  payload: PublicInvitationPayload,
  sectionType: string
): InvitationSectionState {
  const section = payload.invitation.sections.find((s) => s.sectionType === sectionType);
  return {
    enabled: section?.isEnabled ?? false,
    config: parseConfig(section?.configurationJson ?? null),
  };
}

function sectionConfig(
  payload: PublicInvitationPayload,
  sectionType: string
): Record<string, unknown> {
  return getSectionState(payload, sectionType).config;
}

function str(config: Record<string, unknown>, key: string): string | null {
  const v = config[key];
  return typeof v === "string" && v.trim() ? v : null;
}

export function toInvitationViewModel(
  payload: PublicInvitationPayload,
  styleId: WeddingStyleId
): InvitationViewModel {
  const welcome = sectionConfig(payload, "welcome_text");
  const details = sectionConfig(payload, "event_details");
  const rsvp = sectionConfig(payload, "rsvp");
  const footer = sectionConfig(payload, "footer");
  const hero = sectionConfig(payload, "hero");

  const rsvpEnabled =
    payload.invitation.sections.find((s) => s.sectionType === "rsvp")?.isEnabled ?? true;

  const gallery = (payload.media ?? [])
    .filter((m) => m.mediaType === "Image")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      id: m.id,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      altText: m.altText,
    }));

  const guestName = payload.guest
    ? `${payload.guest.firstName} ${payload.guest.lastName}`.trim()
    : null;

  return {
    title: str(hero, "title") || payload.event.title,
    eventDate: payload.event.eventDate,
    description: payload.event.description,
    coverImageUrl: payload.event.coverImageUrl,
    locale: payload.event.locale || "el",
    slug: payload.event.slug,
    styleId,
    eyebrow: str(hero, "subtitle"),
    dressCode: str(details, "dressCode"),
    welcomeText:
      str(welcome, "text") ||
      payload.event.description ||
      null,
    footerText: str(footer, "text") || "Σας περιμένουμε με χαρά!",
    rsvpDeadline: str(rsvp, "deadline"),
    venues: payload.event.venues ?? [],
    persons: payload.event.persons ?? [],
    gallery,
    rsvp: {
      enabled: rsvpEnabled,
      inviteToken: payload.guest?.inviteToken ?? null,
      guestName,
      questions: payload.rsvpQuestions ?? [],
    },
    wishes: (payload.wishes ?? []).map((w): GuestWishItem => ({
      id: w.id,
      name: w.name,
      message: w.message,
      createdAt: w.createdAt,
    })),
    sections: {
      video: getSectionState(payload, "video"),
      coupleGallery: getSectionState(payload, "gallery"),
      weddingCast: getSectionState(payload, "participants"),
      wishes: getSectionState(payload, "wishes"),
      quiz: getSectionState(payload, "quiz"),
      vendors: getSectionState(payload, "vendors"),
    },
  };
}

export function resolveWeddingStyle(
  category: string | null | undefined
): WeddingStyleId | null {
  const c = (category ?? "").toLowerCase();
  return isWeddingStyleId(c) ? c : null;
}

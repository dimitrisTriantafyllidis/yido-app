import type { GuestWishItem } from "./extra-section-config";

export const WEDDING_STYLE_IDS = [
  "rustic",
  "boho",
  "minimal",
  "vintage",
  "elegant",
  "floral",
  "wreath",
  "dusty",
  "greengold",
  "geometric",
] as const;

export type WeddingStyleId = (typeof WEDDING_STYLE_IDS)[number];

export function isWeddingStyleId(value: string | null | undefined): value is WeddingStyleId {
  return !!value && (WEDDING_STYLE_IDS as readonly string[]).includes(value);
}

export interface InvitationVenue {
  id: string;
  name: string;
  venueType: string;
  address: string;
  city: string;
  googleMapsUrl: string | null;
  time: string | null;
}

export interface InvitationPerson {
  id: string;
  role: string;
  displayName: string;
  side: string | null;
  photoUrl: string | null;
}

export interface InvitationGalleryItem {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
}

export interface InvitationRsvpQuestion {
  id: string;
  prompt: string;
  questionType: string;
  optionsJson: string | null;
  isRequired: boolean;
  sortOrder: number;
}

export interface InvitationSectionState {
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface InvitationViewModel {
  title: string;
  eventDate: string | null;
  description: string | null;
  coverImageUrl: string | null;
  locale: string;
  slug: string;
  styleId: WeddingStyleId;
  isPreview?: boolean;
  /** Short hero line above the title (from hero.subtitle). */
  eyebrow: string | null;
  dressCode: string | null;
  welcomeText: string | null;
  footerText: string | null;
  rsvpDeadline: string | null;
  venues: InvitationVenue[];
  persons: InvitationPerson[];
  gallery: InvitationGalleryItem[];
  rsvp: {
    enabled: boolean;
    inviteToken: string | null;
    guestName: string | null;
    questions: InvitationRsvpQuestion[];
  };
  wishes: GuestWishItem[];
  sections: {
    video: InvitationSectionState;
    coupleGallery: InvitationSectionState;
    weddingCast: InvitationSectionState;
    wishes: InvitationSectionState;
    quiz: InvitationSectionState;
    vendors: InvitationSectionState;
  };
}

/** Raw by-slug API payload (subset used by mapper). */
export interface PublicInvitationPayload {
  event: {
    id: string;
    title: string;
    eventType: string;
    eventDate: string | null;
    slug: string;
    locale: string;
    description: string | null;
    coverImageUrl: string | null;
    venues: InvitationVenue[];
    persons: InvitationPerson[];
  };
  invitation: {
    id: string;
    template?: { id: string; name: string; eventType: string; category?: string | null };
    sections: {
      id: string;
      sectionType: string;
      sortOrder: number;
      isEnabled: boolean;
      configurationJson: string | null;
    }[];
  };
  media?: {
    id: string;
    mediaType: string;
    altText: string | null;
    sortOrder: number;
    url: string;
    thumbnailUrl: string | null;
  }[];
  guest?: {
    firstName: string;
    lastName: string;
    inviteToken: string;
  } | null;
  rsvpQuestions?: InvitationRsvpQuestion[];
  wishes?: GuestWishItem[];
}

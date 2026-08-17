export type EventType = "wedding" | "baptism" | "party" | "corporate" | "other";
export type PackageTier = "basic" | "premium" | "gold";
export type RSVPStatus = "pending" | "confirmed" | "declined" | "maybe";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  type: EventType;
  date: string;
  time: string | null;
  description: string | null;
  couple_name_1: string | null;
  couple_name_2: string | null;
  template: string;
  package_tier: PackageTier;
  cover_image_url: string | null;
  invitation_pdf_url: string | null;
  agenda_pdf_url: string | null;
  is_published: boolean;
  settings: EventSettings;
  created_at: string;
  updated_at: string;
}

export interface EventSettings {
  show_rsvp: boolean;
  show_map: boolean;
  show_timeline: boolean;
  show_gallery: boolean;
  show_wishes?: boolean;
  allow_plus_ones: boolean;
  max_plus_ones: number;
  primary_color: string;
  secondary_color: string;
  custom_message: string | null;
}

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  show_rsvp: true,
  show_map: true,
  show_timeline: false,
  show_gallery: false,
  show_wishes: false,
  allow_plus_ones: true,
  max_plus_ones: 2,
  primary_color: "#4F46E5",
  secondary_color: "#818CF8",
  custom_message: null,
};

export interface Guest {
  id: string;
  event_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvp_status: RSVPStatus;
  plus_ones: number;
  dietary_notes: string | null;
  table_number: number | null;
  group_name: string | null;
  invited_at: string;
  responded_at: string | null;
}

export interface EventLocation {
  id: string;
  event_id: string;
  type: "ceremony" | "reception" | "party" | "other";
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  time: string | null;
  notes: string | null;
}

export interface TimelineItem {
  id: string;
  event_id: string;
  time: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface GalleryPhoto {
  id: string;
  event_id: string;
  uploaded_by: string | null;
  url: string;
  caption: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface Wish {
  id: string;
  event_id: string;
  guest_name: string;
  message: string;
  created_at: string;
}

export interface PackageInfo {
  tier: PackageTier;
  name: string;
  price: number;
  featureKeys: string[];
}

export const PACKAGES: PackageInfo[] = [
  {
    tier: "basic",
    name: "Basic",
    price: 49,
    featureKeys: [
      "pkg.basic.f1",
      "pkg.basic.f2",
      "pkg.basic.f3",
      "pkg.basic.f4",
      "pkg.basic.f5",
      "pkg.basic.f6",
    ],
  },
  {
    tier: "premium",
    name: "Premium",
    price: 99,
    featureKeys: [
      "pkg.premium.f1",
      "pkg.premium.f2",
      "pkg.premium.f3",
      "pkg.premium.f4",
      "pkg.premium.f5",
      "pkg.premium.f6",
      "pkg.premium.f7",
      "pkg.premium.f8",
    ],
  },
  {
    tier: "gold",
    name: "Gold",
    price: 179,
    featureKeys: [
      "pkg.gold.f1",
      "pkg.gold.f2",
      "pkg.gold.f3",
      "pkg.gold.f4",
      "pkg.gold.f5",
      "pkg.gold.f6",
      "pkg.gold.f7",
      "pkg.gold.f8",
    ],
  },
];

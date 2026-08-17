import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(["wedding", "baptism", "party", "corporate", "other"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  couple_name_1: z.string().max(100).nullable().optional(),
  couple_name_2: z.string().max(100).nullable().optional(),
  template: z.string().default("classic"),
  package_tier: z.enum(["basic", "premium", "gold"]).default("basic"),
});

export const guestSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  group_name: z.string().max(100).nullable().optional(),
});

export const rsvpSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email().nullable().optional(),
  rsvp_status: z.enum(["confirmed", "declined", "maybe"]),
  plus_ones: z.number().int().min(0).max(10).default(0),
  dietary_notes: z.string().max(500).nullable().optional(),
});

export const locationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  type: z.enum(["ceremony", "reception", "party", "other"]).default("reception"),
  time: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const timelineItemSchema = z.object({
  time: z.string().min(1, "Time is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
});

export const eventSettingsSchema = z.object({
  show_rsvp: z.boolean(),
  show_map: z.boolean(),
  show_timeline: z.boolean(),
  show_gallery: z.boolean(),
  show_wishes: z.boolean().optional(),
  allow_plus_ones: z.boolean(),
  max_plus_ones: z.number().int().min(0).max(10),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  custom_message: z.string().max(1000).nullable(),
});

export const wishSchema = z.object({
  event_id: z.string().uuid(),
  guest_name: z.string().min(1, "Name is required").max(200),
  message: z.string().min(1, "Message is required").max(1000),
});

export const checkoutSchema = z.object({
  eventId: z.string().uuid(),
  packageTier: z.enum(["basic", "premium", "gold"]),
});

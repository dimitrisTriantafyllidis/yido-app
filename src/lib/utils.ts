import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

export function formatDate(date: string, locale: string = "el-GR"): string {
  return new Date(date).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}

export function daysUntilEvent(eventDate: string): number {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = event.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getRsvpStats(guests: { rsvp_status: string; plus_ones: number }[]) {
  const confirmed = guests.filter((g) => g.rsvp_status === "confirmed");
  const declined = guests.filter((g) => g.rsvp_status === "declined");
  const pending = guests.filter((g) => g.rsvp_status === "pending");
  const maybe = guests.filter((g) => g.rsvp_status === "maybe");

  const totalAttending = confirmed.reduce((sum, g) => sum + 1 + g.plus_ones, 0);

  return {
    total: guests.length,
    confirmed: confirmed.length,
    declined: declined.length,
    pending: pending.length,
    maybe: maybe.length,
    totalAttending,
  };
}

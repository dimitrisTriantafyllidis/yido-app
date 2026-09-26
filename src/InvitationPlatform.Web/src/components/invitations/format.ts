const LOCALE_MAP: Record<string, string> = {
  el: "el-GR",
  en: "en-GB",
};

export function formatEventDate(
  dateStr: string | null | undefined,
  locale = "el",
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(LOCALE_MAP[locale] ?? "el-GR", options ?? {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatEventDateShort(
  dateStr: string | null | undefined,
  locale = "el"
): string {
  return formatEventDate(dateStr, locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatWeekday(
  dateStr: string | null | undefined,
  locale = "el"
): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(LOCALE_MAP[locale] ?? "el-GR", { weekday: "long" });
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  // already "HH:mm" or "17:00"
  return time.length >= 5 ? time.slice(0, 5) : time;
}

export function formatVenueLocation(city: string, address: string): string {
  return [address, city].filter(Boolean).join(", ");
}

export function primaryVenueTime(
  venues: { time: string | null; venueType: string }[]
): string {
  const ceremony =
    venues.find((v) => v.venueType === "Church" || v.venueType === "Ceremony") ??
    venues[0];
  return formatTime(ceremony?.time ?? null);
}

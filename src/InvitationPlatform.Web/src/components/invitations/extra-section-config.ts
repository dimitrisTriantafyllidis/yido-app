export const PERSON_ROLE_LABELS: Record<string, string> = {
  Bride: "Νύφη",
  Groom: "Γαμπρός",
  Father: "Πατέρας",
  Mother: "Μητέρα",
  BestMan: "Κουμπάρος",
  MaidOfHonor: "Κουμπάρα",
  Godparent: "Νονός/Νονά",
  Sponsor: "Ανάδοχος",
  Organizer: "Οργανωτής",
  Custom: "Άλλο",
};

export const PERSON_ROLES = [
  "Bride",
  "Groom",
  "Father",
  "Mother",
  "BestMan",
  "MaidOfHonor",
  "Godparent",
  "Sponsor",
  "Organizer",
  "Custom",
] as const;

export interface QuizQuestionConfig {
  q: string;
  options: string[];
  correct: number;
  emoji: string;
}

export interface VendorConfig {
  name: string;
  category: string;
  website?: string;
  logo?: string;
  description?: string;
}

export interface GuestWishItem {
  id?: string;
  name: string;
  message: string;
  createdAt?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseQuizQuestions(config: Record<string, unknown>): QuizQuestionConfig[] {
  const raw = config.questions;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const rec = asRecord(item);
      if (!rec) return null;
      const q = typeof rec.q === "string" ? rec.q.trim() : "";
      const options = Array.isArray(rec.options)
        ? rec.options.filter((o): o is string => typeof o === "string").map((o) => o.trim())
        : [];
      const correct = typeof rec.correct === "number" ? rec.correct : Number(rec.correct);
      const emoji = typeof rec.emoji === "string" && rec.emoji.trim() ? rec.emoji : "💍";
      if (!q || options.length < 2) return null;
      return {
        q,
        options,
        correct: Number.isInteger(correct) && correct >= 0 && correct < options.length ? correct : 0,
        emoji,
      };
    })
    .filter((q): q is QuizQuestionConfig => q !== null);
}

export function parseVendors(config: Record<string, unknown>): VendorConfig[] {
  const raw = config.vendors;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const rec = asRecord(item);
      if (!rec) return null;
      const name = typeof rec.name === "string" ? rec.name.trim() : "";
      if (!name) return null;
      return {
        name,
        category: typeof rec.category === "string" ? rec.category.trim() : "",
        website: typeof rec.website === "string" ? rec.website.trim() : "",
        logo: typeof rec.logo === "string" ? rec.logo.trim() : "",
        description: typeof rec.description === "string" ? rec.description.trim() : "",
      };
    })
    .filter((v): v is VendorConfig => v !== null);
}

export function emptyQuizQuestion(): QuizQuestionConfig {
  return { q: "", options: ["", "", "", ""], correct: 0, emoji: "💍" };
}

export function emptyVendor(): VendorConfig {
  return { name: "", category: "", website: "", description: "" };
}

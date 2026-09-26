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

  const questions: QuizQuestionConfig[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) continue;
    const q = typeof rec.q === "string" ? rec.q.trim() : "";
    const options = Array.isArray(rec.options)
      ? rec.options.filter((o): o is string => typeof o === "string").map((o) => o.trim())
      : [];
    const correct = typeof rec.correct === "number" ? rec.correct : Number(rec.correct);
    const emoji = typeof rec.emoji === "string" && rec.emoji.trim() ? rec.emoji : "💍";
    if (!q || options.length < 2) continue;
    questions.push({
      q,
      options,
      correct: Number.isInteger(correct) && correct >= 0 && correct < options.length ? correct : 0,
      emoji,
    });
  }
  return questions;
}

export function parseVendors(config: Record<string, unknown>): VendorConfig[] {
  const raw = config.vendors;
  if (!Array.isArray(raw)) return [];

  const vendors: VendorConfig[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) continue;
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    if (!name) continue;
    vendors.push({
      name,
      category: typeof rec.category === "string" ? rec.category.trim() : "",
      website: typeof rec.website === "string" ? rec.website.trim() : "",
      logo: typeof rec.logo === "string" ? rec.logo.trim() : "",
      description: typeof rec.description === "string" ? rec.description.trim() : "",
    });
  }
  return vendors;
}

export function emptyQuizQuestion(): QuizQuestionConfig {
  return { q: "", options: ["", "", "", ""], correct: 0, emoji: "💍" };
}

export function emptyVendor(): VendorConfig {
  return { name: "", category: "", website: "", description: "" };
}

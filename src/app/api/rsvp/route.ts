import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rsvpSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = rateLimit(`rsvp:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = rsvpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Verify event exists and is published
  const { data: event } = await supabase
    .from("events")
    .select("id, is_published, settings")
    .eq("id", parsed.data.event_id)
    .single();

  if (!event || !event.is_published) {
    return NextResponse.json(
      { error: "Event not found or not published" },
      { status: 404 }
    );
  }

  // Enforce plus_ones limits from event settings
  const settings = event.settings as { allow_plus_ones: boolean; max_plus_ones: number };
  const plusOnes = settings.allow_plus_ones
    ? Math.min(parsed.data.plus_ones, settings.max_plus_ones)
    : 0;

  const { error } = await supabase.from("guests").insert({
    event_id: parsed.data.event_id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    rsvp_status: parsed.data.rsvp_status,
    plus_ones: plusOnes,
    dietary_notes: parsed.data.dietary_notes || null,
    responded_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

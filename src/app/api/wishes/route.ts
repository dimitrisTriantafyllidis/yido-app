import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { wishSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = rateLimit(`wishes:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = wishSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Verify event exists and is published with wishes enabled
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

  const settings = event.settings as { show_wishes?: boolean };
  if (!settings.show_wishes) {
    return NextResponse.json(
      { error: "Wish book is not enabled for this event" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("wishes")
    .insert({
      event_id: parsed.data.event_id,
      guest_name: parsed.data.guest_name,
      message: parsed.data.message,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save wish" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}

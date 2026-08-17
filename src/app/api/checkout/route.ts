import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { PACKAGES } from "@/lib/types";
import { checkoutSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(request: Request) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success: rateLimitOk } = rateLimit(`checkout:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { eventId, packageTier } = parsed.data;

  // Verify event ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, user_id")
    .eq("id", eventId)
    .single();

  if (!event || event.user_id !== user.id) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const pkg = PACKAGES.find((p) => p.tier === packageTier);
  if (!pkg) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `YIDO ${pkg.name} Package`,
            description: `YIDO ${pkg.name} event package`,
          },
          unit_amount: pkg.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${appUrl}/dashboard/events/${eventId}?payment=success`,
    cancel_url: `${appUrl}/dashboard/events/${eventId}?payment=cancelled`,
    metadata: {
      userId: user.id,
      eventId,
      packageTier,
    },
  });

  await supabase.from("payments").insert({
    user_id: user.id,
    event_id: eventId,
    stripe_session_id: session.id,
    amount: pkg.price * 100,
    package_tier: packageTier,
    status: "pending",
  });

  return NextResponse.json({ url: session.url });
}

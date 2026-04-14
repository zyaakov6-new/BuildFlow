import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@/lib/supabase/server";

// ── Paddle webhook signature verification ─────────────────────────────────
// Header format: "ts=<timestamp>;h1=<hex-signature>"
function verifyPaddleSignature(body: string, signatureHeader: string, secret: string): boolean {
  try {
    const parts = Object.fromEntries(
      signatureHeader.split(";").map((p) => p.split("=", 2) as [string, string])
    );
    const ts  = parts["ts"];
    const h1  = parts["h1"];
    if (!ts || !h1) return false;

    const payload = `${ts}:${body}`;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    return timingSafeEqual(Buffer.from(h1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// ── Types ──────────────────────────────────────────────────────────────────
interface PaddleWebhookEvent {
  event_type: string;
  data: {
    id: string;
    status?: string;
    customer_id?: string;
    custom_data?: Record<string, string>;
    scheduled_change?: { action: string } | null;
    current_billing_period?: { ends_at: string } | null;
    items?: Array<{ price?: { id: string; name?: string } }>;
  };
}

// Helper — bypasses stale Supabase generated types for new subscription columns
async function updateProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  patch: Record<string, unknown>,
) {
  // @ts-ignore — subscription columns added via migration, not yet in generated types
  return supabase.from("profiles").update(patch).eq("id", userId);
}

function resolvePlan(items: PaddleWebhookEvent["data"]["items"]): string {
  const name = items?.[0]?.price?.name?.toLowerCase() ?? "";
  if (name.includes("annual") || name.includes("שנתי")) return "annual";
  return "premium";
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body      = await req.text();
  const sigHeader = req.headers.get("paddle-signature") ?? "";
  const secret    = process.env.PADDLE_WEBHOOK_SECRET ?? "";

  if (secret && !verifyPaddleSignature(body, sigHeader, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: PaddleWebhookEvent;
  try {
    event = JSON.parse(body) as PaddleWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = await createClient();
  const userId   = event.data.custom_data?.supabase_user_id;
  const custId   = event.data.customer_id ?? null;

  if (!userId) {
    console.warn("Paddle webhook: no supabase_user_id in custom_data", event.event_type);
    return NextResponse.json({ received: true });
  }

  switch (event.event_type) {
    case "subscription.activated": {
      const plan      = resolvePlan(event.data.items);
      const periodEnd = event.data.current_billing_period?.ends_at ?? null;
      await updateProfile(supabase, userId, {
        subscription_status:     "active",
        subscription_plan:       plan,
        subscription_period_end: periodEnd,
        stripe_customer_id:      custId,   // reuse column for Paddle customer ID
      });
      break;
    }

    case "subscription.updated": {
      const plan      = resolvePlan(event.data.items);
      const periodEnd = event.data.current_billing_period?.ends_at ?? null;
      const isCanceling = event.data.scheduled_change?.action === "cancel";
      await updateProfile(supabase, userId, {
        subscription_status:     isCanceling ? "canceling" : (event.data.status ?? "active"),
        subscription_plan:       plan,
        subscription_period_end: periodEnd,
      });
      break;
    }

    case "subscription.canceled": {
      await updateProfile(supabase, userId, {
        subscription_status:     "free",
        subscription_plan:       "free",
        subscription_period_end: null,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

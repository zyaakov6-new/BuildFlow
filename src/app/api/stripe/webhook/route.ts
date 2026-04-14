import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2026-03-25.dahlia" as any,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  // Helper — bypasses stale generated types for new subscription columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProfile = (userId: string, patch: Record<string, unknown>) =>
    // @ts-ignore
    supabase.from("profiles").update(patch).eq("id", userId);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId  = session.metadata?.supabase_user_id;
      const plan    = session.metadata?.plan ?? "premium";
      if (!userId) break;

      // Retrieve subscription to get period_end
      const subId = typeof session.subscription === "string" ? session.subscription : null;
      let periodEnd: string | null = null;
      if (subId) {
        // @ts-ignore — current_period_end exists at runtime on Subscription objects
        const sub = (await stripe.subscriptions.retrieve(subId)) as Stripe.Subscription & { current_period_end: number };
        periodEnd = new Date(sub.current_period_end * 1000).toISOString();
      }

      await updateProfile(userId, {
        subscription_status:     "active",
        subscription_plan:       plan,
        subscription_period_end: periodEnd,
        stripe_customer_id:      typeof session.customer === "string" ? session.customer : null,
      });
      break;
    }

    case "customer.subscription.updated": {
      // @ts-ignore
      const sub    = event.data.object as Stripe.Subscription & { current_period_end: number };
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      const plan   = sub.metadata?.plan ?? "premium";
      const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "inactive";

      await updateProfile(userId, {
        subscription_status:     status,
        subscription_plan:       status === "active" ? plan : "free",
        subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      await updateProfile(userId, {
        subscription_status:     "free",
        subscription_plan:       "free",
        subscription_period_end: null,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

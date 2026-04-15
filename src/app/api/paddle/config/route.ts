import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns Paddle client config to authenticated users only.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    token:  (process.env.PADDLE_CLIENT_TOKEN  ?? "").trim().replace(/^["']|["']$/g, ""),
    prices: {
      premium: (process.env.PADDLE_PRICE_PREMIUM_MONTHLY ?? "").trim().replace(/^["']|["']$/g, ""),
      annual:  (process.env.PADDLE_PRICE_ANNUAL           ?? "").trim().replace(/^["']|["']$/g, ""),
    },
  });
}

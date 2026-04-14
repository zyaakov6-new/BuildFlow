import { NextResponse } from "next/server";

/**
 * Returns Paddle client config to the browser.
 * Reads from server-side env vars so no NEXT_PUBLIC_ compile-time baking is needed.
 * Client token and price IDs are not secrets — they're meant to be in the browser.
 */
export async function GET() {
  return NextResponse.json({
    token:  (process.env.PADDLE_CLIENT_TOKEN  ?? "").trim().replace(/^["']|["']$/g, ""),
    prices: {
      premium: (process.env.PADDLE_PRICE_PREMIUM_MONTHLY ?? "").trim().replace(/^["']|["']$/g, ""),
      annual:  (process.env.PADDLE_PRICE_ANNUAL           ?? "").trim().replace(/^["']|["']$/g, ""),
    },
  });
}

/**
 * Paddle Billing client-side helper.
 * Lazy-loads Paddle.js overlay on first call.
 */
import type { Paddle, CheckoutOpenOptions } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;

async function getPaddle(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance;

  const { initializePaddle } = await import("@paddle/paddle-js");

  // Trim and strip surrounding quotes that some .env parsers leave behind
  const raw   = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
  const token = raw.trim().replace(/^["']|["']$/g, "");

  if (!token) throw new Error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured");

  const env = token.startsWith("live_") ? "production" : "sandbox";

  paddleInstance = await initializePaddle({ token, environment: env }) ?? null;
  if (!paddleInstance) throw new Error("Paddle failed to initialize — check your client token");

  return paddleInstance;
}

export async function openPaddleCheckout(opts: CheckoutOpenOptions) {
  const paddle = await getPaddle();
  paddle.Checkout.open(opts);
}

/** Returns the price ID for a plan, cleaned from env var quotes. */
function cleanEnv(key: string): string {
  return (key ?? "").trim().replace(/^["']|["']$/g, "");
}

export const PADDLE_PRICES = {
  get premium() { return cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM_MONTHLY ?? ""); },
  get annual()  { return cleanEnv(process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL ?? ""); },
};

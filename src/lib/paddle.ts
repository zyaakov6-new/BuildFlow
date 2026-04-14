/**
 * Paddle Billing client-side helper.
 *
 * Loads Paddle.js once and exposes openCheckout() and openPortal().
 * Uses the @paddle/paddle-js package.
 */
import type { Paddle, CheckoutOpenOptions } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;

async function getPaddle(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance;
  const { initializePaddle } = await import("@paddle/paddle-js");
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) throw new Error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set");
  paddleInstance = await initializePaddle({
    token,
    environment: token.startsWith("live_") ? "production" : "sandbox",
  }) ?? null;
  if (!paddleInstance) throw new Error("Paddle failed to initialize");
  return paddleInstance;
}

export async function openPaddleCheckout(opts: CheckoutOpenOptions) {
  const paddle = await getPaddle();
  paddle.Checkout.open(opts);
}

export const PADDLE_PRICES = {
  premium: process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM_MONTHLY ?? "",
  annual:  process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL          ?? "",
} as const;

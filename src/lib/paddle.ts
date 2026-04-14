/**
 * Paddle Billing client-side helper.
 *
 * Config (token + price IDs) is fetched from /api/paddle/config on first use
 * so it never depends on NEXT_PUBLIC_ compile-time inlining.
 */
import type { Paddle, CheckoutOpenOptions } from "@paddle/paddle-js";

interface PaddleConfig {
  token:  string;
  prices: { premium: string; annual: string };
}

let cachedConfig:  PaddleConfig | null = null;
let paddleInstance: Paddle | null = null;

async function getConfig(): Promise<PaddleConfig> {
  if (cachedConfig) return cachedConfig;
  const res = await fetch("/api/paddle/config");
  if (!res.ok) throw new Error(`Failed to load Paddle config (${res.status})`);
  cachedConfig = (await res.json()) as PaddleConfig;
  return cachedConfig;
}

async function getPaddle(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance;

  const { initializePaddle } = await import("@paddle/paddle-js");
  const { token } = await getConfig();

  if (!token) throw new Error("Paddle client token is not configured on the server");

  const env = token.startsWith("live_") ? "production" : "sandbox";
  paddleInstance = await initializePaddle({ token, environment: env }) ?? null;
  if (!paddleInstance) throw new Error("Paddle failed to initialize — check the client token");

  return paddleInstance;
}

export async function openPaddleCheckout(opts: CheckoutOpenOptions) {
  const paddle = await getPaddle();
  paddle.Checkout.open(opts);
}

/** Fetches the price ID for a plan from the server. */
export async function getPaddlePriceId(plan: "premium" | "annual"): Promise<string> {
  const config = await getConfig();
  return config.prices[plan] ?? "";
}

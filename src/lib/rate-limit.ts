/**
 * AI usage rate limiting. Backed by the `ai_usage` table + `bump_ai_usage`
 * RPC (see migration `ai_usage_rate_limiting`). Atomic per (user, date).
 *
 * Premium users can be given a higher cap — caller passes the cap in.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const DAILY_CAP_FREE    = 20;
export const DAILY_CAP_PREMIUM = 100;

export async function bumpAndCheckAIUsage(
  supabase: SupabaseClient,
  userId: string,
  cap: number,
): Promise<{ ok: true; count: number } | { ok: false; count: number; cap: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("bump_ai_usage", { p_user_id: userId });
  if (error) {
    // Fail open rather than block users if the RPC ever breaks
    console.error("[rate-limit] bump_ai_usage error:", error);
    return { ok: true, count: 0 };
  }
  const count = (data as number) ?? 0;
  if (count > cap) return { ok: false, count, cap };
  return { ok: true, count };
}

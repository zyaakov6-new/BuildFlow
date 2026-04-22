/**
 * Deterministic A/B paywall variant assignment. Variant 0 or 1 per user,
 * based on a stable hash of user.id so the same user always sees the same
 * variant. Tracked per-user on profiles.paywall_variant so we can analyze
 * conversion later.
 *
 * Call this server-side on first premium-pitch render; persists the variant
 * and returns it.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type PaywallVariant = 0 | 1;

export const PAYWALL_COPY: Record<PaywallVariant, {
  headline: string;
  subhead: string;
  cta: string;
  bullets: string[];
}> = {
  0: {
    headline: "הצעות ללא הגבלה, לכל ילד",
    subhead: "AI שמכיר את המשפחה שלך, ומציע כל יום משהו חדש.",
    cta: "שדרג לפרימיום",
    bullets: [
      "הצעות ללא הגבלה מכל ילד",
      "תזכורות חכמות בוואטסאפ",
      "תובנות חודשיות על הקשר",
    ],
  },
  1: {
    headline: "עוד 10 דקות ביום עם הילדים — שווה את זה",
    subhead: "שדרג וגלה איך זה מרגיש לגדול משפחה שמתחברת כל יום.",
    cta: "התחל את חודש הפרימיום",
    bullets: [
      "לא יותר ספירת הצעות",
      "התראות ברגעים הנכונים",
      "גיבוי היסטוריית הרגעים",
    ],
  },
};

function hashUserId(id: string): PaywallVariant {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((h & 1) === 0 ? 0 : 1) as PaywallVariant;
}

export async function getPaywallVariant(
  supabase: SupabaseClient,
  userId: string,
): Promise<PaywallVariant> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("profiles")
    .select("paywall_variant")
    .eq("id", userId)
    .maybeSingle();

  if (data?.paywall_variant === 0 || data?.paywall_variant === 1) {
    return data.paywall_variant as PaywallVariant;
  }

  const variant = hashUserId(userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("profiles").update({ paywall_variant: variant }).eq("id", userId);
  return variant;
}

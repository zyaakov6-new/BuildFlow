import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import webpush, { type PushSubscription } from "web-push";

/**
 * Cron endpoint that sends Web Push notifications for moments scheduled
 * in the next 45–90 minutes. Configured in vercel.json to run every 15 min.
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` header — Vercel cron
 * sends this automatically when `crons[].headers` is set (we rely on the
 * Vercel-provided header for cron requests, and also allow the env shortcut
 * `?secret=<CRON_SECRET>` for manual testing).
 *
 * Required env vars:
 *   CRON_SECRET
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT   (e.g. "mailto:you@example.com")
 */

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization") ?? "";
  const qsSecret = req.nextUrl.searchParams.get("secret") ?? "";
  if (!secret || (authHeader !== `Bearer ${secret}` && qsSecret !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    VAPID_SUBJECT,
  } = process.env;

  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "missing_supabase_env" }, { status: 500 });
  }
  if (!NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    return NextResponse.json({ error: "missing_vapid_env" }, { status: 500 });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const admin = createAdminClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Window: moments scheduled 45–90 min from now that haven't been pushed.
  const now = new Date();
  const from = new Date(now.getTime() + 45 * 60_000);
  const to   = new Date(now.getTime() + 90 * 60_000);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: moments, error: momentsErr } = await (admin as any)
    .from("saved_moments")
    .select("id, user_id, title, scheduled_at, last_push_sent_at")
    .eq("completed", false)
    .is("last_push_sent_at", null)
    .gte("scheduled_at", from.toISOString())
    .lte("scheduled_at", to.toISOString());

  if (momentsErr) {
    console.error("[push/send-upcoming] moments query error:", momentsErr);
    return NextResponse.json({ error: "moments_query_failed" }, { status: 500 });
  }

  const momentsList = (moments ?? []) as Array<{
    id: string; user_id: string; title: string; scheduled_at: string;
  }>;

  if (momentsList.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  // Fetch subscriptions for all affected users in one query.
  const userIds = Array.from(new Set(momentsList.map((m) => m.user_id)));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (admin as any)
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  const subsByUser = new Map<string, Array<{ endpoint: string; p256dh: string; auth: string }>>();
  for (const s of (subs ?? []) as Array<{ user_id: string; endpoint: string; p256dh: string; auth: string }>) {
    const arr = subsByUser.get(s.user_id) ?? [];
    arr.push({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth });
    subsByUser.set(s.user_id, arr);
  }

  let sent = 0;
  const deadEndpoints: string[] = [];

  for (const m of momentsList) {
    const userSubs = subsByUser.get(m.user_id) ?? [];
    if (userSubs.length === 0) continue;

    const payload = JSON.stringify({
      title: "רגע בעוד שעה 🧡",
      body: m.title,
      url: "/dashboard",
    });

    for (const s of userSubs) {
      try {
        const sub: PushSubscription = {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        };
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (err as any)?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          deadEndpoints.push(s.endpoint);
        } else {
          console.error("[push/send-upcoming] send error:", err);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from("saved_moments")
      .update({ last_push_sent_at: new Date().toISOString() })
      .eq("id", m.id);
  }

  // Clean up dead subscriptions.
  if (deadEndpoints.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from("push_subscriptions").delete().in("endpoint", deadEndpoints);
  }

  return NextResponse.json({ ok: true, sent, pruned: deadEndpoints.length });
}

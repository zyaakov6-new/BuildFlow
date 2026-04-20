/**
 * Client-side Web Push helpers.
 *
 * Call `enablePushNotifications()` from a user-gesture handler (button click).
 * Requires NEXT_PUBLIC_VAPID_PUBLIC_KEY env var with your VAPID public key.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function enablePushNotifications(): Promise<
  | { ok: true }
  | { ok: false; reason: "unsupported" | "denied" | "no_vapid" | "error"; message?: string }
> {
  if (typeof window === "undefined") return { ok: false, reason: "unsupported" };
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "unsupported" };
  }

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) return { ok: false, reason: "no_vapid" };

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, reason: "denied" };

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid).buffer as ArrayBuffer,
      });
    }

    const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
        user_agent: navigator.userAgent,
      }),
    });

    if (!res.ok) return { ok: false, reason: "error", message: await res.text() };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "error", message: String(e) };
  }
}

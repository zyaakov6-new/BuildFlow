# Web Push Notifications — Setup

The client + DB + subscribe endpoint are scaffolded. To actually send notifications:

## 1. Generate VAPID keys
```bash
npx web-push generate-vapid-keys
```

## 2. Add env vars
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN...                    # (browser)
VAPID_PRIVATE_KEY=...                                  # (server only)
VAPID_SUBJECT=mailto:z.yaakov@hotmail.com
```

## 3. Install web-push on the server
```bash
npm install web-push
```

## 4. Create a sender route (e.g. `/api/push/send`)
```ts
import webpush from "web-push";
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// For each push_subscriptions row:
await webpush.sendNotification(
  { endpoint, keys: { p256dh, auth } },
  JSON.stringify({ title: "רגע בעוד שעה!", body: "...", url: "/dashboard" })
);
```

## 5. Schedule reminders
Options:
- Vercel Cron: `vercel.json` with a cron that hits `/api/push/send-upcoming`
- Supabase `pg_cron`: schedule a SQL job that calls an Edge Function
- External: GitHub Actions cron hitting the endpoint

## 6. UI
Call `enablePushNotifications()` from `src/lib/push.ts` on a button click
(e.g. in SettingsScreen). The service worker's `push` + `notificationclick`
handlers are already in `public/sw.js`.

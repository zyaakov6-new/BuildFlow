# Sentry Setup (Pending)

The error tracking layer is scaffolded but NOT active. To enable:

## 1. Create a Sentry project
- Sign up at https://sentry.io
- Create a Next.js project
- Copy your DSN

## 2. Install the SDK
```bash
npm install @sentry/nextjs
```

## 3. Run the Sentry wizard (recommended)
```bash
npx @sentry/wizard@latest -i nextjs
```
This creates `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`,
and wraps `next.config.ts` with `withSentryConfig`.

## 4. Set env vars
Add to `.env.local` (and Vercel env):
```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/yyy
SENTRY_AUTH_TOKEN=sntrys_...    # for source maps, set in Vercel only
SENTRY_ORG=your-org
SENTRY_PROJECT=bondflow
```

## 5. Verify
- `src/components/ErrorBoundary.tsx` already forwards to `window.Sentry.captureException`
- `src/app/error.tsx` can be extended to call `Sentry.captureException(error)` in the `useEffect`
- Trigger a test error from any client component to verify

## 6. Hebrew user privacy
In `sentry.client.config.ts` set:
```ts
sendDefaultPii: false,
beforeSend(event) {
  // Scrub email addresses from error messages
  if (event.request?.cookies) delete event.request.cookies;
  return event;
}
```

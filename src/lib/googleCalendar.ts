// Google Calendar free-window fetcher
// Used by the suggestions route to find when the family is actually free this week.

const HEBREW_DAYS: Record<number, string> = {
  0: "ראשון", 1: "שני", 2: "שלישי", 3: "רביעי", 4: "חמישי", 5: "שישי", 6: "שבת",
};

function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

async function refreshGoogleToken(googleRefreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: googleRefreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches the user's Google Calendar busy times for the next 7 days
 * and returns free windows during family hours as Hebrew strings like:
 * "שלישי 17:00–19:30"
 *
 * Falls back gracefully to [] if the token is missing / expired / wrong scope.
 */
export async function getCalendarFreeWindows(
  accessToken: string,
  googleRefreshToken: string | null,
  onTokenRefreshed?: (newToken: string) => Promise<void>,
): Promise<string[]> {
  const now = new Date();
  const rangeEnd = new Date(now);
  rangeEnd.setDate(now.getDate() + 7);

  const reqBody = JSON.stringify({
    timeMin: now.toISOString(),
    timeMax: rangeEnd.toISOString(),
    timeZone: "Asia/Jerusalem",
    items: [{ id: "primary" }],
  });

  const callFreeBusy = (tok: string) =>
    fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
      body: reqBody,
    });

  let token = accessToken;
  let response = await callFreeBusy(token);

  // Token expired or missing scope — attempt refresh
  if ((response.status === 401 || response.status === 403) && googleRefreshToken) {
    const newTok = await refreshGoogleToken(googleRefreshToken);
    if (newTok) {
      token = newTok;
      await onTokenRefreshed?.(newTok);
      response = await callFreeBusy(token);
    }
  }

  if (!response.ok) return [];

  const data = await response.json() as {
    calendars?: { primary?: { busy?: { start: string; end: string }[] } };
  };
  const busyPeriods = data.calendars?.primary?.busy ?? [];

  // Group busy intervals by date (local time)
  const busyByDay = new Map<string, { start: number; end: number }[]>();
  for (const p of busyPeriods) {
    const s = new Date(p.start);
    const e = new Date(p.end);
    const key = s.toDateString();
    if (!busyByDay.has(key)) busyByDay.set(key, []);
    busyByDay.get(key)!.push({ start: toMinutes(s), end: toMinutes(e) });
  }

  const freeWindows: string[] = [];

  for (let d = 0; d < 7; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    day.setHours(0, 0, 0, 0);

    const dow = day.getDay(); // 0=Sun … 6=Sat
    const hebrewDay = HEBREW_DAYS[dow];

    // Family hours (Israel: Sun–Thu after school, Fri from afternoon, Sat all day)
    const familyStart = dow === 6 ? 10 * 60 : dow === 5 ? 14 * 60 : 16 * 60;
    const familyEnd = 22 * 60;

    const busy = (busyByDay.get(day.toDateString()) ?? []).sort((a, b) => a.start - b.start);

    // Subtract busy periods from family hours, emit free slots ≥ 30 min
    let cursor = familyStart;
    for (const b of busy) {
      if (b.end <= cursor) continue;
      if (b.start > cursor) {
        const freeEnd = Math.min(b.start, familyEnd);
        if (freeEnd - cursor >= 30) {
          freeWindows.push(`${hebrewDay} ${formatTime(cursor)}–${formatTime(freeEnd)}`);
        }
      }
      cursor = Math.max(cursor, b.end);
    }
    // Tail window after last busy period
    if (cursor < familyEnd && familyEnd - cursor >= 30) {
      freeWindows.push(`${hebrewDay} ${formatTime(cursor)}–${formatTime(familyEnd)}`);
    }
  }

  return freeWindows;
}

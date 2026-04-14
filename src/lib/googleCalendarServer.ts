/**
 * Server-side Google Calendar utilities.
 * Handles access token refresh automatically using stored refresh_token.
 * Requires GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in env vars.
 */

export interface GCalEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end:   { dateTime?: string; date?: string; timeZone?: string }
  description?: string
  location?: string
  colorId?: string
  source?: 'google'
}

/** Refresh an expired access token using the stored refresh token */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  })
  if (!res.ok) return null
  const json = await res.json()
  return (json.access_token as string) ?? null
}

/** Fetch events from the user's primary Google Calendar */
export async function fetchGCalEvents(
  accessToken: string,
  options: { timeMin: string; timeMax: string; maxResults?: number }
): Promise<{ events: GCalEvent[]; status: 'ok' | 'expired' | 'error' }> {
  const params = new URLSearchParams({
    timeMin:       options.timeMin,
    timeMax:       options.timeMax,
    singleEvents:  'true',
    orderBy:       'startTime',
    maxResults:    String(options.maxResults ?? 100),
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (res.status === 401) return { events: [], status: 'expired' }
  if (!res.ok)            return { events: [], status: 'error' }

  const data = await res.json()
  return { events: data.items ?? [], status: 'ok' }
}

/** Create a single event in the user's primary Google Calendar */
export async function createGCalEvent(
  accessToken: string,
  event: {
    title: string
    description?: string
    startISO: string
    endISO: string
    timeZone?: string
  }
): Promise<{ eventId: string | null; status: 'ok' | 'expired' | 'error' }> {
  const body = {
    summary:     event.title,
    description: event.description ?? '',
    start: { dateTime: event.startISO, timeZone: event.timeZone ?? 'Asia/Jerusalem' },
    end:   { dateTime: event.endISO,   timeZone: event.timeZone ?? 'Asia/Jerusalem' },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }] },
  }

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }
  )

  if (res.status === 401) return { eventId: null, status: 'expired' }
  if (!res.ok)            return { eventId: null, status: 'error' }
  const data = await res.json()
  return { eventId: data.id ?? null, status: 'ok' }
}

/**
 * Adds a saved moment to the user's primary Google Calendar.
 * Silently no-ops if no token is provided — the moment is still saved in our DB.
 */
export async function addToGoogleCalendar({
  accessToken,
  title,
  notes,
  scheduledAt,
  durationMin,
}: {
  accessToken: string
  title: string
  notes?: string | null
  scheduledAt?: string | null
  durationMin?: number | null
}): Promise<{ eventId: string } | null> {
  // If no scheduled time, default to tomorrow at 17:00
  const startDate = scheduledAt
    ? new Date(scheduledAt)
    : (() => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        d.setHours(17, 0, 0, 0)
        return d
      })()

  const endDate = new Date(startDate.getTime() + (durationMin ?? 30) * 60_000)

  const body = {
    summary: title,
    description: notes ?? '',
    start: { dateTime: startDate.toISOString(), timeZone: 'Asia/Jerusalem' },
    end: { dateTime: endDate.toISOString(), timeZone: 'Asia/Jerusalem' },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 30 }],
    },
  }

  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.warn('[googleCalendar] Failed to create event:', err)
      return null
    }

    const event = await res.json()
    return { eventId: event.id }
  } catch (e) {
    console.warn('[googleCalendar] Network error:', e)
    return null
  }
}

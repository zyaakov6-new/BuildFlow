import { createClient } from '@/lib/supabase/server'
import { createGCalEvent, refreshAccessToken } from '@/lib/googleCalendarServer'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ ok: false }, { status: 401 })

  const { title, startISO, endISO, description } = await request.json() as {
    title: string; startISO: string; endISO: string; description?: string
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('google_calendar_token, google_calendar_refresh_token')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.google_calendar_token) {
    return Response.json({ ok: false, reason: 'no_token' })
  }

  let result = await createGCalEvent(profile.google_calendar_token, { title, startISO, endISO, description })

  // Token expired — try refresh
  if (result.status === 'expired' && profile.google_calendar_refresh_token) {
    const newToken = await refreshAccessToken(profile.google_calendar_refresh_token)
    if (newToken) {
      await supabase.from('profiles').update({ google_calendar_token: newToken }).eq('id', user.id)
      result = await createGCalEvent(newToken, { title, startISO, endISO, description })
    }
  }

  return Response.json({ ok: result.status === 'ok', eventId: result.eventId })
}

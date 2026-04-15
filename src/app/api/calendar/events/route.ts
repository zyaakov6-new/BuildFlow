import { createClient } from '@/lib/supabase/server'
import { fetchGCalEvents, refreshAccessToken } from '@/lib/googleCalendarServer'
import { encryptToken, decryptToken } from '@/lib/encrypt'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ connected: false, events: [] }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('google_calendar_token, google_calendar_refresh_token')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.google_calendar_token) {
    return Response.json({ connected: false, events: [] })
  }

  const now     = new Date()
  const pastStart = new Date(now); pastStart.setHours(0, 0, 0, 0) // today midnight
  const futureEnd = new Date(now); futureEnd.setDate(now.getDate() + 7); futureEnd.setHours(23, 59, 59, 999)

  const options = {
    timeMin: pastStart.toISOString(),
    timeMax: futureEnd.toISOString(),
  }

  let result = await fetchGCalEvents(decryptToken(profile.google_calendar_token), options)

  // Token expired — try refresh
  if (result.status === 'expired' && profile.google_calendar_refresh_token) {
    const newToken = await refreshAccessToken(decryptToken(profile.google_calendar_refresh_token))
    if (newToken) {
      await supabase.from('profiles').update({ google_calendar_token: encryptToken(newToken) }).eq('id', user.id)
      result = await fetchGCalEvents(newToken, options)
    }
  }

  if (result.status === 'expired') {
    return Response.json({ connected: true, expired: true, events: [] })
  }

  return Response.json({ connected: true, expired: false, events: result.events })
}

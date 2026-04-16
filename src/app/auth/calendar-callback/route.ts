import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { encryptToken } from '@/lib/encrypt'

/**
 * Dedicated OAuth callback for Google Calendar connection.
 *
 * Flow:
 * 1. User (logged in as email account) clicks "connect calendar"
 * 2. Client stores original session + userId in localStorage / cookie
 * 3. signInWithOAuth redirects here via Google → Supabase → our domain
 * 4. We exchange the code (provider_token = Google Calendar token)
 * 5. We save the calendar token to the ORIGINAL user via admin client
 * 6. We redirect to /auth/restore-session so the client restores the original session
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?calendar_error=1', origin))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Exchange code — gets Google provider_token, may switch Supabase session
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !sessionData?.session?.provider_token) {
    return NextResponse.redirect(new URL('/dashboard?calendar_error=1', origin))
  }

  const providerToken = sessionData.session.provider_token
  const providerRefreshToken = sessionData.session.provider_refresh_token ?? null

  // Read the original user ID saved by the client before the redirect
  const originalUserId = cookieStore.get('__bf_cal_uid')?.value

  // Determine which user profile to update
  const targetUserId = originalUserId ?? sessionData.session.user.id

  // Use admin client so we can write to the ORIGINAL user's profile regardless
  // of which session exchangeCodeForSession set (handles cross-account case)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  await admin.from('profiles').update({
    google_calendar_token: encryptToken(providerToken),
    google_calendar_refresh_token: providerRefreshToken
      ? encryptToken(providerRefreshToken)
      : null,
  }).eq('id', targetUserId)

  // Clear the temporary cookie
  const response = NextResponse.redirect(new URL('/auth/restore-session', origin))
  response.cookies.set('__bf_cal_uid', '', { path: '/', maxAge: 0 })
  return response
}

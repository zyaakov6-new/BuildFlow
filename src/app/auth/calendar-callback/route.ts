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
 * 2. Client stores original user id in cookie
 * 3. signInWithOAuth redirects here via Google → Supabase → our domain
 * 4. We exchange the code (provider_token = Google Calendar token)
 * 5. We save the calendar token to the ORIGINAL user via admin client
 * 6. We redirect to /auth/restore-session so the client restores the original session
 *
 * Any failure here now redirects with ?calendar_error=<reason> so the client
 * can show a helpful message instead of an HTTP 500 page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const fail = (reason: string) => {
    console.error('[calendar-callback] failure:', reason)
    const url = new URL('/dashboard', origin)
    url.searchParams.set('calendar_error', reason)
    return NextResponse.redirect(url)
  }

  try {
    if (!code) return fail('no_code')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return fail('missing_supabase_env')
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('[calendar-callback] exchangeCodeForSession error:', exchangeError)
      return fail('exchange_failed')
    }
    if (!sessionData?.session?.provider_token) {
      return fail('no_provider_token')
    }

    const providerToken = sessionData.session.provider_token
    const providerRefreshToken = sessionData.session.provider_refresh_token ?? null

    // Read the original user ID saved by the client before the redirect
    const originalUserId = cookieStore.get('__bf_cal_uid')?.value
    const targetUserId = originalUserId ?? sessionData.session.user.id

    // Use admin client so we can write to the ORIGINAL user's profile regardless
    // of which session exchangeCodeForSession set (handles cross-account case).
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return fail('missing_service_role_key')
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )

    const { error: updateError } = await admin.from('profiles').update({
      google_calendar_token: encryptToken(providerToken),
      google_calendar_refresh_token: providerRefreshToken
        ? encryptToken(providerRefreshToken)
        : null,
    }).eq('id', targetUserId)

    if (updateError) {
      console.error('[calendar-callback] profile update error:', updateError)
      return fail('db_update_failed')
    }

    const response = NextResponse.redirect(new URL('/auth/restore-session', origin))
    response.cookies.set('__bf_cal_uid', '', { path: '/', maxAge: 0 })
    return response
  } catch (err) {
    console.error('[calendar-callback] unexpected error:', err)
    return fail('unexpected')
  }
}

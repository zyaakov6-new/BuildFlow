import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { encryptToken } from '@/lib/encrypt'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  // Guard against open-redirect: only allow same-origin relative paths
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'
  const type = searchParams.get('type')

  if (code) {
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
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/reset', origin))
      }

      // Ensure profile row exists (may be missing if previously deleted)
      const session = sessionData?.session
      if (session?.user) {
        await supabase.from('profiles').upsert({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name ?? null,
        }, { onConflict: 'id', ignoreDuplicates: true })
      }

      // Store Google Calendar token if present (from Google OAuth with calendar scope)
      if (session?.provider_token && session.user) {
        await supabase.from('profiles').upsert({
          id: session.user.id,
          google_calendar_token: encryptToken(session.provider_token),
          google_calendar_refresh_token: session.provider_refresh_token
            ? encryptToken(session.provider_refresh_token)
            : null,
        }, { onConflict: 'id' })
      }

      // Check if onboarding completed
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: onboarding } = await supabase
          .from('onboarding')
          .select('completed')
          .eq('user_id', user.id)
          .single()

        if (!onboarding?.completed) {
          return NextResponse.redirect(new URL('/onboarding', origin))
        }
      }
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL('/auth?error=auth_callback_error', origin))
}

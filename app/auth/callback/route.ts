import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create user record if it doesn't exist
      const { error: userError } = await supabase
        .from('users')
        .upsert(
          {
            id: data.user.id,
            email: data.user.email!,
          },
          {
            onConflict: 'id',
          }
        )

      if (!userError) {
        // Create profile if it doesn't exist
        await supabase
          .from('profile')
          .upsert(
            {
              user_id: data.user.id,
            },
            {
              onConflict: 'user_id',
            }
          )

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profile')
          .select('onboarding_completed_at')
          .eq('user_id', data.user.id)
          .single()

        // Redirect to onboarding if not completed
        if (!profile?.onboarding_completed_at) {
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }
      }
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

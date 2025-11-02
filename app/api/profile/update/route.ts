import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { full_name, bio, location, website, linkedin_url } = body

    // Update profile
    const { error: updateError } = await supabase
      .from('profile')
      .update({
        full_name,
        bio,
        location,
        website,
        linkedin_url,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
    })
  } catch (err: any) {
    console.error('Profile update error:', err)
    return NextResponse.json(
      { error: 'Failed to update profile', details: err.message },
      { status: 500 }
    )
  }
}

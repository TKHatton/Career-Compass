import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    return NextResponse.json({ message: 'Signed out successfully' })
  } catch (err: any) {
    console.error('Sign out error:', err)
    return NextResponse.json(
      { error: 'Failed to sign out', details: err.message },
      { status: 500 }
    )
  }
}

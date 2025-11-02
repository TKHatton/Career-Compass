import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Create admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Execute the migration SQL
    const { data, error } = await supabase
      .rpc('exec', {
        sql: `
          ALTER TABLE public.profile
          ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

          COMMENT ON COLUMN public.profile.onboarding_completed_at IS 'Timestamp when user completed the onboarding flow';
        `
      })

    if (error) {
      console.error('Migration error:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          note: 'Please run the migration manually in Supabase SQL Editor'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    })
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        note: 'Please run the migration manually in Supabase SQL Editor'
      },
      { status: 500 }
    )
  }
}

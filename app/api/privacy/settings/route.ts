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
    const { auto_delete_sessions_after_days, data_retention_days } = body

    // Validate inputs
    if (auto_delete_sessions_after_days !== null && auto_delete_sessions_after_days !== undefined) {
      const days = parseInt(auto_delete_sessions_after_days)
      if (isNaN(days) || days < 0 || days > 3650) {
        return NextResponse.json(
          { error: 'Invalid auto_delete_sessions_after_days value' },
          { status: 400 }
        )
      }
    }

    if (data_retention_days !== null && data_retention_days !== undefined) {
      const days = parseInt(data_retention_days)
      if (isNaN(days) || days < 0 || days > 3650) {
        return NextResponse.json(
          { error: 'Invalid data_retention_days value' },
          { status: 400 }
        )
      }
    }

    // Update privacy settings
    const { error: updateError } = await supabase
      .from('profile')
      .update({
        auto_delete_sessions_after_days: auto_delete_sessions_after_days === null ? null : parseInt(auto_delete_sessions_after_days),
        data_retention_days: data_retention_days === null ? null : parseInt(data_retention_days),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update privacy settings error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update privacy settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
    })
  } catch (err: any) {
    console.error('Privacy settings error:', err)
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    )
  }
}

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

    // Get confirmation from request body
    const body = await request.json()
    if (body.confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation text' },
        { status: 400 }
      )
    }

    // Delete user record (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    if (deleteError) {
      console.error('Delete user error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user data' },
        { status: 500 }
      )
    }

    // Delete auth user using admin API
    const supabaseAdmin = await createClient()
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    )

    if (authDeleteError) {
      console.error('Delete auth user error:', authDeleteError)
      // Data is already deleted, so we still consider this a success
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (err: any) {
    console.error('Account deletion error:', err)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

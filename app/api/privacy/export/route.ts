import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all user data
    const [
      { data: profile },
      { data: docs },
      { data: cvVersions },
      { data: letters },
      { data: sessions },
    ] = await Promise.all([
      supabase.from('profile').select('*').eq('user_id', user.id).single(),
      supabase.from('docs').select('*').eq('user_id', user.id),
      supabase.from('cv_versions').select('*').eq('user_id', user.id),
      supabase.from('letters').select('*').eq('user_id', user.id),
      supabase.from('sessions').select('*').eq('user_id', user.id),
    ])

    // Fetch messages for all sessions
    const sessionIds = sessions?.map(s => s.id) || []
    const { data: messages } = sessionIds.length > 0
      ? await supabase.from('messages').select('*').in('session_id', sessionIds)
      : { data: [] }

    // Build export data structure
    const exportData = {
      export_date: new Date().toISOString(),
      account: {
        email: user.email,
        created_at: user.created_at,
        user_id: user.id,
      },
      profile: profile || null,
      documents: docs || [],
      cv_versions: cvVersions || [],
      letters: letters || [],
      sessions: sessions || [],
      messages: messages || [],
      metadata: {
        total_documents: docs?.length || 0,
        total_cv_versions: cvVersions?.length || 0,
        total_letters: letters?.length || 0,
        total_sessions: sessions?.length || 0,
        total_messages: messages?.length || 0,
      }
    }

    // Return as downloadable JSON
    const filename = `career-compass-data-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('Export error:', err)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

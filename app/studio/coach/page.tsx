import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import WritingCoach from '@/components/coach/WritingCoach'

export default async function WritingCoachPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Get recent sessions
  const { data: recentSessions } = await supabase
    .from('coaching_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-sand-rose pb-24">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 pt-8 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <a
            href="/studio"
            className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-lg hover:shadow-elevated transition-all"
          >
            ←
          </a>
          <div>
            <h1 className="text-2xl font-bold text-black">Writing Coach</h1>
            <p className="text-sm text-sage-gray">Get help with any writing task</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        {/* Writing Coach */}
        <div className="animate-slide-up">
          <WritingCoach />
        </div>

        {/* Recent Sessions */}
        {recentSessions && recentSessions.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-black px-1">Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-elevated transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">💬</span>
                        <h3 className="font-bold text-black">
                          {session.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-sage-gray">
                    Last updated: {new Date(session.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

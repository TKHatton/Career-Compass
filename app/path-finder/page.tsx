import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import PathFinderContent from '@/components/path-finder/PathFinderContent'

export default async function PathFinderPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user's profile for goal and values
  const { data: profile } = await supabase
    .from('profile')
    .select('long_term_goal, values_json')
    .eq('user_id', user.id)
    .single()

  // Get recent evaluations
  const { data: recentEvaluations } = await supabase
    .from('course_evaluations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-sand-rose pb-24">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 pt-8 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-mist-teal flex items-center justify-center text-2xl shadow-soft">
            🧭
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Path Finder</h1>
            <p className="text-sm text-sage-gray">AI-powered career decisions</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        <PathFinderContent
          userGoal={profile?.long_term_goal || null}
          userValues={profile?.values_json || []}
          recentEvaluations={recentEvaluations || []}
        />
      </main>

      <BottomNav />
    </div>
  )
}

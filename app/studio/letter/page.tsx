import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import LetterBuilder from '@/components/letter/LetterBuilder'

export default async function CoverLetterPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Get recent letters
  const { data: recentLetters } = await supabase
    .from('letters')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

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
            <h1 className="text-2xl font-bold text-black">Cover Letter Builder</h1>
            <p className="text-sm text-sage-gray">AI-powered, personalized letters</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        {/* Letter Builder */}
        <div className="animate-slide-up">
          <LetterBuilder />
        </div>

        {/* Recent Letters */}
        {recentLetters && recentLetters.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-black px-1">Recent Cover Letters</h2>
            <div className="space-y-3">
              {recentLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-elevated transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">✉️</span>
                        <h3 className="font-bold text-black">
                          {letter.job_meta_json?.title || 'Cover Letter'}
                        </h3>
                      </div>
                      <p className="text-sm text-sage-gray">
                        {letter.job_meta_json?.company || 'Company'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-sage-gray">
                    {new Date(letter.created_at).toLocaleDateString()}
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

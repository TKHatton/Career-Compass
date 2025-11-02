import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import ScriptureTile from '@/components/scripture/ScriptureTile'
import ProfileMenu from '@/components/navigation/ProfileMenu'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed_at) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-sand-rose pb-24">
      {/* Header with Profile */}
      <header className="bg-white shadow-soft px-6 pt-8 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black">
              Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-sm text-sage-gray mt-1">Ready to work on your career?</p>
          </div>
          <ProfileMenu profile={profile} userEmail={user.email || ''} />
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        {/* Scripture Tile */}
        <div className="animate-fade-in">
          <ScriptureTile />
        </div>

        {/* Quick Access Cards */}
        <section className="space-y-5 animate-slide-up">
          <h2 className="text-xl font-bold text-black px-1">Your Tools</h2>

          <div className="space-y-4">
            {/* Writing Studio - Featured Card */}
            <a
              href="/studio"
              className="group block bg-white rounded-3xl p-6 shadow-elevated hover:shadow-float transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-clay-rose flex items-center justify-center text-2xl shadow-soft group-hover:scale-110 transition-transform duration-300">
                  ✍️
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black group-hover:text-clay-rose transition-colors">
                    Writing Studio
                  </h3>
                  <p className="text-sm text-sage-gray mt-1">
                    CV Studio, cover letters, proposals
                  </p>
                </div>
                <div className="text-clay-rose text-xl group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </a>

            {/* Two Column Cards */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/path-finder"
                className="group bg-white rounded-3xl p-5 shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-mist-teal flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  🧭
                </div>
                <h3 className="text-base font-bold text-black">Path Finder</h3>
                <p className="text-xs text-sage-gray mt-1">
                  Explore courses
                </p>
              </a>

              <a
                href="/mindless-moments"
                className="group bg-white rounded-3xl p-5 shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-sand-rose flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  🎨
                </div>
                <h3 className="text-base font-bold text-black">Mindless</h3>
                <p className="text-xs text-sage-gray mt-1">
                  Creative break
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Quick Actions CTA */}
        <section className="animate-slide-up">
          <a
            href="/studio/cv"
            className="block bg-clay-rose text-white rounded-3xl p-6 shadow-elevated hover:shadow-float transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Get Started</p>
                <h3 className="text-xl font-bold">Tailor Your CV</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl">
                🚀
              </div>
            </div>
          </a>
        </section>

        {/* Recent Items */}
        <section className="space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-black px-1">Recent</h2>
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm text-sage-gray">No recent activity yet</p>
              <p className="text-xs text-sage-gray mt-1">Your work will appear here</p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

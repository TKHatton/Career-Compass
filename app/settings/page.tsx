import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import PrivacyControls from '@/components/settings/PrivacyControls'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-sand-rose pb-20">
      <header className="bg-white border-b border-sage-gray px-4 py-4">
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <p className="text-sm text-sage-gray">Manage your account and preferences</p>
      </header>

      <main className="p-4 space-y-6">
        {/* Account Info */}
        <section className="bg-white rounded-lg p-6 shadow-sm border border-mist-teal">
          <h2 className="text-lg font-medium text-black mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-sage-gray block mb-1">Email</span>
              <p className="text-sm text-black font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-sm text-sage-gray block mb-1">Member Since</span>
              <p className="text-sm text-black">
                {new Date(user.created_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Profile & Goals */}
        <section className="bg-white rounded-lg p-6 shadow-sm border border-mist-teal">
          <h2 className="text-lg font-medium text-black mb-4">Profile & Goals</h2>
          {profile ? (
            <div className="space-y-3">
              {profile.long_term_goal && (
                <div>
                  <span className="text-sm text-sage-gray block mb-1">Long-term Goal</span>
                  <p className="text-sm text-black">{profile.long_term_goal}</p>
                </div>
              )}
              {profile.values_json && Array.isArray(profile.values_json) && profile.values_json.length > 0 && (
                <div>
                  <span className="text-sm text-sage-gray block mb-1">Values</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.values_json.map((value: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-mist-teal rounded text-xs text-black">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.strengths_json && Array.isArray(profile.strengths_json) && profile.strengths_json.length > 0 && (
                <div>
                  <span className="text-sm text-sage-gray block mb-1">Strengths</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.strengths_json.map((strength: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-sand-rose rounded text-xs text-black">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!profile.long_term_goal && (!profile.values_json || profile.values_json.length === 0) && (!profile.strengths_json || profile.strengths_json.length === 0) && (
                <p className="text-sm text-sage-gray italic">
                  No profile information set yet. Profile editing features coming soon.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-sage-gray italic">
              Profile not found. Creating profile...
            </p>
          )}
        </section>

        {/* Privacy & Data */}
        <section className="bg-white rounded-lg p-6 shadow-sm border border-mist-teal">
          <h2 className="text-lg font-medium text-black mb-4">Privacy & Data</h2>
          <p className="text-sm text-sage-gray mb-6">
            Your data is encrypted and protected. Manage your privacy settings below.
          </p>
          <PrivacyControls
            initialSettings={{
              auto_delete_sessions_after_days: profile?.auto_delete_sessions_after_days || null,
              data_retention_days: profile?.data_retention_days || null,
            }}
          />
        </section>

        {/* Sign Out */}
        <section className="bg-white rounded-lg p-6 shadow-sm border border-mist-teal">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign Out
            </button>
          </form>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

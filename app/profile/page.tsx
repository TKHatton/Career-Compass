import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import ProfileEditor from '@/components/profile/ProfileEditor'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-sand-rose pb-24">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 pt-8 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <a
            href="/"
            className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-lg hover:shadow-elevated transition-all"
          >
            ←
          </a>
          <div>
            <h1 className="text-2xl font-bold text-black">My Profile</h1>
            <p className="text-sm text-sage-gray">Manage your account information</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <ProfileEditor profile={profile} userEmail={user.email || ''} />
      </main>

      <BottomNav />
    </div>
  )
}

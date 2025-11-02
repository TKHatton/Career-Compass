import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import DrawingCanvas from '@/components/canvas/DrawingCanvas'

export default async function MindlessMomentsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-sand-rose pb-20">
      <header className="bg-white border-b border-sage-gray px-4 py-4">
        <h1 className="text-2xl font-semibold text-black">Mindless Moments</h1>
        <p className="text-sm text-sage-gray">Take a creative break</p>
      </header>

      <main className="p-4 space-y-6">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-mist-teal">
          <h2 className="text-lg font-medium text-black mb-2">
            Let Your Creativity Flow
          </h2>
          <p className="text-sm text-sage-gray">
            Sometimes the best ideas come when we step away and do something mindless.
            Use this space to draw, doodle, or simply relax. There's no right or wrong way to create here.
          </p>
        </div>

        {/* Drawing Canvas */}
        <DrawingCanvas />

        {/* Tips */}
        <div className="bg-sand-rose rounded-lg p-4 border border-mist-teal">
          <h3 className="text-sm font-medium text-black mb-2">💡 Tips</h3>
          <ul className="text-sm text-sage-gray space-y-1 list-disc list-inside">
            <li>Try drawing with your non-dominant hand</li>
            <li>Draw shapes, patterns, or abstract art</li>
            <li>Use it for quick sketches of ideas</li>
            <li>Practice mindful doodling while thinking</li>
          </ul>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import CVUploader from '@/components/cv/CVUploader'
import CVList from '@/components/cv/CVList'

export default async function CVStudioPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Fetch user's CV documents
  const { data: docs } = await supabase
    .from('docs')
    .select('*')
    .eq('type', 'cv')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch CV versions
  const { data: versions } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-sand-rose pb-20">
      <header className="bg-white border-b border-sage-gray px-4 py-4">
        <h1 className="text-2xl font-semibold text-black">CV Studio</h1>
        <p className="text-sm text-sage-gray">Upload and tailor your CV</p>
      </header>

      <main className="p-4 space-y-6">
        {/* Upload Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border border-mist-teal">
          <h2 className="text-lg font-medium text-black mb-4">Upload Your CV</h2>
          <CVUploader userId={user.id} />
        </section>

        {/* My CVs Section */}
        {docs && docs.length > 0 && (
          <section>
            <h2 className="text-lg font-medium text-black mb-4">My CVs</h2>
            <CVList docs={docs} versions={versions || []} />
          </section>
        )}

        {/* Getting Started Guide */}
        {(!docs || docs.length === 0) && (
          <section className="bg-mist-teal rounded-lg p-6 shadow-sm border border-sage-gray">
            <h3 className="text-lg font-medium text-black mb-2">Getting Started</h3>
            <ol className="text-sm text-black space-y-2 list-decimal list-inside">
              <li>Upload your current CV (DOCX or PDF)</li>
              <li>Your CV will be parsed and stored securely</li>
              <li>Paste a job description to tailor your CV</li>
              <li>Review the tailored version side-by-side</li>
              <li>Export as DOCX or PDF and email to yourself</li>
            </ol>
            <p className="text-xs text-sage-gray mt-4">
              Your CV is encrypted at rest. PII is redacted before processing.
            </p>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

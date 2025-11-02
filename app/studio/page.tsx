import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import Link from 'next/link'

export default async function StudioPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  const tools = [
    {
      name: 'CV Studio',
      href: '/studio/cv',
      description: 'Upload, tailor, and manage your CV',
      icon: '📄',
      primary: true,
    },
    {
      name: 'Cover Letter Builder',
      href: '/studio/letter',
      description: 'Generate tailored cover letters',
      icon: '✉️',
    },
    {
      name: 'Journal Proposal',
      href: '/studio/journal',
      description: 'Create research proposals',
      icon: '📚',
    },
    {
      name: 'Substack Creator',
      href: '/studio/substack',
      description: 'Draft and polish articles',
      icon: '✍️',
    },
    {
      name: 'Writing Coach',
      href: '/studio/coach',
      description: 'Freeform writing assistance',
      icon: '💬',
    },
  ]

  return (
    <div className="min-h-screen bg-sand-rose pb-20">
      <header className="bg-white border-b border-sage-gray px-4 py-4">
        <h1 className="text-2xl font-semibold text-black">Writing Studio</h1>
        <p className="text-sm text-sage-gray">Your private workspace for career materials</p>
      </header>

      <main className="p-4 space-y-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`block bg-white rounded-lg p-6 shadow-sm border transition-all ${
              tool.primary
                ? 'border-clay-rose ring-2 ring-clay-rose ring-opacity-20'
                : 'border-mist-teal hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{tool.icon}</span>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-black">{tool.name}</h3>
                <p className="text-sm text-sage-gray mt-1">{tool.description}</p>
                {tool.primary && (
                  <span className="inline-block mt-2 text-xs font-medium text-clay-rose">
                    Primary Tool
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </main>

      <BottomNav />
    </div>
  )
}

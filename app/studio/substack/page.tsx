import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/navigation/BottomNav'
import SubstackCreator from '@/components/substack/SubstackCreator'

export default async function SubstackCreatorPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Get recent articles
  const { data: recentArticles } = await supabase
    .from('substack_articles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
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
            <h1 className="text-2xl font-bold text-black">Substack Creator</h1>
            <p className="text-sm text-sage-gray">From brainstorm to polished article</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        {/* Substack Creator */}
        <div className="animate-slide-up">
          <SubstackCreator />
        </div>

        {/* Recent Articles */}
        {recentArticles && recentArticles.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-black px-1">Recent Work</h2>
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-elevated transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {article.mode === 'brainstorm' ? '💡' :
                           article.mode === 'outline' ? '📝' :
                           article.mode === 'draft' ? '✨' : '✨'}
                        </span>
                        <h3 className="font-bold text-black capitalize">
                          {article.mode}
                        </h3>
                      </div>
                      <p className="text-sm text-sage-gray">
                        {article.article_meta_json?.topic || 'Article'}
                      </p>
                      {article.article_meta_json?.title && (
                        <p className="text-xs text-sage-gray mt-1">
                          {article.article_meta_json.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-sage-gray">
                    {new Date(article.created_at).toLocaleDateString()}
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

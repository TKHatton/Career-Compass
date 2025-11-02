'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CourseEvaluatorProps {
  userGoal: string | null
  userValues: string[]
}

export default function CourseEvaluator({ userGoal, userValues }: CourseEvaluatorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    cost: '',
    duration: '',
    description: '',
    skills: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/path-finder/evaluate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userGoal,
          userValues,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to evaluate course')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Score Card */}
        <div className="bg-white rounded-3xl p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-black">Overall Score</h3>
            <div className="w-20 h-20 rounded-full bg-clay-rose flex items-center justify-center shadow-soft">
              <span className="text-3xl font-bold text-white">{result.score}</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Score Breakdown */}
            {result.breakdown && (
              <div className="space-y-3">
                <h4 className="font-semibold text-black">Score Breakdown</h4>
                {Object.entries(result.breakdown).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-sage-gray capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-black">{value.score}/100</span>
                      </div>
                      <div className="w-full bg-sand-rose rounded-full h-2">
                        <div
                          className="bg-clay-rose h-2 rounded-full transition-all duration-500"
                          style={{ width: `${value.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Sections */}
        {result.analysis && (
          <>
            {/* Goal Alignment */}
            {result.analysis.goal_alignment && (
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-xl">
                    🎯
                  </div>
                  <h4 className="text-lg font-bold text-black">Goal Alignment</h4>
                </div>
                <p className="text-sm text-sage-gray leading-relaxed">{result.analysis.goal_alignment}</p>
              </div>
            )}

            {/* Tradeoffs */}
            {result.analysis.tradeoffs && (
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-sand-rose flex items-center justify-center text-xl">
                    ⚖️
                  </div>
                  <h4 className="text-lg font-bold text-black">Tradeoffs</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-black mb-2">✅ Pros</h5>
                    <ul className="text-sm text-sage-gray space-y-1">
                      {result.analysis.tradeoffs.pros?.map((pro: string, i: number) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-black mb-2">⚠️ Cons</h5>
                    <ul className="text-sm text-sage-gray space-y-1">
                      {result.analysis.tradeoffs.cons?.map((con: string, i: number) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation */}
            {result.analysis.recommendation && (
              <div className="bg-clay-rose rounded-3xl p-6 shadow-elevated text-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
                    💡
                  </div>
                  <h4 className="text-lg font-bold">Recommendation</h4>
                </div>
                <p className="text-sm leading-relaxed mb-4">{result.analysis.recommendation}</p>
                {result.analysis.next_action && (
                  <div className="bg-white bg-opacity-20 rounded-2xl p-4">
                    <p className="text-sm font-semibold mb-1">Next Action:</p>
                    <p className="text-sm">{result.analysis.next_action}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setResult(null)}
            className="flex-1 bg-white text-black font-medium py-3 px-4 rounded-2xl shadow-soft hover:shadow-elevated transition-all"
          >
            Evaluate Another
          </button>
          <button
            onClick={() => router.refresh()}
            className="flex-1 bg-mist-teal text-black font-medium py-3 px-4 rounded-2xl shadow-soft hover:shadow-elevated transition-all"
          >
            View History
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Advanced Data Science Bootcamp"
            required
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Provider *
          </label>
          <input
            type="text"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            placeholder="e.g., Coursera, Udemy, University Name"
            required
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Cost ($)
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Duration (weeks)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="12"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Course Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What will you learn? What are the main topics covered?"
            required
            rows={4}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Skills You&apos;ll Gain
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="e.g., Python, Machine Learning, Data Visualization"
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
          <p className="text-xs text-sage-gray mt-1">Separate with commas</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-clay-rose text-white font-bold py-4 px-6 rounded-3xl shadow-elevated hover:shadow-float transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙️</span>
            Analyzing Course...
          </span>
        ) : (
          '🔍 Evaluate Course'
        )}
      </button>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DegreeExplorerProps {
  userGoal: string | null
  userValues: string[]
}

export default function DegreeExplorer({ userGoal, userValues }: DegreeExplorerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  const [formData, setFormData] = useState({
    degreeType: '',
    field: '',
    institution: '',
    totalCost: '',
    durationYears: '',
    weeklyHours: '',
    format: 'full-time', // full-time, part-time, online
    fundingOptions: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/path-finder/evaluate-degree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userGoal,
          userValues,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to evaluate degree')
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
        {/* Decision Card */}
        <div className="bg-clay-rose rounded-3xl p-6 shadow-elevated text-white">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">
              {result.decision === 'buy' ? '✅' : '🤔'}
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {result.decision === 'buy' ? 'Recommended' : 'Explore Later'}
              </h3>
              <p className="text-sm opacity-90 mt-1">{result.decision_rationale}</p>
            </div>
          </div>
        </div>

        {/* Program Comparison */}
        {result.program_comparison && result.program_comparison.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-black px-1">Program Options</h3>
            {result.program_comparison.map((program: any, index: number) => (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-black">{program.name}</h4>
                    <p className="text-sm text-sage-gray mt-1">{program.institution || 'Various'}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-mist-teal text-sm font-medium">
                    Option {index + 1}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {program.cost && (
                    <div>
                      <p className="text-xs text-sage-gray">Cost</p>
                      <p className="text-sm font-semibold text-black">${program.cost}</p>
                    </div>
                  )}
                  {program.duration && (
                    <div>
                      <p className="text-xs text-sage-gray">Duration</p>
                      <p className="text-sm font-semibold text-black">{program.duration}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {program.pros && program.pros.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-black mb-2">✅ Pros</h5>
                      <ul className="text-sm text-sage-gray space-y-1">
                        {program.pros.map((pro: string, i: number) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {program.cons && program.cons.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-black mb-2">⚠️ Cons</h5>
                      <ul className="text-sm text-sage-gray space-y-1">
                        {program.cons.map((con: string, i: number) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Load Breakdown */}
        {result.weekly_load && (
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sand-rose flex items-center justify-center text-xl">
                📅
              </div>
              <h4 className="text-lg font-bold text-black">Weekly Time Commitment</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(result.weekly_load).map(([activity, hours]: [string, any]) => (
                <div key={activity}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-sage-gray capitalize">{activity.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium text-black">{hours}h</span>
                  </div>
                  <div className="w-full bg-sand-rose rounded-full h-2">
                    <div
                      className="bg-clay-rose h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((hours / 40) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-sage-gray">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-black">Total Weekly Hours</span>
                  <span className="text-sm font-bold text-clay-rose">
                    {Object.values(result.weekly_load).reduce((a: number, b: any) => a + b, 0)}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Funding Analysis */}
        {result.funding_analysis && (
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-xl">
                💰
              </div>
              <h4 className="text-lg font-bold text-black">Funding Options</h4>
            </div>
            <p className="text-sm text-sage-gray leading-relaxed">{result.funding_analysis}</p>
          </div>
        )}

        {/* Goal Alignment */}
        {result.goal_alignment && (
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-clay-rose flex items-center justify-center text-xl">
                🎯
              </div>
              <h4 className="text-lg font-bold text-black">How This Aligns With Your Goals</h4>
            </div>
            <p className="text-sm text-sage-gray leading-relaxed">{result.goal_alignment}</p>
          </div>
        )}

        {/* Next Steps */}
        {result.next_steps && (
          <div className="bg-white rounded-3xl p-6 shadow-elevated border-2 border-mist-teal">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-xl shadow-soft">
                🚀
              </div>
              <h4 className="text-lg font-bold text-black">Next Steps</h4>
            </div>
            <div className="bg-sand-rose rounded-2xl p-4">
              <ol className="text-sm text-black space-y-2">
                {result.next_steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setResult(null)}
            className="flex-1 bg-white text-black font-medium py-3 px-4 rounded-2xl shadow-soft hover:shadow-elevated transition-all"
          >
            Explore Another
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Degree Type *
            </label>
            <select
              value={formData.degreeType}
              onChange={(e) => setFormData({ ...formData, degreeType: e.target.value })}
              required
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            >
              <option value="">Select...</option>
              <option value="bachelor">Bachelor's</option>
              <option value="master">Master's</option>
              <option value="phd">PhD</option>
              <option value="certificate">Certificate</option>
              <option value="diploma">Diploma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Study Format *
            </label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              required
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Field of Study *
          </label>
          <input
            type="text"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            placeholder="e.g., Data Science, Business Administration"
            required
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Institution (Optional)
          </label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            placeholder="e.g., Stanford University, University of London"
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Total Cost ($)
            </label>
            <input
              type="number"
              value={formData.totalCost}
              onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Duration (years)
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.durationYears}
              onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
              placeholder="2"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Hours/Week
            </label>
            <input
              type="number"
              value={formData.weeklyHours}
              onChange={(e) => setFormData({ ...formData, weeklyHours: e.target.value })}
              placeholder="20"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Funding Options (Optional)
          </label>
          <input
            type="text"
            value={formData.fundingOptions}
            onChange={(e) => setFormData({ ...formData, fundingOptions: e.target.value })}
            placeholder="e.g., Scholarships, loans, employer sponsorship"
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Program Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What will you study? What are the career outcomes? Any specific requirements?"
            required
            rows={4}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
          />
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
            Analyzing Degree Program...
          </span>
        ) : (
          '🎓 Evaluate Degree'
        )}
      </button>
    </form>
  )
}

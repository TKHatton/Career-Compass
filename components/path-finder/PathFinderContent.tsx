'use client'

import { useState } from 'react'
import CourseEvaluator from './CourseEvaluator'
import DegreeExplorer from './DegreeExplorer'

interface PathFinderContentProps {
  userGoal: string | null
  userValues: string[]
  recentEvaluations: any[]
}

export default function PathFinderContent({ userGoal, userValues, recentEvaluations }: PathFinderContentProps) {
  const [activeTab, setActiveTab] = useState<'course' | 'degree'>('course')

  return (
    <>
      {/* Info Card */}
      <div className="bg-white rounded-3xl p-6 shadow-elevated border-2 border-mist-teal">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-xl flex-shrink-0 shadow-soft">
            🧭
          </div>
          <div>
            <h2 className="text-lg font-bold text-black mb-2">AI-Powered Decision Making</h2>
            <p className="text-sm text-sage-gray mb-2">
              Every evaluation is personalized using AI analysis based on <strong className="text-black">your specific goals and values</strong> from your profile.
            </p>
            <p className="text-xs text-sage-gray">
              All recommendations consider your career context, financial situation, and long-term objectives.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-3 animate-slide-up">
        <button
          onClick={() => setActiveTab('course')}
          className={`flex-1 py-4 px-6 rounded-3xl font-bold transition-all shadow-soft ${
            activeTab === 'course'
              ? 'bg-clay-rose text-white shadow-elevated scale-[1.02]'
              : 'bg-white text-black hover:shadow-elevated'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">📚</span>
            <span>Course Checker</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('degree')}
          className={`flex-1 py-4 px-6 rounded-3xl font-bold transition-all shadow-soft ${
            activeTab === 'degree'
              ? 'bg-clay-rose text-white shadow-elevated scale-[1.02]'
              : 'bg-white text-black hover:shadow-elevated'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🎓</span>
            <span>Degree Explorer</span>
          </div>
        </button>
      </div>

      {/* Active Evaluator */}
      <div className="animate-fade-in">
        {activeTab === 'course' ? (
          <div>
            <h2 className="text-xl font-bold text-black mb-4 px-1">Evaluate a Course</h2>
            <CourseEvaluator userGoal={userGoal} userValues={userValues} />
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-black mb-4 px-1">Explore a Degree Program</h2>
            <DegreeExplorer userGoal={userGoal} userValues={userValues} />
          </div>
        )}
      </div>

      {/* Recent Evaluations */}
      {recentEvaluations && recentEvaluations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-black px-1">Recent Evaluations</h2>
          <div className="space-y-3">
            {recentEvaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-elevated transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {evaluation.type === 'course' ? '📚' : '🎓'}
                      </span>
                      <h3 className="font-bold text-black">{evaluation.title}</h3>
                    </div>
                    <p className="text-sm text-sage-gray">{evaluation.provider}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-clay-rose flex items-center justify-center shadow-soft flex-shrink-0">
                    <span className="text-xl font-bold text-white">{evaluation.score}</span>
                  </div>
                </div>
                <p className="text-sm text-sage-gray line-clamp-2">{evaluation.recommendation}</p>
                <p className="text-xs text-sage-gray mt-2">
                  {new Date(evaluation.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

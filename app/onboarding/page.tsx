'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CAREER_VALUES = [
  'Work-Life Balance',
  'Innovation',
  'Impact & Purpose',
  'Financial Security',
  'Creative Freedom',
  'Collaboration',
  'Independence',
  'Growth & Learning',
  'Leadership',
  'Stability',
  'Flexibility',
  'Recognition',
]

const KEY_STRENGTHS = [
  'Problem Solving',
  'Communication',
  'Leadership',
  'Technical Skills',
  'Creativity',
  'Analytical Thinking',
  'Adaptability',
  'Time Management',
  'Collaboration',
  'Strategic Thinking',
  'Detail-Oriented',
  'Empathy',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [longTermGoal, setLongTermGoal] = useState('')
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [customValue, setCustomValue] = useState('')
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([])
  const [customStrength, setCustomStrength] = useState('')

  const supabase = createClient()

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    )
  }

  const toggleStrength = (strength: string) => {
    setSelectedStrengths((prev) =>
      prev.includes(strength)
        ? prev.filter((s) => s !== strength)
        : [...prev, strength]
    )
  }

  const addCustomValue = () => {
    if (customValue.trim() && !selectedValues.includes(customValue.trim())) {
      setSelectedValues([...selectedValues, customValue.trim()])
      setCustomValue('')
    }
  }

  const addCustomStrength = () => {
    if (customStrength.trim() && !selectedStrengths.includes(customStrength.trim())) {
      setSelectedStrengths([...selectedStrengths, customStrength.trim()])
      setCustomStrength('')
    }
  }

  const handleNext = () => {
    if (step === 2 && !fullName.trim()) {
      setError('Please enter your name')
      return
    }
    if (step === 3 && !longTermGoal.trim()) {
      setError('Please share your career goal')
      return
    }
    if (step === 4 && selectedValues.length === 0) {
      setError('Please select at least one value')
      return
    }
    if (step === 5 && selectedStrengths.length === 0) {
      setError('Please select at least one strength')
      return
    }
    setError(null)
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated')
        return
      }

      // Save onboarding data
      const { error: updateError } = await supabase
        .from('profile')
        .update({
          full_name: fullName,
          long_term_goal: longTermGoal,
          values_json: selectedValues,
          strengths_json: selectedStrengths,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error saving onboarding:', updateError)
        setError('Failed to save your information. Please try again.')
        return
      }

      // Redirect to home
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand-rose flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 border border-mist-teal">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-clay-rose' : 'bg-mist-teal'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-sage-gray text-center">
            Step {step} of 6
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-semibold text-black mb-4">
                Welcome to Career Compass
              </h1>
              <p className="text-sage-gray text-lg">
                Let&apos;s take a few moments to understand your career aspirations.
              </p>
              <p className="text-sage-gray mt-4">
                This will help me provide personalized guidance and support throughout your journey.
              </p>
            </div>
            <div className="bg-sand-rose p-6 rounded-lg">
              <p className="text-sm text-sage-gray">
                <strong className="text-black">Privacy First:</strong> All information you share stays private and encrypted. You&apos;re in complete control.
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              Let&apos;s Get Started
            </button>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-black mb-2">
                What&apos;s your name?
              </h2>
              <p className="text-sage-gray">
                Let&apos;s start with the basics. What should I call you?
              </p>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-mist-teal text-black font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Career Goal */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-black mb-2">
                What&apos;s your long-term career goal?
              </h2>
              <p className="text-sage-gray">
                Think big! Where do you see yourself in 5-10 years?
              </p>
            </div>
            <textarea
              value={longTermGoal}
              onChange={(e) => setLongTermGoal(e.target.value)}
              placeholder="Example: Become a senior UX researcher at a mission-driven tech company..."
              rows={6}
              className="w-full px-4 py-3 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-mist-teal text-black font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Values */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-black mb-2">
                What values matter most to you?
              </h2>
              <p className="text-sage-gray">
                Select all that apply, or add your own.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CAREER_VALUES.map((value) => (
                <button
                  key={value}
                  onClick={() => toggleValue(value)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedValues.includes(value)
                      ? 'bg-clay-rose text-white'
                      : 'bg-mist-teal text-black hover:bg-opacity-80'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomValue()}
                placeholder="Add custom value..."
                className="flex-1 px-4 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
              />
              <button
                onClick={addCustomValue}
                className="px-6 py-2 bg-mist-teal text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-mist-teal text-black font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Strengths */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-black mb-2">
                What are your key strengths?
              </h2>
              <p className="text-sage-gray">
                Choose your professional superpowers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {KEY_STRENGTHS.map((strength) => (
                <button
                  key={strength}
                  onClick={() => toggleStrength(strength)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedStrengths.includes(strength)
                      ? 'bg-clay-rose text-white'
                      : 'bg-mist-teal text-black hover:bg-opacity-80'
                  }`}
                >
                  {strength}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customStrength}
                onChange={(e) => setCustomStrength(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomStrength()}
                placeholder="Add custom strength..."
                className="flex-1 px-4 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
              />
              <button
                onClick={addCustomStrength}
                className="px-6 py-2 bg-mist-teal text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-mist-teal text-black font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Summary */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-black mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-sage-gray">
                Here&apos;s what we learned about your career journey:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-sand-rose p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">Your Name</h3>
                <p className="text-sm text-sage-gray">{fullName}</p>
              </div>

              <div className="bg-sand-rose p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">Your Goal</h3>
                <p className="text-sm text-sage-gray">{longTermGoal}</p>
              </div>

              <div className="bg-sand-rose p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">Your Values</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedValues.map((value) => (
                    <span
                      key={value}
                      className="px-3 py-1 bg-white rounded-full text-sm text-black"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-sand-rose p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">Your Strengths</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStrengths.map((strength) => (
                    <span
                      key={strength}
                      className="px-3 py-1 bg-white rounded-full text-sm text-black"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(5)}
                className="flex-1 bg-mist-teal text-black font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

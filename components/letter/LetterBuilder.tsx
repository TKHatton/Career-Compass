'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LetterBuilder() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null)
  const [editedLetter, setEditedLetter] = useState<string>('')

  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
    tone: 'professional',
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate cover letter')
      }

      const data = await response.json()
      setGeneratedLetter(data.letter)
      setEditedLetter(data.letter)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedLetter)
    alert('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([editedLetter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${formData.company}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setGeneratedLetter(null)
    setEditedLetter('')
    setFormData({
      jobTitle: '',
      company: '',
      jobDescription: '',
      tone: 'professional',
    })
  }

  if (generatedLetter) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Generated Letter Card */}
        <div className="bg-white rounded-3xl p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Your Cover Letter</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-mist-teal text-black font-medium rounded-2xl shadow-soft hover:shadow-elevated transition-all text-sm"
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-sand-rose text-black font-medium rounded-2xl shadow-soft hover:shadow-elevated transition-all text-sm"
              >
                💾 Download
              </button>
            </div>
          </div>

          {/* Editable Letter */}
          <textarea
            value={editedLetter}
            onChange={(e) => setEditedLetter(e.target.value)}
            className="w-full px-4 py-3 border-2 border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose font-serif text-sm leading-relaxed resize-none"
            rows={20}
          />

          <p className="text-xs text-sage-gray mt-2">
            Feel free to edit the letter above. Click Copy when ready to paste into your application.
          </p>
        </div>

        {/* Job Details Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <h4 className="font-semibold text-black mb-3">Application Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-sage-gray">Position:</span>
              <span className="text-black font-medium">{formData.jobTitle}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-sage-gray">Company:</span>
              <span className="text-black font-medium">{formData.company}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-sage-gray">Tone:</span>
              <span className="text-black font-medium capitalize">{formData.tone}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 bg-white text-black font-medium py-3 px-4 rounded-2xl shadow-soft hover:shadow-elevated transition-all"
          >
            Create Another
          </button>
          <button
            onClick={() => router.push('/studio')}
            className="flex-1 bg-clay-rose text-white font-medium py-3 px-4 rounded-2xl shadow-soft hover:shadow-elevated transition-all"
          >
            Back to Studio
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white rounded-3xl p-6 shadow-elevated border-2 border-mist-teal">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-xl flex-shrink-0 shadow-soft">
            ✉️
          </div>
          <div>
            <h3 className="text-lg font-bold text-black mb-2">AI-Powered Cover Letters</h3>
            <p className="text-sm text-sage-gray">
              I&apos;ll write a personalized cover letter based on your profile, strengths, and career goals.
              Each letter is tailored to the specific job and company.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Job Title *
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="e.g., Senior Product Manager"
            required
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="e.g., Google"
            required
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Job Description *
          </label>
          <textarea
            value={formData.jobDescription}
            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
            placeholder="Paste the job description here, or summarize the key requirements and responsibilities..."
            required
            rows={6}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
          />
          <p className="text-xs text-sage-gray mt-1">
            The more detail you provide, the better I can tailor your letter
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Letter Tone
          </label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          >
            <option value="professional">Professional</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="formal">Formal</option>
            <option value="conversational">Conversational</option>
          </select>
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
            Crafting Your Letter...
          </span>
        ) : (
          '✨ Generate Cover Letter'
        )}
      </button>

      <p className="text-xs text-sage-gray text-center">
        Your letter will be based on your profile, goals, and values from onboarding
      </p>
    </form>
  )
}

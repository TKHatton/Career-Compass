'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JournalProposalBuilder() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedProposal, setGeneratedProposal] = useState<string | null>(null)
  const [editedProposal, setEditedProposal] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    journal: '',
    field: '',
    researchQuestion: '',
    context: '',
    methodology: '',
    contribution: '',
    references: '',
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/journal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate proposal')
      }

      const data = await response.json()
      setGeneratedProposal(data.proposal)
      setEditedProposal(data.proposal)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedProposal)
    alert('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([editedProposal], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `research-proposal-${formData.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setGeneratedProposal(null)
    setEditedProposal('')
    setFormData({
      title: '',
      journal: '',
      field: '',
      researchQuestion: '',
      context: '',
      methodology: '',
      contribution: '',
      references: '',
    })
  }

  if (generatedProposal) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Generated Proposal Card */}
        <div className="bg-white rounded-3xl p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Your Research Proposal</h3>
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

          {/* Editable Proposal */}
          <textarea
            value={editedProposal}
            onChange={(e) => setEditedProposal(e.target.value)}
            className="w-full px-4 py-3 border-2 border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose font-serif text-sm leading-relaxed resize-none"
            rows={25}
          />

          <p className="text-xs text-sage-gray mt-2">
            Feel free to edit the proposal above. Click Copy when ready to paste into your submission.
          </p>
        </div>

        {/* Proposal Details Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <h4 className="font-semibold text-black mb-3">Proposal Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-sage-gray">Title:</span>
              <span className="text-black font-medium">{formData.title}</span>
            </div>
            {formData.journal && (
              <div className="flex gap-2">
                <span className="text-sage-gray">Target Journal:</span>
                <span className="text-black font-medium">{formData.journal}</span>
              </div>
            )}
            {formData.field && (
              <div className="flex gap-2">
                <span className="text-sage-gray">Field:</span>
                <span className="text-black font-medium">{formData.field}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-sage-gray">Question:</span>
              <span className="text-black font-medium">{formData.researchQuestion}</span>
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
            📚
          </div>
          <div>
            <h3 className="text-lg font-bold text-black mb-2">AI-Powered Research Proposals</h3>
            <p className="text-sm text-sage-gray">
              I&apos;ll help you craft a formal research proposal with proper academic structure.
              Provide as much detail as possible for the best results.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Research Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Impact of AI on Healthcare Delivery in Rural Communities"
            required
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Target Journal (Optional)
            </label>
            <input
              type="text"
              value={formData.journal}
              onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
              placeholder="e.g., Nature Medicine"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Research Field (Optional)
            </label>
            <input
              type="text"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              placeholder="e.g., Health Informatics"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Research Question *
          </label>
          <textarea
            value={formData.researchQuestion}
            onChange={(e) => setFormData({ ...formData, researchQuestion: e.target.value })}
            placeholder="What specific question will your research address? Be clear and focused."
            required
            rows={3}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Research Context/Background
          </label>
          <textarea
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            placeholder="Provide background information, literature gaps, or context for your research..."
            rows={4}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
          />
          <p className="text-xs text-sage-gray mt-1">
            Explain why this research is important and what gap it fills
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Methodology
          </label>
          <textarea
            value={formData.methodology}
            onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
            placeholder="Describe your research methods, approach, data collection, analysis techniques..."
            rows={4}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
          />
          <p className="text-xs text-sage-gray mt-1">
            How will you conduct this research?
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Expected Contribution
          </label>
          <textarea
            value={formData.contribution}
            onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
            placeholder="What will your research contribute to the field? What impact do you expect?"
            rows={3}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
          />
          <p className="text-xs text-sage-gray mt-1">
            Why does this research matter?
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            References (Optional)
          </label>
          <textarea
            value={formData.references}
            onChange={(e) => setFormData({ ...formData, references: e.target.value })}
            placeholder="List any key citations or references you want included..."
            rows={3}
            className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
          />
          <p className="text-xs text-sage-gray mt-1">
            Include important papers or resources to reference
          </p>
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
            Generating Your Proposal...
          </span>
        ) : (
          '✨ Generate Research Proposal'
        )}
      </button>

      <p className="text-xs text-sage-gray text-center">
        Your proposal will be tailored to your research profile and career goals
      </p>
    </form>
  )
}

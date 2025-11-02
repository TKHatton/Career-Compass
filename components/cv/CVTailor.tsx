'use client'

import { useState } from 'react'

interface CVTailorProps {
  docId: string
  userId: string
  onComplete: () => void
}

export default function CVTailor({ docId, userId, onComplete }: CVTailorProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cv/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseDocId: docId,
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim() || undefined,
          company: company.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to tailor CV')
      }

      const data = await response.json()

      // Success
      onComplete()
    } catch (err: any) {
      console.error('Tailor error:', err)
      setError(err.message || 'Failed to tailor CV')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-sage-gray space-y-4">
      <div>
        <h3 className="text-base font-medium text-black mb-3">
          Tailor to Job Description
        </h3>
        <p className="text-xs text-sage-gray mb-4">
          Paste the job description below. Your CV will be tailored to emphasize
          relevant experience and skills. PII will be redacted during processing.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Job Title (optional)
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Senior Product Manager"
            className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose text-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Company (optional)
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g., Acme Corp"
            className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose text-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Job Description *
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose text-sm resize-none"
            disabled={loading}
          />
          <p className="text-xs text-sage-gray mt-1">
            {jobDescription.length} characters
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleTailor}
          disabled={loading || !jobDescription.trim()}
          className="flex-1 bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Tailoring...
            </span>
          ) : (
            'Tailor CV'
          )}
        </button>
        <button
          onClick={() => onComplete()}
          disabled={loading}
          className="px-4 py-3 text-black border border-sage-gray rounded-lg hover:bg-sand-rose transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {loading && (
        <div className="bg-mist-teal rounded-lg p-3">
          <p className="text-xs text-black">
            This may take 10-30 seconds. Your CV is being analyzed and tailored to
            match the job requirements.
          </p>
        </div>
      )}
    </div>
  )
}

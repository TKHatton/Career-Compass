'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'brainstorm' | 'outline' | 'draft' | 'polish'

export default function SubstackCreator() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('brainstorm')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<string>('')

  const [formData, setFormData] = useState({
    topic: '',
    title: '',
    voice: 'conversational',
    existingContent: '',
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/substack/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data.content)
      setEditedContent(data.content)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent)
    alert('Copied to clipboard!')
  }

  const handleDownloadMarkdown = () => {
    const blob = new Blob([editedContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `article-${mode}-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setGeneratedContent(null)
    setEditedContent('')
    setFormData({
      topic: '',
      title: '',
      voice: 'conversational',
      existingContent: '',
    })
  }

  const handleUseForNext = () => {
    if (mode === 'brainstorm') {
      setMode('outline')
      setFormData({ ...formData, existingContent: editedContent })
    } else if (mode === 'outline') {
      setMode('draft')
      setFormData({ ...formData, existingContent: editedContent })
    } else if (mode === 'draft') {
      setMode('polish')
      setFormData({ ...formData, existingContent: editedContent })
    }
    setGeneratedContent(null)
    setEditedContent('')
  }

  if (generatedContent) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Generated Content Card */}
        <div className="bg-white rounded-3xl p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black capitalize">{mode} Result</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-mist-teal text-black font-medium rounded-2xl shadow-soft hover:shadow-elevated transition-all text-sm"
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className="px-4 py-2 bg-sand-rose text-black font-medium rounded-2xl shadow-soft hover:shadow-elevated transition-all text-sm"
              >
                💾 Download
              </button>
            </div>
          </div>

          {/* Editable Content */}
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-4 py-3 border-2 border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose font-mono text-sm leading-relaxed resize-none"
            rows={mode === 'brainstorm' ? 30 : 25}
          />

          <p className="text-xs text-sage-gray mt-2">
            Edit the content above as needed. Supports markdown formatting.
          </p>
        </div>

        {/* Details Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <h4 className="font-semibold text-black mb-3">Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-sage-gray">Mode:</span>
              <span className="text-black font-medium capitalize">{mode}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-sage-gray">Topic:</span>
              <span className="text-black font-medium">{formData.topic}</span>
            </div>
            {formData.voice && mode !== 'brainstorm' && (
              <div className="flex gap-2">
                <span className="text-sage-gray">Voice:</span>
                <span className="text-black font-medium capitalize">{formData.voice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 bg-white text-black font-medium py-3 px-4 rounded-2xl shadow-soft hover:shadow-elevated transition-all"
          >
            Start Over
          </button>
          {mode !== 'polish' && (
            <button
              onClick={handleUseForNext}
              className="flex-1 bg-mist-teal text-black font-medium py-3 px-4 rounded-2xl shadow-soft hover:shadow-elevated transition-all"
            >
              Use for {mode === 'brainstorm' ? 'Outline' : mode === 'outline' ? 'Draft' : 'Polish'} →
            </button>
          )}
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
            ✍️
          </div>
          <div>
            <h3 className="text-lg font-bold text-black mb-2">AI-Powered Article Creation</h3>
            <p className="text-sm text-sage-gray">
              Create newsletter content from brainstorm to polished draft. Choose your mode below.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <label className="block text-sm font-medium text-black mb-3">Select Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('brainstorm')}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              mode === 'brainstorm'
                ? 'border-clay-rose bg-clay-rose bg-opacity-10'
                : 'border-sage-gray hover:border-mist-teal'
            }`}
          >
            <div className="text-lg mb-1">💡</div>
            <div className="font-semibold text-black">Brainstorm</div>
            <div className="text-xs text-sage-gray">5 article angles</div>
          </button>

          <button
            type="button"
            onClick={() => setMode('outline')}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              mode === 'outline'
                ? 'border-clay-rose bg-clay-rose bg-opacity-10'
                : 'border-sage-gray hover:border-mist-teal'
            }`}
          >
            <div className="text-lg mb-1">📝</div>
            <div className="font-semibold text-black">Outline</div>
            <div className="text-xs text-sage-gray">Structured plan</div>
          </button>

          <button
            type="button"
            onClick={() => setMode('draft')}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              mode === 'draft'
                ? 'border-clay-rose bg-clay-rose bg-opacity-10'
                : 'border-sage-gray hover:border-mist-teal'
            }`}
          >
            <div className="text-lg mb-1">✨</div>
            <div className="font-semibold text-black">Draft</div>
            <div className="text-xs text-sage-gray">Full article</div>
          </button>

          <button
            type="button"
            onClick={() => setMode('polish')}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              mode === 'polish'
                ? 'border-clay-rose bg-clay-rose bg-opacity-10'
                : 'border-sage-gray hover:border-mist-teal'
            }`}
          >
            <div className="text-lg mb-1">✨</div>
            <div className="font-semibold text-black">Polish</div>
            <div className="text-xs text-sage-gray">Refine draft</div>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4">
        {/* Topic - Required for all modes except polish */}
        {mode !== 'polish' && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Topic/Theme *
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder={
                mode === 'brainstorm'
                  ? 'e.g., Remote work productivity tips'
                  : mode === 'outline'
                  ? 'e.g., Building habits that stick'
                  : 'e.g., Why side projects matter'
              }
              required
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>
        )}

        {/* Title - Only for draft mode */}
        {mode === 'draft' && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Article Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., 5 Lessons from Building in Public"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>
        )}

        {/* Voice - For outline and draft */}
        {(mode === 'outline' || mode === 'draft') && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Writing Voice
            </label>
            <select
              value={formData.voice}
              onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            >
              <option value="conversational">Conversational & Friendly</option>
              <option value="professional">Professional & Polished</option>
              <option value="casual">Casual & Personal</option>
              <option value="authoritative">Authoritative & Expert</option>
              <option value="storytelling">Storytelling & Narrative</option>
            </select>
          </div>
        )}

        {/* Existing Content - For outline, draft, and polish */}
        {(mode === 'outline' || mode === 'draft' || mode === 'polish') && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {mode === 'polish' ? 'Content to Polish *' : 'Notes/Outline (Optional)'}
            </label>
            <textarea
              value={formData.existingContent}
              onChange={(e) => setFormData({ ...formData, existingContent: e.target.value })}
              placeholder={
                mode === 'polish'
                  ? 'Paste your draft here to refine and improve...'
                  : mode === 'outline'
                  ? 'Any initial thoughts or structure ideas...'
                  : 'Paste outline or key points to include...'
              }
              required={mode === 'polish'}
              rows={8}
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none font-mono text-sm"
            />
            <p className="text-xs text-sage-gray mt-1">
              {mode === 'polish'
                ? 'AI will improve flow, reduce filler, and strengthen your writing'
                : mode === 'draft'
                ? 'Optional: Provide an outline or notes to guide the draft'
                : 'Optional: Add any ideas or structure you have in mind'}
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-clay-rose text-white font-bold py-4 px-6 rounded-3xl shadow-elevated hover:shadow-float transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙️</span>
            Generating...
          </span>
        ) : (
          <>
            ✨ Generate {mode === 'brainstorm' ? 'Ideas' : mode === 'outline' ? 'Outline' : mode === 'draft' ? 'Article' : 'Polish'}
          </>
        )}
      </button>

      <p className="text-xs text-sage-gray text-center">
        {mode === 'brainstorm' && 'Get 5 unique angles with titles, hooks, and key points'}
        {mode === 'outline' && 'Create a structured outline with sections and transitions'}
        {mode === 'draft' && 'Generate a complete 800-1200 word article'}
        {mode === 'polish' && 'Refine your draft for clarity, flow, and impact'}
      </p>
    </form>
  )
}

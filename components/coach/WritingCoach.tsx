'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  actionType?: string
}

export default function WritingCoach() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToneMenu, setShowToneMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageText: string, actionType?: string, tone?: string) => {
    if (!messageText.trim() && !actionType) return

    const userMessage = messageText.trim()

    // Add user message to UI
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      actionType: actionType || 'general',
    }
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setLoading(true)
    setShowToneMenu(false)

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          actionType: actionType || 'general',
          tone: tone || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Update session ID if new
      if (!sessionId) {
        setSessionId(data.sessionId)
      }

      // Add assistant message to UI
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      console.error('Error:', err)
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleUpgradePrompt = () => {
    if (!input.trim()) return
    sendMessage(input, 'upgrade_prompt')
  }

  const handleToneAdjust = (tone: string) => {
    if (!input.trim()) return
    sendMessage(input, 'tone_adjust', tone)
  }

  const handleCopyEdit = () => {
    if (!input.trim()) return
    sendMessage(input, 'copy_edit')
  }

  const handleNewSession = () => {
    setSessionId(null)
    setMessages([])
    setInput('')
  }

  return (
    <div className="space-y-4">
      {/* Welcome Card */}
      {messages.length === 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-elevated border-2 border-mist-teal animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-xl flex-shrink-0 shadow-soft">
              💬
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-2">Your Writing Coach</h3>
              <p className="text-sm text-sage-gray mb-3">
                I&apos;m here to help with any writing task. Ask questions, get feedback, or use the quick actions below.
              </p>
              <div className="space-y-2 text-sm text-black">
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span><strong>Upgrade Prompt:</strong> Refine your request for better results</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎨</span>
                  <span><strong>Tone Adjust:</strong> Change the voice of your writing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✏️</span>
                  <span><strong>Copy Edit:</strong> Polish grammar and clarity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4 max-h-[500px] overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-clay-rose flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  AI
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-clay-rose text-white'
                    : 'bg-sand-rose text-black'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.actionType && msg.actionType !== 'general' && (
                  <p className="text-xs mt-2 opacity-70 capitalize">
                    {msg.actionType.replace('_', ' ')}
                  </p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-mist-teal flex items-center justify-center text-black text-sm font-bold flex-shrink-0">
                  U
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-clay-rose flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                AI
              </div>
              <div className="bg-sand-rose text-black rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your writing question, paste text to improve, or ask for help..."
            rows={6}
            className="w-full px-4 py-3 border-2 border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none text-sm"
            disabled={loading}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUpgradePrompt}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-mist-teal text-black font-medium rounded-2xl shadow-soft hover:shadow-elevated transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✨ Upgrade Prompt
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowToneMenu(!showToneMenu)}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-sand-rose text-black font-medium rounded-2xl shadow-soft hover:shadow-elevated transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎨 Tone Adjust
              </button>

              {showToneMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-elevated border border-sage-gray p-2 space-y-1 z-10">
                  <button
                    type="button"
                    onClick={() => handleToneAdjust('professional')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-rose transition-colors text-sm"
                  >
                    Professional
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToneAdjust('casual')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-rose transition-colors text-sm"
                  >
                    Casual
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToneAdjust('enthusiastic')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-sand-rose transition-colors text-sm"
                  >
                    Enthusiastic
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyEdit}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-sage-gray text-white font-medium rounded-2xl shadow-soft hover:shadow-elevated transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✏️ Copy Edit
            </button>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex-1 bg-clay-rose text-white font-bold py-2 px-6 rounded-2xl shadow-soft hover:shadow-elevated transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Thinking...' : 'Send Message'}
            </button>
          </div>
        </form>

        {messages.length > 0 && (
          <div className="pt-3 border-t border-sage-gray">
            <button
              onClick={handleNewSession}
              className="text-sm text-sage-gray hover:text-black transition-colors"
            >
              🔄 Start New Session
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-sage-gray text-center">
        Your writing coach provides personalized feedback based on your profile and goals
      </p>
    </div>
  )
}

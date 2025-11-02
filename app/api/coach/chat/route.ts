import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId, message, actionType, tone } = body

    // Get user profile
    const { data: profile } = await supabase
      .from('profile')
      .select('long_term_goal, values_json, strengths_json')
      .eq('user_id', user.id)
      .single()

    // Get or create session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('coaching_sessions')
        .insert({
          user_id: user.id,
          title: 'Writing Session',
        })
        .select()
        .single()

      if (sessionError) {
        throw new Error('Failed to create session')
      }
      currentSessionId = newSession.id
    }

    // Get conversation history
    const { data: history } = await supabase
      .from('coaching_messages')
      .select('*')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })

    // Build system prompt based on action type
    let systemPrompt = `You are a professional writing coach helping someone improve their writing. You provide thoughtful, actionable feedback.

USER'S BACKGROUND:
Career Focus: ${profile?.long_term_goal || 'Not specified'}
Values: ${profile?.values_json?.join(', ') || 'Not specified'}
Expertise: ${profile?.strengths_json?.join(', ') || 'Not specified'}
`

    if (actionType === 'upgrade_prompt') {
      systemPrompt += `
TASK: The user needs help refining their writing prompt or request. Help them make it more specific, actionable, and likely to get better results. Ask clarifying questions if needed, or suggest improved versions of their prompt.

Be concise and helpful. Focus on making their request clearer and more effective.`

    } else if (actionType === 'tone_adjust') {
      systemPrompt += `
TASK: Help adjust the tone of their writing to be ${tone || 'more professional'}.

TONE REQUESTED: ${tone || 'professional'}

Provide the revised version and briefly explain the key changes. Maintain the core message while adjusting:
- Word choice
- Sentence structure
- Level of formality
- Emotional tenor

Be concise - show them the improved version and explain what changed.`

    } else if (actionType === 'copy_edit') {
      systemPrompt += `
TASK: Provide a clean copy edit focused on:
1. Grammar and punctuation
2. Clarity and conciseness
3. Sentence structure and flow
4. Consistency

Provide the edited version and a brief summary of main changes. Don't rewrite their voice - just polish and clarify.`

    } else {
      systemPrompt += `
TASK: Provide general writing assistance. Help with brainstorming, structure, clarity, or any writing challenge they bring.

Be supportive, practical, and concise. Ask questions to understand their needs better if something is unclear.`
    }

    // Build conversation messages for Claude
    const conversationMessages = []

    // Add history
    if (history && history.length > 0) {
      for (const msg of history) {
        conversationMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })
      }
    }

    // Add current message
    conversationMessages.push({
      role: 'user' as const,
      content: message,
    })

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: conversationMessages,
    })

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

    // Save user message
    await supabase
      .from('coaching_messages')
      .insert({
        session_id: currentSessionId,
        role: 'user',
        content: message,
        action_type: actionType || 'general',
      })

    // Save assistant message
    await supabase
      .from('coaching_messages')
      .insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: assistantMessage,
        action_type: actionType || 'general',
      })

    // Update session timestamp
    await supabase
      .from('coaching_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentSessionId)

    return NextResponse.json({
      message: assistantMessage,
      sessionId: currentSessionId,
    })
  } catch (err: any) {
    console.error('Writing coach error:', err)
    return NextResponse.json(
      { error: 'Failed to process message', details: err.message },
      { status: 500 }
    )
  }
}

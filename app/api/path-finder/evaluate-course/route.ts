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
    const { title, provider, cost, duration, description, skills, userGoal, userValues } = body

    // Build the prompt for Claude
    const prompt = `You are a career advisor helping someone evaluate a course. Analyze this course against their career goals and values.

USER'S CAREER CONTEXT:
Long-term Goal: ${userGoal || 'Not specified'}
Values: ${userValues?.join(', ') || 'Not specified'}

COURSE DETAILS:
Title: ${title}
Provider: ${provider}
Cost: $${cost || 'Not specified'}
Duration: ${duration || 'Not specified'} weeks
Description: ${description}
Skills: ${skills || 'Not specified'}

Please provide a comprehensive evaluation using this weighted scoring system:
1. Goal Alignment (35%): How well does this course align with their long-term career goal?
2. Provider Credibility (20%): How credible and reputable is the provider?
3. ROI Analysis (25%): Cost vs. potential 6-12 month return on investment
4. Skills Gap Coverage (20%): How well does it cover needed skills?

Return your analysis in this exact JSON format:
{
  "score": <overall score 0-100>,
  "breakdown": {
    "goal_alignment": { "score": <0-100>, "notes": "Brief explanation" },
    "provider_credibility": { "score": <0-100>, "notes": "Brief explanation" },
    "roi": { "score": <0-100>, "notes": "Brief explanation" },
    "skills_coverage": { "score": <0-100>, "notes": "Brief explanation" }
  },
  "analysis": {
    "goal_alignment": "How this course aligns with their goal",
    "tradeoffs": {
      "pros": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "cons": ["Drawback 1", "Drawback 2", "Drawback 3"]
    },
    "recommendation": "Clear recommendation: Should they take this course? Why or why not?",
    "next_action": "Specific next step they should take"
  }
}

Be honest, practical, and considerate of their financial situation. If the course seems overpriced or misaligned, say so clearly.`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const evaluation = JSON.parse(jsonMatch[0])

    // Save to database
    const { data: savedEvaluation, error: dbError } = await supabase
      .from('course_evaluations')
      .insert({
        user_id: user.id,
        type: 'course',
        title,
        provider,
        cost: cost ? parseFloat(cost) : null,
        duration_weeks: duration ? parseInt(duration) : null,
        input_data: {
          description,
          skills,
          userGoal,
          userValues,
        },
        analysis_result: evaluation,
        score: evaluation.score,
        recommendation: evaluation.analysis?.recommendation,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway, return the evaluation
    }

    return NextResponse.json(evaluation)
  } catch (err: any) {
    console.error('Course evaluation error:', err)
    return NextResponse.json(
      { error: 'Failed to evaluate course', details: err.message },
      { status: 500 }
    )
  }
}

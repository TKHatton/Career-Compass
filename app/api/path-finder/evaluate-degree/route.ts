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
    const {
      degreeType,
      field,
      institution,
      totalCost,
      durationYears,
      weeklyHours,
      format,
      fundingOptions,
      description,
      userGoal,
      userValues
    } = body

    // Build the prompt for Claude
    const prompt = `You are a career advisor helping someone make a critical decision about pursuing a degree. Analyze this degree program against their career goals and values.

USER'S CAREER CONTEXT:
Long-term Goal: ${userGoal || 'Not specified'}
Values: ${userValues?.join(', ') || 'Not specified'}

DEGREE PROGRAM DETAILS:
Type: ${degreeType}
Field: ${field}
Institution: ${institution || 'Various institutions'}
Format: ${format}
Total Cost: $${totalCost || 'Not specified'}
Duration: ${durationYears || 'Not specified'} years
Expected Weekly Hours: ${weeklyHours || 'Not specified'} hours
Funding Options: ${fundingOptions || 'Not specified'}
Description: ${description}

Please provide a comprehensive analysis with the following structure:

1. DECISION: Based on all factors, should they pursue this now ("buy") or explore other options first ("explore")? Be decisive but honest.

2. PROGRAM COMPARISON: Suggest 3 variations of this degree/field they should consider:
   - One premium option (higher cost, prestigious)
   - One balanced option (moderate cost/benefit)
   - One accessible option (lower cost, flexible)
   For each, include specific pros and cons (3-4 each).

3. WEEKLY LOAD BREAKDOWN: Estimate realistic weekly time commitment broken down by:
   - lectures: X hours
   - assignments: X hours
   - reading: X hours
   - projects: X hours
   - study_groups: X hours

4. FUNDING ANALYSIS: Realistic assessment of funding options, scholarships, ROI timeline, and whether the investment makes sense given their goals.

5. GOAL ALIGNMENT: How this degree specifically advances their stated career goal. Be specific about career outcomes.

6. NEXT STEPS: 3-5 specific, actionable steps they should take (e.g., "Research X scholarship", "Contact Y advisor", "Complete Z application")

Return your analysis in this exact JSON format:
{
  "decision": "buy" or "explore",
  "decision_rationale": "1-2 sentences explaining why",
  "program_comparison": [
    {
      "name": "Program name/type",
      "institution": "Institution name or 'Various'",
      "cost": "Cost estimate",
      "duration": "Duration",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"]
    }
  ],
  "weekly_load": {
    "lectures": number,
    "assignments": number,
    "reading": number,
    "projects": number,
    "study_groups": number
  },
  "funding_analysis": "Detailed paragraph about funding reality, ROI, and financial feasibility",
  "goal_alignment": "Detailed paragraph about how this advances their specific career goal",
  "next_steps": ["Step 1", "Step 2", "Step 3", ...]
}

Be brutally honest. If this degree seems like a poor investment or misaligned with their goals, say so clearly. Consider their financial situation and whether the ROI justifies the cost and time commitment.`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response
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
        type: 'degree',
        title: `${degreeType} in ${field}`,
        provider: institution || 'Various',
        cost: totalCost ? parseFloat(totalCost) : null,
        duration_weeks: durationYears ? parseFloat(durationYears) * 52 : null,
        input_data: {
          degreeType,
          field,
          format,
          weeklyHours,
          fundingOptions,
          description,
          userGoal,
          userValues,
        },
        analysis_result: evaluation,
        score: evaluation.decision === 'buy' ? 80 : 50, // Simplified score based on decision
        recommendation: evaluation.decision_rationale,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway, return the evaluation
    }

    return NextResponse.json(evaluation)
  } catch (err: any) {
    console.error('Degree evaluation error:', err)
    return NextResponse.json(
      { error: 'Failed to evaluate degree', details: err.message },
      { status: 500 }
    )
  }
}

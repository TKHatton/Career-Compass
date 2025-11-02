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
    const { jobTitle, company, jobDescription, tone } = body

    // Get user profile
    const { data: profile } = await supabase
      .from('profile')
      .select('long_term_goal, values_json, strengths_json')
      .eq('user_id', user.id)
      .single()

    // Get most recent CV if available
    const { data: recentCV } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Build the prompt for Claude
    const prompt = `You are a professional cover letter writer helping someone apply for a job. Write a compelling, authentic cover letter that showcases their unique value.

USER'S PROFILE:
Career Goal: ${profile?.long_term_goal || 'Not specified'}
Values: ${profile?.values_json?.join(', ') || 'Not specified'}
Strengths: ${profile?.strengths_json?.join(', ') || 'Not specified'}

JOB DETAILS:
Position: ${jobTitle}
Company: ${company}
Description: ${jobDescription}

TONE: ${tone || 'professional'}

${recentCV ? `RECENT EXPERIENCE/BACKGROUND:
${JSON.stringify(recentCV.job_meta_json || {}, null, 2)}` : ''}

Please write a cover letter that:
1. Opens with a strong hook that shows genuine interest
2. Connects their strengths and values to this specific role
3. Demonstrates understanding of the company/role
4. Provides specific examples of relevant experience or skills
5. Shows enthusiasm and cultural fit
6. Closes with a clear call to action
7. Is ${tone || 'professional'} in tone but authentic and personable
8. Is 3-4 paragraphs, concise but impactful

Format the letter with:
- Proper spacing between paragraphs
- Professional but warm language
- No placeholder text like [Your Name] - leave signature line blank
- No address block at top (they'll add that)

Return ONLY the letter body text, starting with "Dear Hiring Manager," (or use company name if appropriate).`

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

    // Get the letter text
    const letterText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to database
    const { data: savedLetter, error: dbError } = await supabase
      .from('letters')
      .insert({
        user_id: user.id,
        job_meta_json: {
          title: jobTitle,
          company,
          description: jobDescription,
          tone,
        },
        draft_txt: letterText,
        draft_html: letterText.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>'),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.json({
      letter: letterText,
      id: savedLetter?.id,
    })
  } catch (err: any) {
    console.error('Letter generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate cover letter', details: err.message },
      { status: 500 }
    )
  }
}

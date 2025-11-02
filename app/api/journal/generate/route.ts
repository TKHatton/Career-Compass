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
      title,
      journal,
      field,
      researchQuestion,
      context,
      methodology,
      contribution,
      references
    } = body

    // Get user profile
    const { data: profile } = await supabase
      .from('profile')
      .select('long_term_goal, values_json, strengths_json')
      .eq('user_id', user.id)
      .single()

    // Build the prompt for Claude
    const prompt = `You are an experienced academic writing consultant helping someone craft a formal research proposal for journal submission. Write a compelling, well-structured proposal that meets academic standards.

USER'S RESEARCH PROFILE:
Career Goal: ${profile?.long_term_goal || 'Not specified'}
Research Interests/Values: ${profile?.values_json?.join(', ') || 'Not specified'}
Strengths: ${profile?.strengths_json?.join(', ') || 'Not specified'}

PROPOSAL DETAILS:
Title: ${title}
Target Journal/Venue: ${journal || 'Not specified'}
Research Field: ${field || 'Not specified'}
Research Question: ${researchQuestion}
Research Context/Background: ${context || 'Not provided'}
Methodology: ${methodology || 'Not provided'}
Expected Contribution: ${contribution || 'Not provided'}
${references ? `References/Citations: ${references}` : ''}

Please write a formal research proposal that:
1. Opens with a compelling abstract (150-200 words) summarizing the entire proposal
2. Provides clear background/context establishing the research gap
3. States the research question and objectives precisely
4. Describes the methodology in appropriate detail
5. Explains the expected contribution and significance
6. Uses formal academic language and structure
7. Maintains logical flow between sections
8. Is comprehensive yet concise (aim for 800-1200 words total)

Format the proposal with:
- Clear section headings: Abstract, Introduction/Background, Research Question, Methodology, Expected Contribution, Conclusion
- Proper paragraph spacing
- Academic tone but accessible language
- No placeholder text
${references ? '- Reference citations integrated naturally' : ''}

Return ONLY the proposal text with section headings.`

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

    // Get the proposal text
    const proposalText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to database
    const { data: savedProposal, error: dbError } = await supabase
      .from('journal_proposals')
      .insert({
        user_id: user.id,
        proposal_meta_json: {
          title,
          journal,
          field,
        },
        research_question: researchQuestion,
        research_context: context || '',
        methodology: methodology || '',
        contribution: contribution || '',
        references_text: references || '',
        draft_txt: proposalText,
        draft_html: proposalText
          .split('\n\n')
          .map(para => para.startsWith('#') ? `<h2>${para.replace(/^#+\s*/, '')}</h2>` : `<p>${para}</p>`)
          .join('\n'),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.json({
      proposal: proposalText,
      id: savedProposal?.id,
    })
  } catch (err: any) {
    console.error('Proposal generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate proposal', details: err.message },
      { status: 500 }
    )
  }
}

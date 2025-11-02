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
    const { mode, topic, voice, existingContent, title } = body

    // Get user profile
    const { data: profile } = await supabase
      .from('profile')
      .select('long_term_goal, values_json, strengths_json')
      .eq('user_id', user.id)
      .single()

    let prompt = ''
    let maxTokens = 2000

    // Build prompts based on mode
    if (mode === 'brainstorm') {
      prompt = `You are a creative content strategist helping someone brainstorm article ideas for their newsletter/blog.

USER'S PROFILE:
Career Focus: ${profile?.long_term_goal || 'Not specified'}
Values: ${profile?.values_json?.join(', ') || 'Not specified'}
Expertise: ${profile?.strengths_json?.join(', ') || 'Not specified'}

TOPIC/THEME: ${topic}

Generate 5 different article angles on this topic. For each angle, provide:
1. A compelling title (attention-grabbing)
2. A hook (opening line that draws readers in)
3. 3-4 key talking points

Make the angles diverse - some practical, some thought-provoking, some personal, some data-driven.

Format as:
**Angle 1: [Title]**
Hook: [Opening line]
Key Points:
- [Point 1]
- [Point 2]
- [Point 3]

[Repeat for all 5 angles]`
      maxTokens = 2500

    } else if (mode === 'outline') {
      prompt = `You are an editorial consultant helping someone outline a newsletter article.

USER'S PROFILE:
Career Focus: ${profile?.long_term_goal || 'Not specified'}
Values: ${profile?.values_json?.join(', ') || 'Not specified'}

ARTICLE TOPIC: ${topic}
${voice ? `WRITING VOICE: ${voice}` : ''}

Create a structured outline for this article that includes:
1. Opening Hook - How to grab attention in the first paragraph
2. Main Sections - 3-5 clear sections with subpoints
3. Transitions - Notes on how to connect sections
4. Conclusion - Call to action or takeaway

Make the outline practical and actionable. Include notes on tone, examples to include, and where to add personal stories.

Format clearly with headers and bullet points.`
      maxTokens = 2000

    } else if (mode === 'draft') {
      prompt = `You are a skilled newsletter writer helping someone draft an article.

USER'S PROFILE:
Career Focus: ${profile?.long_term_goal || 'Not specified'}
Values: ${profile?.values_json?.join(', ') || 'Not specified'}
Expertise: ${profile?.strengths_json?.join(', ') || 'Not specified'}

ARTICLE TOPIC: ${topic}
${title ? `TITLE: ${title}` : ''}
WRITING VOICE: ${voice || 'conversational and authentic'}
${existingContent ? `OUTLINE/NOTES:\n${existingContent}` : ''}

Write a complete article (800-1200 words) that:
- Opens with a strong hook that draws readers in
- Has clear sections with headers
- Uses ${voice || 'conversational'} tone throughout
- Includes specific examples and actionable insights
- Avoids jargon and keeps language accessible
- Ends with a clear takeaway or call to action
- Feels personal and authentic (not AI-generated)

${existingContent ? 'Use the outline/notes provided as a guide.' : ''}

Write the full article now. Use markdown for formatting (## for headers, **bold** for emphasis).`
      maxTokens = 3500

    } else if (mode === 'polish') {
      prompt = `You are an editor helping someone polish their article for publication.

ARTICLE TO POLISH:
${existingContent}

Improve this article by:
1. **Reducing filler** - Cut unnecessary words, tighten sentences
2. **Improving flow** - Better transitions, logical progression
3. **Keeping claims modest** - Replace overstatements with grounded language
4. **Enhancing readability** - Vary sentence length, break up dense paragraphs
5. **Strengthening the hook** - Make the opening more compelling
6. **Adding punch** - Make key points memorable

Maintain the original voice and perspective. Don't add new content - just refine what's there.

Return the polished version with the same structure. Use markdown formatting.`
      maxTokens = 3500
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Get the generated text
    const generatedText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Convert markdown to HTML (basic conversion)
    const htmlContent = generatedText
      .split('\n\n')
      .map(para => {
        if (para.startsWith('## ')) {
          return `<h2>${para.replace(/^##\s*/, '')}</h2>`
        } else if (para.startsWith('# ')) {
          return `<h1>${para.replace(/^#\s*/, '')}</h1>`
        } else if (para.startsWith('- ') || para.startsWith('* ')) {
          const items = para.split('\n').map(item =>
            `<li>${item.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`
          ).join('\n')
          return `<ul>\n${items}\n</ul>`
        } else {
          return `<p>${para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`
        }
      })
      .join('\n')

    // Save to database
    const { data: savedArticle, error: dbError } = await supabase
      .from('substack_articles')
      .insert({
        user_id: user.id,
        mode,
        article_meta_json: {
          topic,
          voice: voice || null,
          title: title || null,
        },
        input_text: existingContent || null,
        draft_txt: generatedText,
        draft_html: htmlContent,
        draft_markdown: generatedText,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.json({
      content: generatedText,
      html: htmlContent,
      markdown: generatedText,
      id: savedArticle?.id,
    })
  } catch (err: any) {
    console.error('Substack generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate content', details: err.message },
      { status: 500 }
    )
  }
}

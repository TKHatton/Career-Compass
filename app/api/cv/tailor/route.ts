import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { redactText, rehydrateText } from '@/lib/redaction/redactor'
import { decryptRedactionMap } from '@/lib/redaction/crypto'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { baseDocId, jobDescription, jobTitle, company } = body

    if (!baseDocId || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Fetch the base document
    const { data: doc, error: docError } = await supabase
      .from('docs')
      .select('*')
      .eq('id', baseDocId)
      .eq('user_id', user.id)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // 2. Parse meta and get redacted CV text
    const meta = JSON.parse(doc.meta_encrypted || '{}')
    const cvRedacted = meta.redacted_text
    const encryptedMap = meta.redaction_map_encrypted
    const encryptionKey = meta.encryption_key

    if (!cvRedacted) {
      return NextResponse.json(
        { error: 'CV text not found' },
        { status: 400 }
      )
    }

    // 3. Redact the job description as well (client should do this, but double-check)
    const { redactedText: jobDescRedacted, redactionMap: jobRedactionMap } =
      redactText(jobDescription)

    // 4. Call Anthropic to tailor the CV
    const prompt = `You are a professional CV tailoring assistant. You help candidates tailor their CV to specific job opportunities by emphasizing relevant experience and skills.

# Task
Tailor the following CV to match the job description below. The tailored CV should:
- Emphasize experience and skills relevant to the job
- Use keywords from the job description naturally
- Maintain truthfulness (do not add fake experience)
- Keep the same structure and format
- Stay within 2 pages maximum
- Highlight quantified achievements that match the role

# Original CV:
${cvRedacted}

# Job Details:
${jobTitle ? `Position: ${jobTitle}` : ''}
${company ? `Company: ${company}` : ''}

# Job Description:
${jobDescRedacted}

# Instructions:
Return ONLY the tailored CV text, maintaining the original structure. Do not add explanations or meta-commentary.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const tailoredCVRedacted = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    if (!tailoredCVRedacted) {
      throw new Error('No response from model')
    }

    // 5. Rehydrate the tailored CV (replace PII tokens with original values)
    // Decrypt the redaction map first
    const originalRedactionMap = await decryptRedactionMap(
      encryptedMap,
      encryptionKey
    )

    const tailoredCVFull = rehydrateText(tailoredCVRedacted, originalRedactionMap)

    // 6. Generate a diff summary
    const diffSummary = `Tailored for ${jobTitle || 'position'}${company ? ` at ${company}` : ''}`

    // 7. Store the tailored version in cv_versions table
    const { data: version, error: versionError } = await supabase
      .from('cv_versions')
      .insert({
        user_id: user.id,
        base_doc_id: baseDocId,
        job_meta_json: {
          job_title: jobTitle,
          company,
          job_description: jobDescription,
        },
        diff_summary: diffSummary,
        file_paths_json: {
          // TODO: Generate DOCX/PDF and store paths
          text: tailoredCVFull,
        },
      })
      .select()
      .single()

    if (versionError) {
      throw versionError
    }

    return NextResponse.json({
      versionId: version.id,
      tailoredText: tailoredCVFull,
      diffSummary,
    })
  } catch (error: any) {
    console.error('Tailor error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to tailor CV' },
      { status: 500 }
    )
  }
}

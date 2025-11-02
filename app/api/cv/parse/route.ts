import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''

    // Parse based on file type
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword') {
      // Parse DOCX using mammoth
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (file.type === 'application/pdf') {
      // For PDF, we'd need pdf-parse library
      // For MVP, return error or use a simple approach
      return NextResponse.json(
        { error: 'PDF parsing not yet implemented. Please use DOCX or TXT.' },
        { status: 400 }
      )
    } else if (file.type === 'text/plain') {
      // Plain text
      text = buffer.toString('utf-8')
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Clean up text
    text = text.trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Could not extract text from document' },
        { status: 400 }
      )
    }

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse document' },
      { status: 500 }
    )
  }
}

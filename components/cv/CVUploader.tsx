'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redactText } from '@/lib/redaction/redactor'
import { encryptRedactionMap } from '@/lib/redaction/crypto'

interface CVUploaderProps {
  userId: string
}

export default function CVUploader({ userId }: CVUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
      ]

      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, DOCX, DOC, or TXT file')
        setFile(null)
        return
      }

      // Validate file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null)
      setSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setLoading(true)
      setError(null)

      // 1. Upload file to Supabase Storage
      const fileName = `${userId}/${Date.now()}_${file.name}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('cv-documents')
        .upload(fileName, file)

      if (storageError) throw storageError

      // 2. Parse the document (call API)
      const formData = new FormData()
      formData.append('file', file)

      const parseResponse = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      })

      if (!parseResponse.ok) {
        throw new Error('Failed to parse document')
      }

      const { text } = await parseResponse.json()

      // 3. Client-side PII redaction
      const { redactedText, redactionMap } = redactText(text)

      // 4. Encrypt redaction map
      const { encrypted, keyString } = await encryptRedactionMap(redactionMap)

      // 5. Store in database
      const { error: dbError } = await supabase.from('docs').insert({
        user_id: userId,
        type: 'cv',
        storage_path: storageData.path,
        meta_encrypted: JSON.stringify({
          original_name: file.name,
          file_type: file.type,
          file_size: file.size,
          redacted_text: redactedText,
          redaction_map_encrypted: encrypted,
          encryption_key: keyString,
        }),
      })

      if (dbError) throw dbError

      setSuccess(true)
      setFile(null)

      // Refresh the page to show the new CV
      window.location.reload()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload CV')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-sage-gray rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="cv-upload"
          disabled={loading}
        />
        <label
          htmlFor="cv-upload"
          className="cursor-pointer block"
        >
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm text-black font-medium mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-sage-gray">
            PDF, DOCX, DOC, or TXT (max 50MB)
          </p>
        </label>
      </div>

      {file && (
        <div className="bg-mist-teal rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-medium text-black">{file.name}</p>
                <p className="text-xs text-sage-gray">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null)
                setError(null)
              }}
              className="text-sage-gray hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">CV uploaded successfully!</p>
        </div>
      )}

      {file && !loading && !success && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Upload CV
        </button>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clay-rose"></div>
          <p className="text-sm text-sage-gray mt-2">Processing your CV...</p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import CVTailor from './CVTailor'

interface Doc {
  id: string
  user_id: string
  type: string
  storage_path: string
  meta_encrypted: string | null
  created_at: string
}

interface CVVersion {
  id: string
  user_id: string
  base_doc_id: string
  job_meta_json: any
  diff_summary: string | null
  file_paths_json: any
  created_at: string
}

interface CVListProps {
  docs: Doc[]
  versions: CVVersion[]
}

export default function CVList({ docs, versions }: CVListProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [showTailor, setShowTailor] = useState(false)

  const getVersionsForDoc = (docId: string) => {
    return versions.filter((v) => v.base_doc_id === docId)
  }

  const parseDocMeta = (metaString: string | null) => {
    if (!metaString) return null
    try {
      return JSON.parse(metaString)
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-4">
      {docs.map((doc) => {
        const meta = parseDocMeta(doc.meta_encrypted)
        const docVersions = getVersionsForDoc(doc.id)
        const isExpanded = selectedDoc === doc.id

        return (
          <div
            key={doc.id}
            className="bg-white rounded-lg shadow-sm border border-mist-teal overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h3 className="text-base font-medium text-black">
                        {meta?.original_name || 'Untitled CV'}
                      </h3>
                      <p className="text-xs text-sage-gray">
                        Uploaded {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {docVersions.length > 0 && (
                    <p className="text-xs text-sage-gray mt-2">
                      {docVersions.length} tailored{' '}
                      {docVersions.length === 1 ? 'version' : 'versions'}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedDoc(isExpanded ? null : doc.id)
                    setShowTailor(false)
                  }}
                  className="text-sage-gray hover:text-black transition-colors"
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-mist-teal p-4 bg-sand-rose space-y-4">
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTailor(!showTailor)}
                    className="flex-1 bg-clay-rose text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    {showTailor ? 'Hide Tailor' : 'Tailor to Job'}
                  </button>
                  <button
                    className="flex-1 bg-white text-black border border-sage-gray font-medium py-2 px-4 rounded-lg hover:bg-mist-teal transition-colors text-sm"
                    onClick={() => {
                      // TODO: View original CV
                      alert('View original feature coming soon')
                    }}
                  >
                    View Original
                  </button>
                </div>

                {/* Tailor Form */}
                {showTailor && (
                  <CVTailor
                    docId={doc.id}
                    userId={doc.user_id}
                    onComplete={() => {
                      setShowTailor(false)
                      window.location.reload()
                    }}
                  />
                )}

                {/* Versions List */}
                {docVersions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-black mb-2">
                      Tailored Versions
                    </h4>
                    <div className="space-y-2">
                      {docVersions.map((version) => {
                        const jobMeta = version.job_meta_json || {}
                        return (
                          <div
                            key={version.id}
                            className="bg-white rounded-lg p-3 border border-mist-teal"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-black">
                                  {jobMeta.job_title || 'Untitled Position'}
                                </p>
                                {jobMeta.company && (
                                  <p className="text-xs text-sage-gray">
                                    {jobMeta.company}
                                  </p>
                                )}
                                <p className="text-xs text-sage-gray mt-1">
                                  {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  className="text-xs text-clay-rose hover:underline"
                                  onClick={() => {
                                    // TODO: Download
                                    alert('Download feature coming soon')
                                  }}
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

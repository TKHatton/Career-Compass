export interface User {
  id: string
  email: string
}

export interface Profile {
  user_id: string
  long_term_goal?: string
  values?: string[]
  strengths?: string[]
  redaction_map_encrypted?: string
}

export interface CVVersion {
  id: string
  user_id: string
  base_doc_id: string
  job_meta?: {
    job_title?: string
    company?: string
    job_description?: string
    url?: string
  }
  diff_summary?: string
  file_paths?: {
    docx?: string
    pdf?: string
  }
  created_at: string
}

export interface Letter {
  id: string
  user_id: string
  job_meta?: {
    job_title?: string
    company?: string
    tone?: string
  }
  draft_html: string
  draft_txt: string
  created_at: string
}

export interface RedactionMap {
  [key: string]: string // Maps tokens like [PERSON_1] to actual values
}

export interface TailorRequest {
  baseDocId: string
  jobDescription: string
  jobTitle?: string
  company?: string
}

export interface TailorResponse {
  versionId: string
  tailoredText: string
  diffSummary: string
}

export type TonePreset = 'professional' | 'friendly' | 'bold'

-- Career Compass Initial Schema
-- Creates all tables required for the MVP

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile table: stores user preferences, goals, and encrypted redaction map
CREATE TABLE IF NOT EXISTS public.profile (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  long_term_goal TEXT,
  values_json JSONB DEFAULT '[]'::jsonb,
  strengths_json JSONB DEFAULT '[]'::jsonb,
  redaction_map_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Docs table: stores metadata for uploaded documents
CREATE TABLE IF NOT EXISTS public.docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'cv', 'cover_letter', 'proposal', etc.
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  meta_encrypted TEXT, -- Encrypted metadata (filename, original name, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Embeddings table: stores vector embeddings of redacted content
CREATE TABLE IF NOT EXISTS public.embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.docs(id) ON DELETE CASCADE,
  chunk_redacted TEXT NOT NULL, -- Redacted text chunk
  vector vector(1536), -- Embedding vector (OpenAI ada-002 size, adjust for Anthropic if needed)
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table: conversation sessions for chat-based features
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  active_goal TEXT,
  active_values_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table: individual messages in sessions
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content_redacted TEXT NOT NULL, -- Redacted content sent to model
  content_encrypted TEXT, -- Optional encrypted original content
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Letters table: generated cover letters
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_meta_json JSONB DEFAULT '{}'::jsonb, -- Job title, company, URL, etc.
  draft_html TEXT NOT NULL,
  draft_txt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CV Versions table: tracks CV tailoring history
CREATE TABLE IF NOT EXISTS public.cv_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  base_doc_id UUID NOT NULL REFERENCES public.docs(id) ON DELETE CASCADE,
  job_meta_json JSONB DEFAULT '{}'::jsonb, -- Job title, company, description, URL
  diff_summary TEXT, -- Human-readable summary of changes
  file_paths_json JSONB DEFAULT '{}'::jsonb, -- Paths to DOCX, PDF exports
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_docs_user_id ON public.docs(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_type ON public.docs(type);
CREATE INDEX IF NOT EXISTS idx_embeddings_doc_id ON public.embeddings(doc_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON public.letters(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_versions_user_id ON public.cv_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_versions_base_doc_id ON public.cv_versions(base_doc_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profile table
CREATE TRIGGER update_profile_updated_at
  BEFORE UPDATE ON public.profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

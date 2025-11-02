-- Journal Proposals table: stores research proposals and abstracts
CREATE TABLE IF NOT EXISTS public.journal_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  proposal_meta_json JSONB DEFAULT '{}'::jsonb, -- Title, journal, field, etc.
  research_question TEXT NOT NULL,
  research_context TEXT,
  methodology TEXT,
  contribution TEXT,
  references_text TEXT,
  draft_txt TEXT NOT NULL,
  draft_html TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_journal_proposals_user_id ON public.journal_proposals(user_id);

-- Add RLS policies
ALTER TABLE public.journal_proposals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own proposals
CREATE POLICY "Users can view their own journal proposals"
  ON public.journal_proposals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own proposals
CREATE POLICY "Users can insert their own journal proposals"
  ON public.journal_proposals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own proposals
CREATE POLICY "Users can update their own journal proposals"
  ON public.journal_proposals
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own proposals
CREATE POLICY "Users can delete their own journal proposals"
  ON public.journal_proposals
  FOR DELETE
  USING (auth.uid() = user_id);

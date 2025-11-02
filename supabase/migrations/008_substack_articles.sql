-- Substack Articles table: stores brainstorms, outlines, drafts, and polished articles
CREATE TABLE IF NOT EXISTS public.substack_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('brainstorm', 'outline', 'draft', 'polish')),
  article_meta_json JSONB DEFAULT '{}'::jsonb, -- Title, topic, voice, etc.
  input_text TEXT,
  draft_txt TEXT NOT NULL,
  draft_html TEXT,
  draft_markdown TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_substack_articles_user_id ON public.substack_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_substack_articles_mode ON public.substack_articles(mode);

-- Add RLS policies
ALTER TABLE public.substack_articles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own articles
CREATE POLICY "Users can view their own substack articles"
  ON public.substack_articles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own articles
CREATE POLICY "Users can insert their own substack articles"
  ON public.substack_articles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own articles
CREATE POLICY "Users can update their own substack articles"
  ON public.substack_articles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own articles
CREATE POLICY "Users can delete their own substack articles"
  ON public.substack_articles
  FOR DELETE
  USING (auth.uid() = user_id);

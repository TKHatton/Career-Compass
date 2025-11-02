-- Coaching Sessions table: stores writing coach conversations
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Writing Session',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coaching Messages table: individual messages in coaching sessions
CREATE TABLE IF NOT EXISTS public.coaching_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.coaching_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  action_type TEXT, -- 'upgrade_prompt', 'tone_adjust', 'copy_edit', 'general'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON public.coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_messages_session_id ON public.coaching_messages(session_id);

-- Add RLS policies for coaching_sessions
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coaching sessions"
  ON public.coaching_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coaching sessions"
  ON public.coaching_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching sessions"
  ON public.coaching_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching sessions"
  ON public.coaching_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for coaching_messages
ALTER TABLE public.coaching_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their sessions"
  ON public.coaching_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coaching_sessions
      WHERE coaching_sessions.id = coaching_messages.session_id
      AND coaching_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their sessions"
  ON public.coaching_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coaching_sessions
      WHERE coaching_sessions.id = coaching_messages.session_id
      AND coaching_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their sessions"
  ON public.coaching_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.coaching_sessions
      WHERE coaching_sessions.id = coaching_messages.session_id
      AND coaching_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their sessions"
  ON public.coaching_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.coaching_sessions
      WHERE coaching_sessions.id = coaching_messages.session_id
      AND coaching_sessions.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for coaching_sessions
CREATE TRIGGER update_coaching_sessions_updated_at
  BEFORE UPDATE ON public.coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

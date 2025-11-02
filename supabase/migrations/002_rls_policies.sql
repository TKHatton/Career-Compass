-- Career Compass Row Level Security Policies
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;

-- =====================
-- USERS TABLE POLICIES
-- =====================

-- Users can view their own user record
CREATE POLICY "Users can view own user record"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own user record (during signup)
CREATE POLICY "Users can insert own user record"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================
-- PROFILE TABLE POLICIES
-- =====================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profile
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profile
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profile
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.profile
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- DOCS TABLE POLICIES
-- =====================

-- Users can view their own documents
CREATE POLICY "Users can view own docs"
  ON public.docs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own docs"
  ON public.docs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own docs"
  ON public.docs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own docs"
  ON public.docs
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- EMBEDDINGS TABLE POLICIES
-- =====================

-- Users can view embeddings for their own documents
CREATE POLICY "Users can view own embeddings"
  ON public.embeddings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.docs
      WHERE docs.id = embeddings.doc_id
      AND docs.user_id = auth.uid()
    )
  );

-- Users can insert embeddings for their own documents
CREATE POLICY "Users can insert own embeddings"
  ON public.embeddings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.docs
      WHERE docs.id = embeddings.doc_id
      AND docs.user_id = auth.uid()
    )
  );

-- Users can delete embeddings for their own documents
CREATE POLICY "Users can delete own embeddings"
  ON public.embeddings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.docs
      WHERE docs.id = embeddings.doc_id
      AND docs.user_id = auth.uid()
    )
  );

-- =====================
-- SESSIONS TABLE POLICIES
-- =====================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON public.sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON public.sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON public.sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- MESSAGES TABLE POLICIES
-- =====================

-- Users can view messages in their own sessions
CREATE POLICY "Users can view own messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = messages.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Users can insert messages in their own sessions
CREATE POLICY "Users can insert own messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = messages.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Users can delete messages in their own sessions
CREATE POLICY "Users can delete own messages"
  ON public.messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = messages.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- =====================
-- LETTERS TABLE POLICIES
-- =====================

-- Users can view their own letters
CREATE POLICY "Users can view own letters"
  ON public.letters
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own letters
CREATE POLICY "Users can insert own letters"
  ON public.letters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own letters
CREATE POLICY "Users can update own letters"
  ON public.letters
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own letters
CREATE POLICY "Users can delete own letters"
  ON public.letters
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- CV_VERSIONS TABLE POLICIES
-- =====================

-- Users can view their own CV versions
CREATE POLICY "Users can view own cv_versions"
  ON public.cv_versions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own CV versions
CREATE POLICY "Users can insert own cv_versions"
  ON public.cv_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own CV versions
CREATE POLICY "Users can update own cv_versions"
  ON public.cv_versions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own CV versions
CREATE POLICY "Users can delete own cv_versions"
  ON public.cv_versions
  FOR DELETE
  USING (auth.uid() = user_id);

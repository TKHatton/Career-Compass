-- Course Evaluations table for Path Finder
CREATE TABLE IF NOT EXISTS public.course_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('course', 'degree')),
  title TEXT NOT NULL,
  provider TEXT,
  cost DECIMAL,
  duration_weeks INTEGER,
  input_data JSONB DEFAULT '{}'::jsonb,
  analysis_result JSONB DEFAULT '{}'::jsonb,
  score DECIMAL,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_course_evaluations_user_id ON public.course_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_course_evaluations_type ON public.course_evaluations(type);
CREATE INDEX IF NOT EXISTS idx_course_evaluations_created_at ON public.course_evaluations(created_at DESC);

-- Add comments
COMMENT ON TABLE public.course_evaluations IS 'Stores course and degree evaluations from Path Finder';
COMMENT ON COLUMN public.course_evaluations.type IS 'Type of evaluation: course or degree';
COMMENT ON COLUMN public.course_evaluations.input_data IS 'User input data for the evaluation';
COMMENT ON COLUMN public.course_evaluations.analysis_result IS 'AI-generated analysis result';
COMMENT ON COLUMN public.course_evaluations.score IS 'Overall score (0-100)';

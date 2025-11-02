-- Add onboarding completion tracking to profile table
ALTER TABLE public.profile
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comment to document the field
COMMENT ON COLUMN public.profile.onboarding_completed_at IS 'Timestamp when user completed the onboarding flow';

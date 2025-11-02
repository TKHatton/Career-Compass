-- Add privacy settings to profile table
ALTER TABLE public.profile
ADD COLUMN IF NOT EXISTS auto_delete_sessions_after_days INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT NULL;

-- Add comments to document the fields
COMMENT ON COLUMN public.profile.auto_delete_sessions_after_days IS 'Auto-delete chat sessions older than X days (null = never delete)';
COMMENT ON COLUMN public.profile.data_retention_days IS 'General data retention policy in days (null = keep forever)';

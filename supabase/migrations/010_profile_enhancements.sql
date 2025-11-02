-- Add profile enhancements: image, name, bio, etc.
ALTER TABLE public.profile
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add comment to document the new fields
COMMENT ON COLUMN public.profile.full_name IS 'User full name for display';
COMMENT ON COLUMN public.profile.bio IS 'Short bio or tagline';
COMMENT ON COLUMN public.profile.profile_image_url IS 'URL to profile image in storage';
COMMENT ON COLUMN public.profile.location IS 'User location (city, country)';
COMMENT ON COLUMN public.profile.website IS 'Personal website URL';
COMMENT ON COLUMN public.profile.linkedin_url IS 'LinkedIn profile URL';

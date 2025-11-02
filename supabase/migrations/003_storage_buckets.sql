-- Career Compass Storage Buckets and Policies
-- Creates private storage buckets for documents and exports

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'cv-documents',
    'cv-documents',
    false,
    52428800, -- 50MB
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
  ),
  (
    'cover-letters',
    'cover-letters',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/html', 'text/plain']
  ),
  (
    'exports',
    'exports',
    false,
    52428800, -- 50MB
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip']
  )
ON CONFLICT (id) DO NOTHING;

-- =====================
-- CV-DOCUMENTS BUCKET POLICIES
-- =====================

-- Allow authenticated users to upload their own CV documents
CREATE POLICY "Users can upload own CV documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'cv-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own CV documents
CREATE POLICY "Users can view own CV documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'cv-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own CV documents
CREATE POLICY "Users can update own CV documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'cv-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'cv-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own CV documents
CREATE POLICY "Users can delete own CV documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'cv-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================
-- COVER-LETTERS BUCKET POLICIES
-- =====================

-- Allow authenticated users to upload their own cover letters
CREATE POLICY "Users can upload own cover letters"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'cover-letters'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own cover letters
CREATE POLICY "Users can view own cover letters"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'cover-letters'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own cover letters
CREATE POLICY "Users can update own cover letters"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'cover-letters'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'cover-letters'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own cover letters
CREATE POLICY "Users can delete own cover letters"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'cover-letters'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================
-- EXPORTS BUCKET POLICIES
-- =====================

-- Allow authenticated users to upload their own exports
CREATE POLICY "Users can upload own exports"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'exports'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own exports
CREATE POLICY "Users can view own exports"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'exports'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own exports
CREATE POLICY "Users can delete own exports"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'exports'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

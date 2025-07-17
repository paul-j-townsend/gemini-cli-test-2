-- Clean up storage structure and create organized folders

-- First, ensure the audio bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Delete old unorganized files (clean slate)
-- Note: This will remove existing files - only run if you want a fresh start
DELETE FROM storage.objects WHERE bucket_id = 'audio';

-- Drop all existing audio storage policies
DROP POLICY IF EXISTS "Allow public audio uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio deletes" ON storage.objects;

-- Create clean, organized storage policies
-- Policy to allow uploads to specific podcast folders
CREATE POLICY "Allow uploads to podcast folders" ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'audio' AND 
    (name LIKE 'podcasts/episodes/%' OR name LIKE 'podcasts/previews/%')
);

-- Policy to allow public downloads
CREATE POLICY "Allow public audio downloads" ON storage.objects
FOR SELECT 
USING (bucket_id = 'audio');

-- Policy to allow updates to podcast files
CREATE POLICY "Allow updates to podcast files" ON storage.objects
FOR UPDATE
USING (bucket_id = 'audio' AND (name LIKE 'podcasts/%'))
WITH CHECK (bucket_id = 'audio' AND (name LIKE 'podcasts/%'));

-- Policy to allow deletes of podcast files  
CREATE POLICY "Allow deletes of podcast files" ON storage.objects
FOR DELETE
USING (bucket_id = 'audio' AND (name LIKE 'podcasts/%'));

-- Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'audio';
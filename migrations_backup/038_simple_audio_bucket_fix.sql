-- Simple fix to ensure audio bucket works properly

-- Ensure the audio bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Drop all existing audio storage policies to start fresh
DROP POLICY IF EXISTS "Allow public audio uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to podcast folders" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to podcast files" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes of podcast files" ON storage.objects;

-- Create simple, permissive policies for the audio bucket
CREATE POLICY "Allow all operations on audio bucket" ON storage.objects
FOR ALL
USING (bucket_id = 'audio')
WITH CHECK (bucket_id = 'audio');

-- Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'audio';
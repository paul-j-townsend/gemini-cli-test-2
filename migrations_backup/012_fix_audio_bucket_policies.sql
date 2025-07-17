-- Fix audio bucket policies for admin uploads

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on audio bucket" ON storage.objects;

-- Create specific policies for different operations
CREATE POLICY "Allow INSERT on audio bucket" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Allow SELECT on audio bucket" ON storage.objects
FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Allow UPDATE on audio bucket" ON storage.objects
FOR UPDATE
USING (bucket_id = 'audio')
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Allow DELETE on audio bucket" ON storage.objects
FOR DELETE
USING (bucket_id = 'audio');

-- Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'audio';
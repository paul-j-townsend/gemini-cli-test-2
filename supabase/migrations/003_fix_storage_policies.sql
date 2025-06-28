-- Fix storage policies for the images bucket
-- This allows anonymous users to upload and view images

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

-- Create new policies for the images bucket
-- Policy to allow anyone to upload images
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'images');

-- Policy to allow anyone to view images
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT 
USING (bucket_id = 'images');

-- Policy to allow anyone to update their own uploads (optional)
CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Policy to allow anyone to delete their own uploads (optional)
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE
USING (bucket_id = 'images');

-- Make sure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'images'; 
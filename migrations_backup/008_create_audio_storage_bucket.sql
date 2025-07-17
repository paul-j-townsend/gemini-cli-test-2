-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing audio policies if they exist
DROP POLICY IF EXISTS "Allow public audio uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public audio deletes" ON storage.objects;

-- Create policies for the audio bucket
-- Policy to allow anyone to upload audio files
CREATE POLICY "Allow public audio uploads" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'audio');

-- Policy to allow anyone to view/download audio files
CREATE POLICY "Allow public audio downloads" ON storage.objects
FOR SELECT 
USING (bucket_id = 'audio');

-- Policy to allow anyone to update audio files (optional)
CREATE POLICY "Allow public audio updates" ON storage.objects
FOR UPDATE
USING (bucket_id = 'audio')
WITH CHECK (bucket_id = 'audio');

-- Policy to allow anyone to delete audio files (optional)
CREATE POLICY "Allow public audio deletes" ON storage.objects
FOR DELETE
USING (bucket_id = 'audio');

-- Make sure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'audio';
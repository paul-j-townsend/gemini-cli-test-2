-- Add thumbnail_path column to vsk_podcast_episodes table
-- This will store the file path in the podcast-thumbnails bucket instead of using image_url
ALTER TABLE vsk_podcast_episodes 
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- Create index for thumbnail_path for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_thumbnail_path 
ON vsk_podcast_episodes(thumbnail_path);

-- Add comment to explain the new field
COMMENT ON COLUMN vsk_podcast_episodes.thumbnail_path IS 'File path in the podcast-thumbnails storage bucket';
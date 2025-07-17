-- Remove the image_url column from vsk_podcast_episodes table
-- This completes the migration to using only thumbnail_path for bucket storage

-- Drop the image_url column
ALTER TABLE vsk_podcast_episodes 
DROP COLUMN IF EXISTS image_url;

-- Make thumbnail_path NOT NULL since it's now the only way to store thumbnails
-- Note: This will require existing episodes to have thumbnails added
ALTER TABLE vsk_podcast_episodes 
ALTER COLUMN thumbnail_path SET NOT NULL;

-- Add comment explaining the change
COMMENT ON TABLE vsk_podcast_episodes IS 'Podcast episodes table using thumbnail_path for bucket storage only';
COMMENT ON COLUMN vsk_podcast_episodes.thumbnail_path IS 'Required file path in the podcast-thumbnails storage bucket';
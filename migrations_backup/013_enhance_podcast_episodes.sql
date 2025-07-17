-- Enhance podcast episodes table with essential fields for better content management
-- Migration 013: Add episode organization, publishing workflow, and SEO fields

-- Add episode organization fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS episode_number INTEGER;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS season INTEGER DEFAULT 1;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS duration INTEGER; -- in seconds

-- Add publishing workflow fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add content organization fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add rich content fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS show_notes TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS full_audio_url TEXT;

-- Add SEO fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Create unique constraint on slug
ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT unique_podcast_slug UNIQUE (slug);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_slug ON vsk_podcast_episodes(slug);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published ON vsk_podcast_episodes(published);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_featured ON vsk_podcast_episodes(featured);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_category ON vsk_podcast_episodes(category);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_episode_number ON vsk_podcast_episodes(episode_number);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_season ON vsk_podcast_episodes(season);

-- Create composite index for episode ordering
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_season_episode ON vsk_podcast_episodes(season, episode_number);

-- Add check constraints for data integrity
ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT check_episode_number_positive 
    CHECK (episode_number IS NULL OR episode_number > 0);

ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT check_season_positive 
    CHECK (season IS NULL OR season > 0);

ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT check_duration_positive 
    CHECK (duration IS NULL OR duration > 0);

ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT check_file_size_positive 
    CHECK (file_size IS NULL OR file_size > 0);

-- Update existing episodes to have default values
UPDATE vsk_podcast_episodes 
SET 
    published = (published_at IS NOT NULL),
    season = 1
WHERE published IS NULL OR season IS NULL;

-- Add comment for documentation
COMMENT ON TABLE vsk_podcast_episodes IS 'Enhanced podcast episodes table with episode organization, publishing workflow, and SEO fields';
COMMENT ON COLUMN vsk_podcast_episodes.episode_number IS 'Episode number within the season';
COMMENT ON COLUMN vsk_podcast_episodes.season IS 'Season number (default: 1)';
COMMENT ON COLUMN vsk_podcast_episodes.duration IS 'Episode duration in seconds';
COMMENT ON COLUMN vsk_podcast_episodes.slug IS 'SEO-friendly URL slug';
COMMENT ON COLUMN vsk_podcast_episodes.published IS 'Whether episode is published (visible to public)';
COMMENT ON COLUMN vsk_podcast_episodes.featured IS 'Whether episode is featured (promoted)';
COMMENT ON COLUMN vsk_podcast_episodes.show_notes IS 'Detailed episode content/notes';
COMMENT ON COLUMN vsk_podcast_episodes.transcript IS 'Episode transcript for accessibility';
COMMENT ON COLUMN vsk_podcast_episodes.file_size IS 'Audio file size in bytes';
-- Check existing columns and add missing ones to vsk_articles table
-- First, let's see what columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vsk_articles'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS tags TEXT[];

ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS original_url TEXT;

ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

ALTER TABLE vsk_articles 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Make slug unique if it exists
ALTER TABLE vsk_articles 
ADD CONSTRAINT unique_slug UNIQUE (slug);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_articles_slug ON vsk_articles(slug);
CREATE INDEX IF NOT EXISTS idx_vsk_articles_published ON vsk_articles(published);
CREATE INDEX IF NOT EXISTS idx_vsk_articles_category ON vsk_articles(category);
CREATE INDEX IF NOT EXISTS idx_vsk_articles_featured ON vsk_articles(featured);

-- Enable Row Level Security
ALTER TABLE vsk_articles ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
DROP POLICY IF EXISTS "Allow all operations" ON vsk_articles;
CREATE POLICY "Allow all operations" ON vsk_articles FOR ALL USING (true);
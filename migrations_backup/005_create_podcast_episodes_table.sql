-- Create podcast_episodes table for managing podcast episodes
CREATE TABLE IF NOT EXISTS podcast_episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_podcast_episodes_updated_at
    BEFORE UPDATE ON podcast_episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published_at 
ON podcast_episodes(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_podcast_episodes_created_at 
ON podcast_episodes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- For now, allow public access for development/testing
-- In production, you should restrict these to authenticated users only
CREATE POLICY "Allow public read access to episodes" 
ON podcast_episodes 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to episodes" 
ON podcast_episodes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to episodes" 
ON podcast_episodes 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to episodes" 
ON podcast_episodes 
FOR DELETE 
USING (true);

-- Grant necessary permissions
GRANT ALL ON podcast_episodes TO authenticated;
GRANT ALL ON podcast_episodes TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
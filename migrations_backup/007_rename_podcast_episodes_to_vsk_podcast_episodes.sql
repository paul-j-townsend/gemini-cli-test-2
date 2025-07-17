-- Rename podcast_episodes table to vsk_podcast_episodes
-- Check if the old table exists and new table doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'podcast_episodes') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vsk_podcast_episodes') THEN
        ALTER TABLE podcast_episodes RENAME TO vsk_podcast_episodes;
    END IF;
END
$$;

-- Update trigger name to match new table name
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vsk_podcast_episodes') THEN
        DROP TRIGGER IF EXISTS update_podcast_episodes_updated_at ON vsk_podcast_episodes;
        DROP TRIGGER IF EXISTS update_vsk_podcast_episodes_updated_at ON vsk_podcast_episodes;
        CREATE TRIGGER update_vsk_podcast_episodes_updated_at
            BEFORE UPDATE ON vsk_podcast_episodes
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Rename indexes to match new table name
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vsk_podcast_episodes') THEN
        DROP INDEX IF EXISTS idx_podcast_episodes_published_at;
        DROP INDEX IF EXISTS idx_podcast_episodes_created_at;
        
        CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_published_at 
        ON vsk_podcast_episodes(published_at DESC);
        
        CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_created_at 
        ON vsk_podcast_episodes(created_at DESC);
    END IF;
END
$$;

-- Drop old policies and create new ones with updated table name
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vsk_podcast_episodes') THEN
        DROP POLICY IF EXISTS "Allow public read access to episodes" ON vsk_podcast_episodes;
        DROP POLICY IF EXISTS "Allow public insert access to episodes" ON vsk_podcast_episodes;
        DROP POLICY IF EXISTS "Allow public update access to episodes" ON vsk_podcast_episodes;
        DROP POLICY IF EXISTS "Allow public delete access to episodes" ON vsk_podcast_episodes;
        DROP POLICY IF EXISTS "Allow public read access to vsk episodes" ON vsk_podcast_episodes;
        DROP POLICY IF EXISTS "Allow public insert access to vsk episodes" ON vsk_podcast_episodes;
        DROP POLICY IF EXISTS "Allow public update access to vsk episodes" ON vsk_podcast_episodes;
        DROP POLICY IF EXISTS "Allow public delete access to vsk episodes" ON vsk_podcast_episodes;

        CREATE POLICY "Allow public read access to vsk episodes" 
        ON vsk_podcast_episodes 
        FOR SELECT 
        USING (true);

        CREATE POLICY "Allow public insert access to vsk episodes" 
        ON vsk_podcast_episodes 
        FOR INSERT 
        WITH CHECK (true);

        CREATE POLICY "Allow public update access to vsk episodes" 
        ON vsk_podcast_episodes 
        FOR UPDATE 
        USING (true);

        CREATE POLICY "Allow public delete access to vsk episodes" 
        ON vsk_podcast_episodes 
        FOR DELETE 
        USING (true);

        -- Grant necessary permissions
        GRANT ALL ON vsk_podcast_episodes TO authenticated;
        GRANT ALL ON vsk_podcast_episodes TO anon;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
    END IF;
END
$$;
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Allow authenticated users to insert episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Allow authenticated users to update episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Allow authenticated users to delete episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Allow public read access to episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Allow public insert access to episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Allow public update access to episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Allow public delete access to episodes" ON podcast_episodes;

-- Create new public policies for development/testing
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

-- Grant necessary permissions to anon role
GRANT ALL ON podcast_episodes TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
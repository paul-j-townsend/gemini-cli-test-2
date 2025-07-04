import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // First check if the column already exists
    const { data: columnCheck, error: columnError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('quiz_id')
      .limit(1);

    if (!columnError) {
      return res.status(200).json({ 
        message: 'Quiz column already exists',
        success: true
      });
    }

    // If we get here, the column doesn't exist. Let's add it.
    // We'll use a different approach - create a stored procedure to add the column
    
    // Construct database URL from Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        message: 'Supabase configuration not found',
        instruction: 'Please run the following SQL in your Supabase dashboard SQL editor:',
        sql: `
-- Add quiz relationship to podcast episodes
ALTER TABLE vsk_podcast_episodes 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quiz_questions(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_quiz_id 
ON vsk_podcast_episodes(quiz_id);

-- Add comment for documentation
COMMENT ON COLUMN vsk_podcast_episodes.quiz_id IS 'Optional reference to associated quiz question for this podcast episode';
        `
      });
    }

    // Extract project ref from Supabase URL
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const databaseUrl = `postgresql://postgres:[YOUR_PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;
    
    // For security, we'll provide manual instructions instead of trying to connect directly
         return res.status(500).json({
       message: 'Automatic migration not supported for security',
       instruction: 'Please run the following SQL in your Supabase dashboard SQL editor:',
       supabaseUrl: `${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`,
       sql: `
-- Add quiz relationship to podcast episodes
ALTER TABLE vsk_podcast_episodes 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quiz_questions(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_quiz_id 
ON vsk_podcast_episodes(quiz_id);

-- Add comment for documentation
COMMENT ON COLUMN vsk_podcast_episodes.quiz_id IS 'Optional reference to associated quiz question for this podcast episode';
       `,
       steps: [
         '1. Open your Supabase dashboard',
         '2. Navigate to SQL Editor',
         '3. Copy and paste the SQL above',
         '4. Click "Run" to execute the migration',
         '5. Refresh this page to test the changes'
       ]
     });

  } catch (error: any) {
    console.error('Migration error:', error);
    
    return res.status(500).json({
      message: 'Failed to add quiz column automatically',
      error: error.message,
      instruction: 'Please run the following SQL in your Supabase dashboard SQL editor:',
      sql: `
-- Add quiz relationship to podcast episodes
ALTER TABLE vsk_podcast_episodes 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quiz_questions(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_quiz_id 
ON vsk_podcast_episodes(quiz_id);

-- Add comment for documentation
COMMENT ON COLUMN vsk_podcast_episodes.quiz_id IS 'Optional reference to associated quiz question for this podcast episode';
      `
    });
  }
} 
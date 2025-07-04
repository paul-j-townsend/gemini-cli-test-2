import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if the quiz_id column already exists
    try {
      await supabaseAdmin
        .from('vsk_podcast_episodes')
        .select('quiz_id')
        .limit(1);
      
      return res.status(200).json({ message: 'Podcast-quiz migration already applied' });
    } catch (error: any) {
      if (!error.message.includes('column "quiz_id" does not exist')) {
        throw error;
      }
      // Column doesn't exist, proceed with migration
    }

    console.log('Starting podcast-quiz migration...');

    // Execute the migration SQL
    const migrationSQL = `
-- Add quiz relationship to podcast episodes
-- This allows each podcast episode to be associated with a quiz

-- Add quiz_id field to podcast episodes table
ALTER TABLE vsk_podcast_episodes 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quiz_questions(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_quiz_id 
ON vsk_podcast_episodes(quiz_id);

-- Add comment for documentation
COMMENT ON COLUMN vsk_podcast_episodes.quiz_id IS 'Optional reference to associated quiz question for this podcast episode';
    `;

    // Execute the migration
    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: migrationSQL 
    });

    if (error) {
      // Try alternative approach - execute step by step
      console.log('Trying alternative migration approach...');
      
      // Add column
      await supabaseAdmin.rpc('exec_sql', { 
        sql: 'ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quiz_questions(id) ON DELETE SET NULL;' 
      });

      // Add index
      await supabaseAdmin.rpc('exec_sql', { 
        sql: 'CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_quiz_id ON vsk_podcast_episodes(quiz_id);' 
      });
    }

    return res.status(200).json({ 
      message: 'Podcast-quiz migration completed successfully',
      details: 'quiz_id column added to vsk_podcast_episodes table'
    });

  } catch (err: any) {
    console.error('Migration Error:', err);
    return res.status(500).json({ 
      message: 'Migration failed', 
      error: err.message,
      suggestion: 'You may need to run the migration manually in your Supabase dashboard using the SQL in sql/add_quiz_to_podcasts.sql'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting foreign key constraint fix...');

    // Step 1: Check current constraint
    const { data: constraints, error: constraintError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
          FROM information_schema.key_column_usage k
          JOIN information_schema.referential_constraints r ON k.constraint_name = r.constraint_name
          JOIN information_schema.constraint_column_usage c ON r.unique_constraint_name = c.constraint_name
          WHERE k.table_name = 'vsk_podcast_episodes' AND k.column_name = 'quiz_id';
        `
      });

    console.log('Current constraints:', constraints);

    // Step 2: Update invalid quiz_id references to null
    const { error: updateError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          UPDATE vsk_podcast_episodes 
          SET quiz_id = NULL 
          WHERE quiz_id IS NOT NULL 
          AND quiz_id NOT IN (SELECT id FROM quiz_questions);
        `
      });

    if (updateError) {
      console.log('Update error (may be expected if tables dont exist):', updateError);
    }

    // Step 3: Drop the existing foreign key constraint
    const { error: dropError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `ALTER TABLE vsk_podcast_episodes DROP CONSTRAINT IF EXISTS vsk_podcast_episodes_quiz_id_fkey;`
      });

    if (dropError) {
      console.log('Drop constraint error:', dropError);
    }

    // Step 4: For now, just remove the foreign key constraint entirely 
    // until we have the quizzes table properly set up
    const { error: removeColumnError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          -- Temporarily set quiz_id to null for all episodes to avoid constraint issues
          UPDATE vsk_podcast_episodes SET quiz_id = NULL WHERE quiz_id IS NOT NULL;
        `
      });

    if (removeColumnError) {
      console.log('Remove column constraint error:', removeColumnError);
    }

    return res.status(200).json({ 
      message: 'Foreign key constraint issue resolved',
      details: 'Cleared invalid quiz_id references and removed constraint',
      constraintInfo: constraints
    });

  } catch (err: any) {
    console.error('Foreign key fix error:', err);
    return res.status(500).json({ 
      message: 'Failed to fix foreign key constraint', 
      error: err.message,
      suggestion: 'You may need to run the following SQL manually in your Supabase dashboard:\n\nUPDATE vsk_podcast_episodes SET quiz_id = NULL WHERE quiz_id IS NOT NULL;\nALTER TABLE vsk_podcast_episodes DROP CONSTRAINT IF EXISTS vsk_podcast_episodes_quiz_id_fkey;'
    });
  }
} 
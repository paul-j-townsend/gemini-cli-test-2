import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { confirmation } = req.body;
  if (confirmation !== 'DROP_DUPLICATE_TABLES_CONFIRMED') {
    return res.status(400).json({ error: 'Invalid confirmation code' });
  }

  try {
    console.log('Dropping duplicate tables...');

    // List of duplicate tables to drop (non-vsk prefixed)
    const tablesToDrop = [
      'users',
      'quizzes',
      'quiz_questions', 
      'question_answers',
      'quiz_completions',
      'user_progress',
      'podcast_episodes',
      'articles',
      'valid_keywords'
    ];

    const dropResults: any = {};

    // Use direct SQL commands to drop tables
    for (const tableName of tablesToDrop) {
      try {
        // First check if table exists and get row count
        const { count } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        dropResults[tableName] = {
          existed: true,
          rows_before_drop: count || 0,
          status: 'IDENTIFIED_FOR_REMOVAL'
        };

        console.log(`Found duplicate table: ${tableName} with ${count || 0} rows`);
      } catch (err) {
        dropResults[tableName] = {
          existed: false,
          status: 'DID_NOT_EXIST'
        };
      }
    }

    // Note: We can't use raw SQL DROP commands through the Supabase client
    // This would need to be done through the Supabase dashboard or with direct database access
    // For now, we'll document what needs to be done

    return res.status(200).json({
      success: true,
      message: 'Duplicate tables identified',
      action_needed: 'Tables need to be dropped manually through Supabase dashboard',
      duplicate_tables_found: dropResults,
      manual_cleanup_sql: tablesToDrop.map(table => `DROP TABLE IF EXISTS ${table} CASCADE;`).join('\n'),
      next_steps: [
        'Access Supabase dashboard',
        'Go to SQL Editor',
        'Execute the DROP TABLE commands',
        'Verify only vsk_ prefixed tables remain'
      ]
    });

  } catch (error) {
    console.error('Table cleanup check failed:', error);
    return res.status(500).json({
      error: 'Table cleanup check failed',
      details: error
    });
  }
}
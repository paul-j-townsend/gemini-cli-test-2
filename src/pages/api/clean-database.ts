import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { confirm } = req.body;

  if (confirm !== 'YES_DELETE_ALL_DATA') {
    return res.status(400).json({ 
      error: 'Must confirm deletion by sending {"confirm": "YES_DELETE_ALL_DATA"}' 
    });
  }

  try {
    console.log('Starting database cleanup...');
    
    // Delete all data in dependency order
    const deletions = [
      'vsk_quiz_completions',
      'vsk_user_progress', 
      'vsk_podcast_episodes',
      'vsk_question_answers',
      'vsk_quiz_questions',
      'vsk_quizzes',
      'vsk_articles',
      'vsk_valid_keywords'
    ];

    const results = [];

    for (const table of deletions) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          results.push({ table, success: false, error: error.message });
        } else {
          console.log(`Successfully deleted all records from ${table}`);
          results.push({ table, success: true });
        }
      } catch (err) {
        console.error(`Exception deleting from ${table}:`, err);
        results.push({ table, success: false, error: err });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Database cleanup completed',
      results
    });

  } catch (error) {
    console.error('Error during database cleanup:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
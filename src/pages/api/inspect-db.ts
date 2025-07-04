import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const results: any = {};

    // Check what quiz-related tables exist
    const tables = ['quiz_questions', 'quizzes', 'questions', 'mcq_answers', 'quiz_attempts'];
    
    for (const table of tables) {
      try {
        // Try to get table info by selecting with limit 0
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(0);
        
        if (!error) {
          results[table] = { exists: true };
          
          // Try to get a sample row to understand structure
          const { data: sample, error: sampleError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (!sampleError && sample && sample.length > 0) {
            results[table].sample = sample[0];
            results[table].columns = Object.keys(sample[0]);
          } else {
            results[table].empty = true;
          }
          
          // Get count
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!countError) {
            results[table].count = count;
          }
        }
      } catch (tableError) {
        results[table] = { exists: false, error: tableError };
      }
    }

    return res.status(200).json({
      message: 'Database inspection complete',
      results
    });

  } catch (error) {
    console.error('Database inspection error:', error);
    return res.status(500).json({ 
      message: 'Failed to inspect database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
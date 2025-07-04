import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const results: any = {};

    // Try to get one row from each table to see column structure
    const tables = ['quizzes', 'questions', 'mcq_answers', 'quiz_questions'];
    
    for (const table of tables) {
      try {
        // Try a simple select to see what columns we can access
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results[table] = { error: error.message };
        } else {
          results[table] = { 
            exists: true, 
            hasData: data && data.length > 0,
            sampleData: data?.[0] || null
          };
        }
      } catch (err) {
        results[table] = { error: `Table error: ${err}` };
      }
    }

    // Try the relationship query that QuizManagement is attempting
    try {
      const { data: relationshipTest, error: relationshipError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          questions (
            id,
            question_text
          )
        `)
        .limit(1);

      results.relationshipTest = {
        success: !relationshipError,
        error: relationshipError?.message,
        data: relationshipTest
      };
    } catch (err) {
      results.relationshipTest = { error: `Relationship test failed: ${err}` };
    }

    return res.status(200).json({
      message: 'Table structure check complete',
      results
    });

  } catch (error) {
    console.error('Table structure check error:', error);
    return res.status(500).json({ 
      message: 'Failed to check table structure',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
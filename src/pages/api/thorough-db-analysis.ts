import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const analysis: any = {
      timestamp: new Date().toISOString(),
      tables: {},
      relationships: {},
      errors: []
    };

    // List of tables to analyze
    const tablesToCheck = [
      'quizzes', 
      'quiz_questions', 
      'questions', 
      'mcq_answers', 
      'quiz_attempts',
      'question_attempts',
      'vsk_podcast_episodes'
    ];

    // Check each table
    for (const tableName of tablesToCheck) {
      try {
        // Try to select with limit 0 to check if table exists
        const { data, error, count } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(0);

        if (error) {
          analysis.tables[tableName] = {
            exists: false,
            error: error.message
          };
        } else {
          // Table exists, get more info
          analysis.tables[tableName] = {
            exists: true,
            recordCount: count || 0
          };

          // Try to get one actual record to see structure
          const { data: sampleData, error: sampleError } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .limit(1);

          if (!sampleError && sampleData && sampleData.length > 0) {
            analysis.tables[tableName].sampleRecord = sampleData[0];
            analysis.tables[tableName].columns = Object.keys(sampleData[0]);
          } else {
            // Table is empty, try to understand structure by attempting insert
            analysis.tables[tableName].isEmpty = true;
          }
        }
      } catch (err) {
        analysis.tables[tableName] = {
          exists: false,
          error: `Exception: ${err}`
        };
      }
    }

    // Test potential relationships
    const relationshipTests = [
      {
        name: 'quizzes->quiz_questions',
        from: 'quizzes',
        select: 'id, title, quiz_questions(*)'
      },
      {
        name: 'quizzes->questions', 
        from: 'quizzes',
        select: 'id, title, questions(*)'
      },
      {
        name: 'questions->mcq_answers',
        from: 'questions', 
        select: 'id, mcq_answers(*)'
      }
    ];

    for (const test of relationshipTests) {
      try {
        const { data, error } = await supabaseAdmin
          .from(test.from)
          .select(test.select)
          .limit(1);

        analysis.relationships[test.name] = {
          works: !error,
          error: error?.message,
          data: data
        };
      } catch (err) {
        analysis.relationships[test.name] = {
          works: false,
          error: `Exception: ${err}`
        };
      }
    }

    // Check RLS policies
    for (const tableName of tablesToCheck) {
      if (analysis.tables[tableName]?.exists) {
        try {
          // Try a simple insert to test RLS
          const testInsert = await supabaseAdmin
            .from(tableName)
            .insert([{ test: 'test' }]);
          
          analysis.tables[tableName].rlsAllowsInsert = !testInsert.error;
          analysis.tables[tableName].rlsError = testInsert.error?.message;
        } catch (err) {
          analysis.tables[tableName].rlsError = `RLS test exception: ${err}`;
        }
      }
    }

    return res.status(200).json({
      message: 'Thorough database analysis complete',
      analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      message: 'Analysis failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Checking database tables...');

    // List of tables we expect to exist with VSK prefix
    const expectedVskTables = [
      'vsk_users',
      'vsk_quizzes', 
      'vsk_quiz_questions',
      'vsk_question_answers',
      'vsk_quiz_completions',
      'vsk_user_progress',
      'vsk_podcast_episodes',
      'vsk_articles',
      'vsk_valid_keywords'
    ];

    // List of potential duplicate tables (without vsk prefix)
    const potentialDuplicateTables = [
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

    const tableStatus: any = {};
    const rowCounts: any = {};

    // Check VSK tables
    for (const tableName of expectedVskTables) {
      try {
        const { count, error } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          tableStatus[tableName] = 'DOES_NOT_EXIST';
          rowCounts[tableName] = 'N/A';
        } else {
          tableStatus[tableName] = 'EXISTS';
          rowCounts[tableName] = count || 0;
        }
      } catch (err) {
        tableStatus[tableName] = 'ERROR';
        rowCounts[tableName] = 'ERROR';
      }
    }

    // Check for duplicate tables
    const duplicatesFound: any = {};
    for (const tableName of potentialDuplicateTables) {
      try {
        const { count, error } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          duplicatesFound[tableName] = count || 0;
        }
      } catch (err) {
        // Table doesn't exist, which is good
      }
    }

    const duplicateCount = Object.keys(duplicatesFound).length;

    return res.status(200).json({
      success: true,
      summary: {
        vsk_tables_found: Object.values(tableStatus).filter(status => status === 'EXISTS').length,
        duplicate_tables_found: duplicateCount,
        tables_missing: Object.values(tableStatus).filter(status => status === 'DOES_NOT_EXIST').length
      },
      vsk_tables: {
        status: tableStatus,
        row_counts: rowCounts
      },
      duplicate_tables: duplicatesFound,
      recommendations: duplicateCount > 0 ? 
        `Found ${duplicateCount} duplicate tables. These should be dropped to avoid confusion.` :
        'No duplicate tables found. Database schema is clean.'
    });

  } catch (error) {
    console.error('Database table check failed:', error);
    return res.status(500).json({
      error: 'Database table check failed',
      details: error
    });
  }
}
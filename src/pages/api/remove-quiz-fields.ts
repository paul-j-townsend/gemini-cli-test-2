import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting removal of pass_percentage and total_questions columns from vsk_quizzes...');

    // Remove pass_percentage column
    const { error: passPercentageError } = await supabaseAdmin
      .rpc('execute_sql', {
        sql: 'ALTER TABLE vsk_quizzes DROP COLUMN IF EXISTS pass_percentage;'
      });

    if (passPercentageError) {
      console.error('Error removing pass_percentage column:', passPercentageError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to remove pass_percentage column',
        error: passPercentageError.message
      });
    }

    console.log('✅ Successfully removed pass_percentage column');

    // Remove total_questions column
    const { error: totalQuestionsError } = await supabaseAdmin
      .rpc('execute_sql', {
        sql: 'ALTER TABLE vsk_quizzes DROP COLUMN IF EXISTS total_questions;'
      });

    if (totalQuestionsError) {
      console.error('Error removing total_questions column:', totalQuestionsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to remove total_questions column',
        error: totalQuestionsError.message
      });
    }

    console.log('✅ Successfully removed total_questions column');

    // Verify the columns are removed by checking table structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .rpc('execute_sql', {
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'vsk_quizzes' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (tableError) {
      console.error('Error checking table structure:', tableError);
    } else {
      console.log('Current vsk_quizzes table structure:', tableInfo);
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully removed pass_percentage and total_questions columns from vsk_quizzes table',
      tableStructure: tableInfo || []
    });

  } catch (error) {
    console.error('Unexpected error during column removal:', error);
    return res.status(500).json({
      success: false,
      message: 'Unexpected error during column removal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
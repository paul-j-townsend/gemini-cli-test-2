import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const results = [];

    // Create quizzes table using raw SQL
    const createQuizzesSQL = `
      CREATE TABLE IF NOT EXISTS public.quizzes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        podcast_episode_id UUID,
        category TEXT,
        difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
        total_questions INTEGER DEFAULT 0,
        pass_percentage INTEGER DEFAULT 70,
        time_limit_minutes INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { data: createResult, error: createError } = await supabase.rpc('exec', { sql: createQuizzesSQL });
    results.push({ step: 'create_quizzes_table', error: createError, data: createResult });

    // Add quiz_id column to quiz_questions
    const addColumnSQL = `
      ALTER TABLE public.quiz_questions 
      ADD COLUMN IF NOT EXISTS quiz_id UUID;
    `;

    const { data: addResult, error: addError } = await supabase.rpc('exec', { sql: addColumnSQL });
    results.push({ step: 'add_quiz_id_column', error: addError, data: addResult });

    // Create foreign key constraint
    const addConstraintSQL = `
      ALTER TABLE public.quiz_questions 
      ADD CONSTRAINT fk_quiz_questions_quiz_id 
      FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;
    `;

    const { data: constraintResult, error: constraintError } = await supabase.rpc('exec', { sql: addConstraintSQL });
    results.push({ step: 'add_foreign_key', error: constraintError, data: constraintResult });

    return res.status(200).json({
      message: 'Tables creation attempted',
      results,
      note: 'Check results for any errors. Some operations may require direct database access.'
    });

  } catch (error) {
    console.error('Table creation error:', error);
    return res.status(500).json({
      message: 'Failed to create tables',
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'You may need to create these tables manually in the Supabase dashboard'
    });
  }
} 
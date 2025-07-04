import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const results = [];

    // 1. Create quizzes table
    const createQuizzesTable = `
      CREATE TABLE IF NOT EXISTS quizzes (
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

    const { error: createError } = await supabaseAdmin.rpc('exec_sql', { sql: createQuizzesTable });
    results.push({ step: 'create_quizzes_table', error: createError });

    // 2. Add quiz_id column to quiz_questions
    const addQuizIdColumn = `
      ALTER TABLE quiz_questions 
      ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE;
    `;

    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', { sql: addQuizIdColumn });
    results.push({ step: 'add_quiz_id_column', error: alterError });

    // 3. Enable RLS on quizzes
    const enableRLS = `ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;`;
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', { sql: enableRLS });
    results.push({ step: 'enable_rls', error: rlsError });

    // 4. Create policies
    const createReadPolicy = `
      CREATE POLICY "Allow read access to quizzes" ON quizzes
      FOR SELECT USING (true);
    `;
    const { error: readPolicyError } = await supabaseAdmin.rpc('exec_sql', { sql: createReadPolicy });
    results.push({ step: 'create_read_policy', error: readPolicyError });

    // 5. Create sample quiz
    const { data: quiz, error: quizInsertError } = await supabaseAdmin
      .from('quizzes')
      .insert([{
        title: 'Veterinary Ethics and Professional Practice',
        description: 'Test your knowledge of ethical frameworks, professional boundaries, and decision-making in veterinary nursing practice.',
        category: 'ethics',
        difficulty: 'medium',
        total_questions: 5,
        pass_percentage: 70
      }])
      .select()
      .single();

    results.push({ step: 'insert_sample_quiz', error: quizInsertError, data: quiz });

    if (quiz && !quizInsertError) {
      // 6. Update existing questions to belong to this quiz
      const { error: updateError } = await supabaseAdmin
        .from('quiz_questions')
        .update({ quiz_id: quiz.id })
        .in('category', ['ethics', 'professional-practice', 'animal-welfare']);

      results.push({ step: 'update_questions', error: updateError });
    }

    return res.status(200).json({ 
      message: 'Quiz structure creation completed',
      results
    });

  } catch (error) {
    console.error('Creation error:', error);
    return res.status(500).json({ 
      message: 'Failed to create quiz structure',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
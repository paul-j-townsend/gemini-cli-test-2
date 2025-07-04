import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if quizzes table exists
    const { data: quizzes, error: quizzesError } = await supabaseAdmin
      .from('quizzes')
      .select('*')
      .limit(5);

    // Check quiz_questions structure
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, quiz_id, title')
      .limit(5);

    return res.status(200).json({
      quizzes: {
        data: quizzes,
        error: quizzesError
      },
      questions: {
        data: questions,
        error: questionsError
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
} 
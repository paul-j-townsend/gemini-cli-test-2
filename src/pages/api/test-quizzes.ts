import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Use admin client to bypass RLS
    const { data: quizzes, error } = await supabaseAdmin
      .from('quizzes')
      .select(`
        *,
        quiz_questions (
          id,
          question_number,
          title,
          learning_outcome,
          question,
          options,
          correct_answer_label,
          correct_answer_text,
          rationale,
          category,
          difficulty
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quizzes:', error);
      return res.status(500).json({ message: 'Failed to fetch quizzes', error });
    }

    return res.status(200).json(quizzes || []);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 
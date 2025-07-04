import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test direct access to question_answers table
    const { data: answers, error: answersError } = await supabaseAdmin
      .from('question_answers')
      .select('*')
      .limit(5);

    if (answersError) {
      return res.status(500).json({ 
        message: 'Error accessing question_answers table',
        error: answersError 
      });
    }

    // Test quiz query with relationships
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id,
        title,
        quiz_questions (
          id,
          question_text,
          question_number,
          question_answers (
            id,
            answer_letter,
            answer_text,
            is_correct
          )
        )
      `)
      .eq('id', '550e8400-e29b-41d4-a716-446655440002')
      .single();

    if (quizError) {
      return res.status(500).json({ 
        message: 'Error accessing quiz with relationships',
        error: quizError 
      });
    }

    return res.status(200).json({
      message: 'Test successful',
      directAnswers: answers,
      quizWithRelationships: quiz
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ 
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
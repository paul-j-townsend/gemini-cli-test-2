import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Valid quiz ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getQuiz(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getQuiz(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { data: quiz, error } = await supabaseAdmin
    .from('quizzes')
    .select(`
      *,
      quiz_questions (
        id,
        question_number,
        question_text,
        explanation,
        points,
        question_answers (
          id,
          answer_letter,
          answer_text,
          is_correct
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quiz:', error);
    if (error.code === 'PGRST116') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    return res.status(500).json({ message: 'Failed to fetch quiz' });
  }

  // Transform the quiz data to match the expected format
  const transformedQuiz = {
    ...quiz,
    questions: quiz.quiz_questions?.map((question: any) => ({
      id: question.id,
      question_text: question.question_text,
      learning_outcome: question.explanation,
      rationale: question.explanation,
      category: quiz.category,
      difficulty: quiz.difficulty,
      points: question.points,
      mcq_answers: question.question_answers?.map((answer: any) => ({
        id: answer.id,
        answer_text: answer.answer_text,
        is_correct: answer.is_correct,
        answer_letter: answer.answer_letter,
      })).sort((a: any, b: any) => a.answer_letter.localeCompare(b.answer_letter))
    })).sort((a: any, b: any) => (a.question_number || 0) - (b.question_number || 0))
  };

  return res.status(200).json(transformedQuiz);
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getQuizAttempts(req, res);
      case 'POST':
        return await createQuizAttempt(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getQuizAttempts(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, question_id } = req.query;
  
  let query = supabase
    .from('quiz_attempts')
    .select(`
      *,
      quiz_questions (
        id,
        title,
        question,
        options,
        correct_answer,
        explanation,
        category,
        difficulty
      )
    `)
    .order('completed_at', { ascending: false });

  if (user_id) {
    query = query.eq('user_id', user_id);
  }

  if (question_id) {
    query = query.eq('question_id', question_id);
  }

  const { data: attempts, error } = await query;

  if (error) {
    console.error('Error fetching quiz attempts:', error);
    return res.status(500).json({ message: 'Failed to fetch quiz attempts' });
  }

  return res.status(200).json(attempts || []);
}

async function createQuizAttempt(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, question_id, selected_answer_label, selected_answer_text } = req.body;

  if (!question_id || !selected_answer_label || !selected_answer_text) {
    return res.status(400).json({ message: 'Question ID, selected answer label, and selected answer text are required' });
  }

  // First, fetch the question to determine if the answer is correct
  const { data: question, error: questionError } = await supabase
    .from('quiz_questions')
    .select('correct_answer_label')
    .eq('id', question_id)
    .single();

  if (questionError) {
    console.error('Error fetching question:', questionError);
    return res.status(500).json({ message: 'Failed to validate answer' });
  }

  const is_correct = selected_answer_label === question.correct_answer_label;

  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .insert([
      {
        user_id,
        question_id,
        selected_answer_label,
        selected_answer_text,
        is_correct,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating quiz attempt:', error);
    return res.status(500).json({ message: 'Failed to create quiz attempt' });
  }

  return res.status(201).json(attempt);
}
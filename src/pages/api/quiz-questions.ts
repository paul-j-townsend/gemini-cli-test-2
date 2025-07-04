import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getQuestions(req, res);
      case 'POST':
        return await createQuestion(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getQuestions(req: NextApiRequest, res: NextApiResponse) {
  const { quiz_id } = req.query;

  let query = supabase.from('questions').select(`
    id,
    question_text,
    learning_outcome,
    rationale,
    category,
    difficulty,
    mcq_answers (
      id,
      answer_text,
      is_correct
    )
  `);

  if (quiz_id) {
    query = query.eq('quiz_id', quiz_id);
  }

  const { data: questions, error } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ message: 'Failed to fetch questions' });
  }

  return res.status(200).json(questions || []);
}

async function createQuestion(req: NextApiRequest, res: NextApiResponse) {
  const { quiz_id, question_text, learning_outcome, rationale, category, difficulty, answers } = req.body;

  if (!quiz_id || !question_text || !answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: 'Quiz ID, question text, and at least one answer are required' });
  }

  // 1. Create the question
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .insert([{
      quiz_id,
      question_text,
      learning_outcome,
      rationale,
      category,
      difficulty,
    }])
    .select()
    .single();

  if (questionError) {
    console.error('Error creating question:', questionError);
    return res.status(500).json({ message: 'Failed to create question' });
  }

  // 2. Create the answers
  const answersToInsert = answers.map((ans: any) => ({
    question_id: question.id,
    answer_text: ans.answer_text,
    is_correct: ans.is_correct,
  }));

  const { error: answersError } = await supabase
    .from('mcq_answers')
    .insert(answersToInsert);

  if (answersError) {
    console.error('Error creating answers:', answersError);
    // Simple cleanup: delete the question if answers fail
    await supabase.from('questions').delete().eq('id', question.id);
    return res.status(500).json({ message: 'Failed to create answers' });
  }

  // Refetch the question with its answers
  const { data: finalQuestion, error: finalQuestionError } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      mcq_answers (
        id,
        answer_text,
        is_correct
      )
    `)
    .eq('id', question.id)
    .single();

  if (finalQuestionError) {
    console.error('Error refetching question:', finalQuestionError);
    return res.status(500).json({ message: 'Question created, but failed to refetch' });
  }

  return res.status(201).json(finalQuestion);
}
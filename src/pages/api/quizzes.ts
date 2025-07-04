import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getQuizzes(req, res);
      case 'POST':
        return await createQuiz(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getQuizzes(req: NextApiRequest, res: NextApiResponse) {
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      created_at,
      questions (
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
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes:', error);
    return res.status(500).json({ message: 'Failed to fetch quizzes' });
  }

  return res.status(200).json(quizzes || []);
}

async function createQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, questions } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Title and at least one question are required' });
  }

  // 1. Create the quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert([{ title, description }])
    .select()
    .single();

  if (quizError) {
    console.error('Error creating quiz:', quizError);
    return res.status(500).json({ message: 'Failed to create quiz' });
  }

  // 2. Create all questions and their answers
  for (const q of questions) {
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert([{
        quiz_id: quiz.id,
        question_text: q.question_text,
        learning_outcome: q.learning_outcome,
        rationale: q.rationale,
        category: q.category,
        difficulty: q.difficulty,
      }])
      .select()
      .single();

    if (questionError) {
      console.error('Error creating question:', questionError);
      // Simple cleanup: delete the quiz if a question fails
      await supabase.from('quizzes').delete().eq('id', quiz.id);
      return res.status(500).json({ message: 'Failed to create questions' });
    }

    // 3. Create answers for the question
    const answersToInsert = q.answers.map((ans: any) => ({
      question_id: question.id,
      answer_text: ans.answer_text,
      is_correct: ans.is_correct,
    }));

    const { error: answersError } = await supabase
      .from('mcq_answers')
      .insert(answersToInsert);

    if (answersError) {
      console.error('Error creating answers:', answersError);
      // Simple cleanup
      await supabase.from('quizzes').delete().eq('id', quiz.id);
      return res.status(500).json({ message: 'Failed to create answers' });
    }
  }

  // Refetch the created quiz with all its nested data
  const { data: finalQuiz, error: finalQuizError } = await supabase
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      questions (
        id,
        question_text,
        mcq_answers (
          id,
          answer_text,
          is_correct
        )
      )
    `)
    .eq('id', quiz.id)
    .single();

  if (finalQuizError) {
    console.error('Error refetching quiz:', finalQuizError);
    return res.status(500).json({ message: 'Quiz created, but failed to refetch' });
  }

  return res.status(201).json(finalQuiz);
} 
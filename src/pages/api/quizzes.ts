import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
  const { data: quizzes, error } = await supabaseAdmin
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      category,
      pass_percentage,
      total_questions,
      is_active,
      created_at,
      updated_at
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes:', error);
    return res.status(500).json({ message: 'Failed to fetch quizzes' });
  }

  const transformedQuizzes = quizzes?.map(quiz => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    pass_percentage: quiz.pass_percentage,
    total_questions: quiz.total_questions,
    is_active: quiz.is_active,
    created_at: quiz.created_at,
    updated_at: quiz.updated_at
  })) || [];

  return res.status(200).json(transformedQuizzes);
}

async function createQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, category, pass_percentage, questions } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Title and at least one question are required' });
  }

  // 1. Create the quiz
  const { data: quiz, error: quizError } = await supabaseAdmin
    .from('quizzes')
    .insert([{ 
      title, 
      description, 
      category: category || '',
      pass_percentage: pass_percentage || 70,
      total_questions: questions.length,
      is_active: true
    }])
    .select()
    .single();

  if (quizError) {
    console.error('Error creating quiz:', quizError);
    return res.status(500).json({ message: 'Failed to create quiz' });
  }

  // 2. Create all questions and their answers
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const { data: question, error: questionError } = await supabaseAdmin
      .from('quiz_questions')
      .insert([{
        quiz_id: quiz.id,
        question_number: i + 1,
        question_text: q.question_text,
        explanation: q.explanation,
        points: q.points || 1,
      }])
      .select()
      .single();

    if (questionError) {
      console.error('Error creating question:', questionError);
      // Simple cleanup: delete the quiz if a question fails
      await supabaseAdmin.from('quizzes').delete().eq('id', quiz.id);
      return res.status(500).json({ message: 'Failed to create questions' });
    }

    // 3. Create answers for the question
    const answersToInsert = q.answers.map((ans: any) => ({
      question_id: question.id,
      answer_letter: ans.answer_letter,
      answer_text: ans.answer_text,
      is_correct: ans.is_correct,
    }));

    const { error: answersError } = await supabaseAdmin
      .from('question_answers')
      .insert(answersToInsert);

    if (answersError) {
      console.error('Error creating answers:', answersError);
      // Simple cleanup
      await supabaseAdmin.from('quizzes').delete().eq('id', quiz.id);
      return res.status(500).json({ message: 'Failed to create answers' });
    }
  }

  // Refetch the created quiz with all its nested data
  const { data: finalQuiz, error: finalQuizError } = await supabaseAdmin
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      category,
      pass_percentage,
      total_questions,
      is_active,
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
    .eq('id', quiz.id)
    .single();

  if (finalQuizError) {
    console.error('Error refetching quiz:', finalQuizError);
    return res.status(500).json({ message: 'Quiz created, but failed to refetch' });
  }

  return res.status(201).json(finalQuiz);
} 
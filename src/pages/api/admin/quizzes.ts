import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getQuizzes(req, res);
      case 'POST':
        return await createQuiz(req, res);
      case 'PUT':
        return await updateQuiz(req, res);
      case 'DELETE':
        return await deleteQuiz(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Quiz admin API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getQuizzes(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      category,
      difficulty,
      total_questions,
      pass_percentage,
      created_at,
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
    .order('created_at', { ascending: false })
    .order('question_number', { foreignTable: 'quiz_questions', ascending: true });
  
  if (error) {
    console.error('Error fetching quizzes:', error);
    return res.status(500).json({ message: 'Failed to fetch quizzes' });
  }

  return res.status(200).json(data || []);
}

async function createQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, category, difficulty, pass_percentage, quiz_questions } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // Create the quiz
  const { data: newQuiz, error: quizError } = await supabaseAdmin
    .from('quizzes')
    .insert([{
      title,
      description,
      category: category || '',
      difficulty: difficulty || 'beginner',
      total_questions: quiz_questions?.length || 0,
      pass_percentage: pass_percentage || 70
    }])
    .select()
    .single();

  if (quizError) {
    console.error('Error creating quiz:', quizError);
    return res.status(500).json({ message: 'Failed to create quiz' });
  }

  // Create questions and answers if provided
  if (quiz_questions && quiz_questions.length > 0) {
    for (const q of quiz_questions) {
      const { data: newQuestion, error: questionError } = await supabaseAdmin
        .from('quiz_questions')
        .insert([{
          quiz_id: newQuiz.id,
          question_number: q.question_number,
          question_text: q.question_text,
          explanation: q.explanation,
          points: q.points
        }])
        .select()
        .single();

      if (questionError) {
        console.error('Error creating question:', questionError);
        await supabaseAdmin.from('quizzes').delete().eq('id', newQuiz.id);
        return res.status(500).json({ message: 'Failed to create question' });
      }

      if (q.answers && q.answers.length > 0) {
        const answersToInsert = q.answers.map((a: any) => ({
          question_id: newQuestion.id,
          answer_letter: a.answer_letter,
          answer_text: a.answer_text,
          is_correct: a.is_correct
        }));

        const { error: answersError } = await supabaseAdmin
          .from('question_answers')
          .insert(answersToInsert);

        if (answersError) {
          console.error('Error creating answers:', answersError);
          await supabaseAdmin.from('quizzes').delete().eq('id', newQuiz.id);
          return res.status(500).json({ message: 'Failed to create answers' });
        }
      }
    }
  }

  // Return the complete quiz with questions
  const { data: completeQuiz } = await supabaseAdmin
    .from('quizzes')
    .select(`
      id,
      title,
      description,
      category,
      difficulty,
      total_questions,
      pass_percentage,
      quiz_questions (
        id,
        question_number,
        question_text
      )
    `)
    .eq('id', newQuiz.id)
    .single();

  return res.status(201).json(completeQuiz);
}

async function updateQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { id, title, description, category, difficulty, pass_percentage, quiz_questions } = req.body;

  if (!id || !title) {
    return res.status(400).json({ message: 'ID and title are required' });
  }

  // Update quiz
  const { error: quizError } = await supabaseAdmin
    .from('quizzes')
    .update({
      title,
      description,
      category,
      difficulty,
      total_questions: quiz_questions?.length || 0,
      pass_percentage
    })
    .eq('id', id);

  if (quizError) {
    console.error('Error updating quiz:', quizError);
    return res.status(500).json({ message: 'Failed to update quiz' });
  }

  // Delete existing questions and answers for this quiz
  const { error: deleteAnswersError } = await supabaseAdmin
    .from('question_answers')
    .delete()
    .in('question_id', quiz_questions.map((q: any) => q.id).filter(Boolean)); // Only delete existing ones

  if (deleteAnswersError) {
    console.error('Error deleting old answers:', deleteAnswersError);
    return res.status(500).json({ message: 'Failed to update quiz (delete old answers)' });
  }

  const { error: deleteQuestionsError } = await supabaseAdmin
    .from('quiz_questions')
    .delete()
    .eq('quiz_id', id);

  if (deleteQuestionsError) {
    console.error('Error deleting old questions:', deleteQuestionsError);
    return res.status(500).json({ message: 'Failed to update quiz (delete old questions)' });
  }

  // Insert new/updated questions and answers
  if (quiz_questions && quiz_questions.length > 0) {
    for (const q of quiz_questions) {
      const { data: newQuestion, error: questionError } = await supabaseAdmin
        .from('quiz_questions')
        .insert([{
          quiz_id: id,
          question_number: q.question_number,
          question_text: q.question_text,
          explanation: q.explanation,
          points: q.points
        }])
        .select()
        .single();

      if (questionError) {
        console.error('Error inserting new question:', questionError);
        return res.status(500).json({ message: 'Failed to update quiz (insert new question)' });
      }

      if (q.answers && q.answers.length > 0) {
        const answersToInsert = q.answers.map((a: any) => ({
          question_id: newQuestion.id,
          answer_letter: a.answer_letter,
          answer_text: a.answer_text,
          is_correct: a.is_correct
        }));

        const { error: answersError } = await supabaseAdmin
          .from('question_answers')
          .insert(answersToInsert);

        if (answersError) {
          console.error('Error inserting new answers:', answersError);
          return res.status(500).json({ message: 'Failed to update quiz (insert new answers)' });
        }
      }
    }
  }
  
  return res.status(200).json({ message: 'Quiz updated successfully' });
}

async function deleteQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Valid quiz ID is required' });
  }

  const { error } = await supabaseAdmin
    .from('quizzes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting quiz:', error);
    return res.status(500).json({ message: 'Failed to delete quiz' });
  }

  return res.status(200).json({ message: 'Quiz deleted successfully' });
}
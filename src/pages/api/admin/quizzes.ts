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
  const { data: quizzes, error } = await supabaseAdmin
    .from('vsk_quizzes')
    .select(`
      id,
      title,
      description,
      category,
      is_active,
      created_at,
      updated_at,
      vsk_quiz_questions (
        id,
        question_number,
        question_text,
        explanation,
        rationale,
        learning_outcome,
        vsk_question_answers (
          id,
          answer_letter,
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
  const { title, description, category, quiz_questions } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  console.log('Creating quiz with data:', { title, quiz_questions });

  // Create the quiz first
  const { data: quiz, error: quizError } = await supabaseAdmin
    .from('vsk_quizzes')
    .insert({
      title,
      description,
      category,
      is_active: true
    })
    .select()
    .single();

  if (quizError) {
    console.error('Error creating quiz:', quizError);
    return res.status(500).json({ message: 'Failed to create quiz' });
  }

  // Create questions and answers if provided
  if (quiz_questions && quiz_questions.length > 0) {
    for (const q of quiz_questions) {
      console.log('Creating question:', q);
      
      const { data: newQuestion, error: questionError } = await supabaseAdmin
        .from('vsk_quiz_questions')
        .insert([{
          quiz_id: quiz.id,
          question_number: q.question_number,
          question_text: q.question_text,
          explanation: q.explanation,
          rationale: q.rationale,
          learning_outcome: q.learning_outcome
        }])
        .select()
        .single();

      if (questionError) {
        console.error('Error creating question:', questionError);
        await supabaseAdmin.from('vsk_quizzes').delete().eq('id', quiz.id);
        return res.status(500).json({ message: 'Failed to create question' });
      }

      // Process answers - check for both 'answers' and 'question_answers' fields
      const answersArray = q.question_answers || q.answers || [];
      console.log('Creating answers for question:', newQuestion.id, answersArray);

      if (answersArray && answersArray.length > 0) {
        const answersToInsert = answersArray.map((a: any) => ({
          question_id: newQuestion.id,
          answer_letter: a.answer_letter,
          answer_text: a.answer_text,
          is_correct: a.is_correct
        }));

        const { error: answersError } = await supabaseAdmin
          .from('vsk_question_answers')
          .insert(answersToInsert);

        if (answersError) {
          console.error('Error creating answers:', answersError);
          await supabaseAdmin.from('vsk_quizzes').delete().eq('id', quiz.id);
          return res.status(500).json({ message: 'Failed to create answers' });
        }
      }
    }
  }

  // Return the complete quiz with questions
  const { data: completeQuiz } = await supabaseAdmin
    .from('vsk_quizzes')
    .select(`
      id,
      title,
      description,
      category,
      pass_percentage,
      total_questions,
      vsk_quiz_questions (
        id,
        question_number,
        question_text
      )
    `)
    .eq('id', quiz.id)
    .single();

  return res.status(201).json(completeQuiz);
}

async function updateQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { id, title, description, category, quiz_questions } = req.body;

  if (!id || !title) {
    return res.status(400).json({ message: 'ID and title are required' });
  }

  console.log('Updating quiz with data:', { id, title, quiz_questions });

  // Update the quiz
  const { error: quizError } = await supabaseAdmin
    .from('vsk_quizzes')
    .update({
      title,
      description,
      category
    })
    .eq('id', id);

  if (quizError) {
    console.error('Error updating quiz:', quizError);
    return res.status(500).json({ message: 'Failed to update quiz' });
  }

  // Delete existing questions and answers for this quiz
  // First, get all existing question IDs for this quiz
  const { data: existingQuestions, error: fetchError } = await supabaseAdmin
    .from('vsk_quiz_questions')
    .select('id')
    .eq('quiz_id', id);

  if (fetchError) {
    console.error('Error fetching existing questions:', fetchError);
    return res.status(500).json({ message: 'Failed to update quiz (fetch existing questions)' });
  }

  // Delete all existing answers for this quiz's questions
  if (existingQuestions && existingQuestions.length > 0) {
    const existingQuestionIds = existingQuestions.map(q => q.id);
    const { error: deleteAnswersError } = await supabaseAdmin
      .from('vsk_question_answers')
      .delete()
      .in('question_id', existingQuestionIds);

    if (deleteAnswersError) {
      console.error('Error deleting old answers:', deleteAnswersError);
      return res.status(500).json({ message: 'Failed to update quiz (delete old answers)' });
    }
  }

  // Delete all existing questions for this quiz
  const { error: deleteQuestionsError } = await supabaseAdmin
    .from('vsk_quiz_questions')
    .delete()
    .eq('quiz_id', id);

  if (deleteQuestionsError) {
    console.error('Error deleting old questions:', deleteQuestionsError);
    return res.status(500).json({ message: 'Failed to update quiz (delete old questions)' });
  }

  // Insert new/updated questions and answers
  if (quiz_questions && quiz_questions.length > 0) {
    for (const q of quiz_questions) {
      console.log('Processing question:', q);
      
      const { data: newQuestion, error: questionError } = await supabaseAdmin
        .from('vsk_quiz_questions')
        .insert([{
          quiz_id: id,
          question_number: q.question_number,
          question_text: q.question_text,
          explanation: q.explanation,
          rationale: q.rationale,
          learning_outcome: q.learning_outcome
        }])
        .select()
        .single();

      if (questionError) {
        console.error('Error inserting new question:', questionError);
        return res.status(500).json({ message: 'Failed to update quiz (insert new question)' });
      }

      // Process answers - check for both 'answers' and 'question_answers' fields
      const answersArray = q.question_answers || q.answers || [];
      console.log('Processing answers for question:', newQuestion.id, answersArray);

      if (answersArray && answersArray.length > 0) {
        const answersToInsert = answersArray.map((a: any) => ({
          question_id: newQuestion.id,
          answer_letter: a.answer_letter,
          answer_text: a.answer_text,
          is_correct: a.is_correct
        }));

        const { error: answersError } = await supabaseAdmin
          .from('vsk_question_answers')
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
    .from('vsk_quizzes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting quiz:', error);
    return res.status(500).json({ message: 'Failed to delete quiz' });
  }

  return res.status(200).json({ message: 'Quiz deleted successfully' });
}
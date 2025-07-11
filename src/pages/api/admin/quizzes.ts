import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { 
  transformToQuizPodcastEntity, 
  QUIZ_PODCAST_QUERY_FRAGMENT 
} from '@/utils/podcastQuizTransforms';

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
    .select(QUIZ_PODCAST_QUERY_FRAGMENT)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching quizzes:', error);
    return res.status(500).json({ message: 'Failed to fetch quizzes' });
  }

  const transformedQuizzes = (quizzes || []).map(quiz => transformToQuizPodcastEntity(quiz));

  return res.status(200).json(transformedQuizzes);
}

async function createQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { podcast_id, title, description, category, pass_percentage, quiz_questions } = req.body;

  if (!podcast_id) {
    return res.status(400).json({ message: 'Podcast ID is required for unified entity model' });
  }

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // Verify podcast exists
  const { data: podcast, error: podcastError } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .select('id')
    .eq('id', podcast_id)
    .single();

  if (podcastError || !podcast) {
    return res.status(404).json({ message: 'Podcast episode not found' });
  }

  // Create the quiz
  const { data: quiz, error: quizError } = await supabaseAdmin
    .from('vsk_quizzes')
    .insert({
      title,
      description,
      category: category || '',
      pass_percentage: pass_percentage || 70,
      total_questions: quiz_questions ? quiz_questions.length : 0,
      is_active: true
    })
    .select()
    .single();

  if (quizError) {
    console.error('Error creating quiz:', quizError);
    return res.status(500).json({ message: 'Failed to create quiz' });
  }

  // Link quiz to podcast
  const { error: linkError } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .update({ quiz_id: quiz.id })
    .eq('id', podcast_id);

  if (linkError) {
    console.error('Error linking quiz to podcast:', linkError);
    await supabaseAdmin.from('vsk_quizzes').delete().eq('id', quiz.id);
    return res.status(500).json({ message: 'Failed to link quiz to podcast' });
  }

  // Create questions and answers if provided
  if (quiz_questions && quiz_questions.length > 0) {
    for (const q of quiz_questions) {
      const { data: newQuestion, error: questionError } = await supabaseAdmin
        .from('vsk_quiz_questions')
        .insert([{
          quiz_id: quiz.id,
          question_number: q.question_number,
          question_text: q.question_text,
          explanation: q.explanation || '',
          rationale: q.rationale || '',
          learning_outcome: q.learning_outcome || ''
        }])
        .select()
        .single();

      if (questionError) {
        console.error('Error creating question:', questionError);
        await supabaseAdmin.from('vsk_quizzes').delete().eq('id', quiz.id);
        return res.status(500).json({ message: 'Failed to create question' });
      }

      const answersArray = q.question_answers || q.answers || [];
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

  // Return the unified entity
  const { data: completeQuiz, error: fetchError } = await supabaseAdmin
    .from('vsk_quizzes')
    .select(QUIZ_PODCAST_QUERY_FRAGMENT)
    .eq('id', quiz.id)
    .single();

  if (fetchError) {
    console.error('Error fetching complete quiz:', fetchError);
    return res.status(500).json({ message: 'Quiz created but failed to fetch complete data' });
  }

  return res.status(201).json(transformToQuizPodcastEntity(completeQuiz));
}

async function updateQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { id, title, description, category, pass_percentage, is_active, quiz_questions } = req.body;

  if (!id || !title) {
    return res.status(400).json({ message: 'ID and title are required' });
  }

  // Update the quiz metadata
  const { error: quizError } = await supabaseAdmin
    .from('vsk_quizzes')
    .update({
      title,
      description,
      category,
      pass_percentage,
      is_active,
      total_questions: quiz_questions ? quiz_questions.length : 0
    })
    .eq('id', id);

  if (quizError) {
    console.error('Error updating quiz:', quizError);
    return res.status(500).json({ message: 'Failed to update quiz' });
  }

  // If questions are provided, replace all existing questions
  if (quiz_questions && quiz_questions.length > 0) {
    // Get existing question IDs for cleanup
    const { data: existingQuestions, error: fetchError } = await supabaseAdmin
      .from('vsk_quiz_questions')
      .select('id')
      .eq('quiz_id', id);

    if (fetchError) {
      console.error('Error fetching existing questions:', fetchError);
      return res.status(500).json({ message: 'Failed to update quiz questions' });
    }

    // Delete existing answers and questions
    if (existingQuestions && existingQuestions.length > 0) {
      const existingQuestionIds = existingQuestions.map(q => q.id);
      await supabaseAdmin
        .from('vsk_question_answers')
        .delete()
        .in('question_id', existingQuestionIds);
    }

    await supabaseAdmin
      .from('vsk_quiz_questions')
      .delete()
      .eq('quiz_id', id);

    // Insert new questions and answers
    for (const q of quiz_questions) {
      const { data: newQuestion, error: questionError } = await supabaseAdmin
        .from('vsk_quiz_questions')
        .insert([{
          quiz_id: id,
          question_number: q.question_number,
          question_text: q.question_text,
          explanation: q.explanation || '',
          rationale: q.rationale || '',
          learning_outcome: q.learning_outcome || ''
        }])
        .select()
        .single();

      if (questionError) {
        console.error('Error creating question:', questionError);
        return res.status(500).json({ message: 'Failed to update quiz questions' });
      }

      const answersArray = q.question_answers || q.answers || [];
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
          return res.status(500).json({ message: 'Failed to update quiz answers' });
        }
      }
    }
  }

  // Return the updated unified entity
  const { data: updatedQuiz, error: fetchUpdatedError } = await supabaseAdmin
    .from('vsk_quizzes')
    .select(QUIZ_PODCAST_QUERY_FRAGMENT)
    .eq('id', id)
    .single();

  if (fetchUpdatedError) {
    console.error('Error fetching updated quiz:', fetchUpdatedError);
    return res.status(500).json({ message: 'Quiz updated but failed to fetch updated data' });
  }

  return res.status(200).json(transformToQuizPodcastEntity(updatedQuiz));
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
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
    .from('vsk_quizzes')
    .select(QUIZ_PODCAST_QUERY_FRAGMENT)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes:', error);
    return res.status(500).json({ message: 'Failed to fetch quizzes' });
  }

  const transformedQuizzes = (quizzes || []).map(quiz => transformToQuizPodcastEntity(quiz));

  return res.status(200).json(transformedQuizzes);
}

async function createQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { podcast_id, title, description, category, pass_percentage, questions } = req.body;

  if (!podcast_id) {
    return res.status(400).json({ message: 'Podcast ID is required for unified entity model' });
  }

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Title and at least one question are required' });
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

  // Create questions and answers
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const { data: question, error: questionError } = await supabaseAdmin
      .from('vsk_quiz_questions')
      .insert([{
        quiz_id: quiz.id,
        question_number: i + 1,
        question_text: q.question_text,
        explanation: q.explanation || '',
        rationale: q.rationale || '',
        learning_outcome: q.learning_outcome || '',
      }])
      .select()
      .single();

    if (questionError) {
      console.error('Error creating question:', questionError);
      await supabaseAdmin.from('vsk_quizzes').delete().eq('id', quiz.id);
      return res.status(500).json({ message: 'Failed to create questions' });
    }

    const answersToInsert = q.answers.map((ans: any) => ({
      question_id: question.id,
      answer_letter: ans.answer_letter,
      answer_text: ans.answer_text,
      is_correct: ans.is_correct,
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

  // Return the unified entity
  const { data: finalQuiz, error: finalQuizError } = await supabaseAdmin
    .from('vsk_quizzes')
    .select(QUIZ_PODCAST_QUERY_FRAGMENT)
    .eq('id', quiz.id)
    .single();

  if (finalQuizError) {
    console.error('Error refetching quiz:', finalQuizError);
    return res.status(500).json({ message: 'Quiz created, but failed to refetch' });
  }

  return res.status(201).json(transformToQuizPodcastEntity(finalQuiz));
} 
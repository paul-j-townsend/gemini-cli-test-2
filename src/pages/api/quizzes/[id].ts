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
    .from('vsk_quizzes')
    .select(`
      id,
      title,
      description,
      category,
      pass_percentage,
      total_questions,
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
      ),
      vsk_podcast_episodes!vsk_podcast_episodes_quiz_id_fkey (
        id,
        title,
        description,
        audio_src,
        full_audio_src,
        published_at,
        is_published,
        episode_number,
        season,
        duration,
        slug,
        image_url,
        thumbnail_path
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

  // Transform the quiz data to match the expected format with podcast info
  const transformedQuiz = {
    ...quiz,
    questions: quiz.vsk_quiz_questions?.map(q => ({
      id: q.id,
      question_text: q.question_text,
      learning_outcome: q.learning_outcome || null,
      rationale: q.rationale,
      category: quiz.category,
      mcq_answers: q.vsk_question_answers?.sort((a, b) => a.answer_letter.localeCompare(b.answer_letter)) || []
    })) || [],
    // Always include podcast episode information as part of unified entity
    podcast_episode: quiz.vsk_podcast_episodes ? {
      id: quiz.vsk_podcast_episodes.id,
      title: quiz.vsk_podcast_episodes.title,
      description: quiz.vsk_podcast_episodes.description,
      audio_src: quiz.vsk_podcast_episodes.audio_src,
      full_audio_src: quiz.vsk_podcast_episodes.full_audio_src,
      published_at: quiz.vsk_podcast_episodes.published_at,
      is_published: quiz.vsk_podcast_episodes.is_published,
      episode_number: quiz.vsk_podcast_episodes.episode_number,
      season: quiz.vsk_podcast_episodes.season,
      duration: quiz.vsk_podcast_episodes.duration,
      slug: quiz.vsk_podcast_episodes.slug,
      image_url: quiz.vsk_podcast_episodes.image_url,
      thumbnail_path: quiz.vsk_podcast_episodes.thumbnail_path
    } : null
  };

  return res.status(200).json(transformedQuiz);
} 
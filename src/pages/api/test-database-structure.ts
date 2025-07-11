import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test actual database structure
    const { data: episodes, error: episodeError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select(`
        id,
        title,
        description,
        audio_src,
        full_audio_src,
        episode_number,
        quiz_id,
        is_published,
        slug,
        created_at,
        updated_at
      `)
      .limit(1);

    if (episodeError) {
      console.error('Episode fetch error:', episodeError);
      return res.status(500).json({ error: 'Failed to fetch episodes', details: episodeError.message });
    }

    const { data: quizzes, error: quizError } = await supabaseAdmin
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
        updated_at
      `)
      .limit(1);

    if (quizError) {
      console.error('Quiz fetch error:', quizError);
      return res.status(500).json({ error: 'Failed to fetch quizzes', details: quizError.message });
    }

    // Test the relationship
    const { data: episodeWithQuiz, error: relationError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select(`
        id,
        title,
        quiz_id,
        quiz:vsk_quizzes(
          id,
          title,
          description,
          category,
          pass_percentage,
          total_questions,
          is_active
        )
      `)
      .limit(1);

    if (relationError) {
      console.error('Relationship fetch error:', relationError);
      return res.status(500).json({ error: 'Failed to fetch relationship', details: relationError.message });
    }

    return res.status(200).json({
      success: true,
      data: {
        episodes: episodes || [],
        quizzes: quizzes || [],
        episodeWithQuiz: episodeWithQuiz || [],
        schema: {
          episode_sample: episodes?.[0] || null,
          quiz_sample: quizzes?.[0] || null,
          relationship_sample: episodeWithQuiz?.[0] || null
        }
      }
    });

  } catch (error) {
    console.error('Database structure test error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
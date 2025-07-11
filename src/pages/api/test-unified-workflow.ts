import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.body;

  try {
    if (action === 'test_relationship') {
      return await testPodcastQuizRelationship(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Unified workflow test error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testPodcastQuizRelationship(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test the relationship by fetching all episodes with their complete quiz data
    const { data: episodes, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select(`
        id,
        title,
        quiz_id,
        quiz:vsk_quizzes(
          id,
          title,
          category,
          total_questions,
          questions:vsk_quiz_questions(
            id,
            question_number,
            question_text
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to test relationships: ${error.message}`);
    }

    // Validate that every episode has a quiz
    const validation = episodes?.map(episode => ({
      episodeId: episode.id,
      episodeTitle: episode.title,
      hasQuizId: !!episode.quiz_id,
      hasQuizData: !!episode.quiz,
      quizTitle: episode.quiz?.title || 'Missing',
      questionCount: episode.quiz?.questions?.length || 0,
      isValid: !!episode.quiz_id && !!episode.quiz
    })) || [];

    const allValid = validation.every(v => v.isValid);
    const totalEpisodes = validation.length;
    const validEpisodes = validation.filter(v => v.isValid).length;

    return res.status(200).json({
      success: true,
      message: 'Unified podcast-quiz relationship test completed',
      data: {
        summary: {
          totalEpisodes,
          validEpisodes,
          invalidEpisodes: totalEpisodes - validEpisodes,
          allValid,
          successRate: totalEpisodes > 0 ? (validEpisodes / totalEpisodes) * 100 : 0
        },
        episodes: validation
      }
    });

  } catch (error) {
    console.error('Relationship test failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to test relationships',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
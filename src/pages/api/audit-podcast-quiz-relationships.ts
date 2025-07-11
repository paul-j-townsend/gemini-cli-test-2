import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Count podcast episodes without associated quizzes
    const { data: episodesWithoutQuizzes, error: episodesError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, title, quiz_id')
      .is('quiz_id', null);

    if (episodesError) {
      console.error('Error fetching episodes without quizzes:', episodesError);
      return res.status(500).json({ error: 'Failed to fetch episodes without quizzes' });
    }

    // Count quizzes without associated podcast episodes
    const { data: quizzesWithoutEpisodes, error: quizzesError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select(`
        id,
        title,
        episodes:vsk_podcast_episodes!vsk_podcast_episodes_quiz_id_fkey(id)
      `);

    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
      return res.status(500).json({ error: 'Failed to fetch quizzes' });
    }

    // Filter quizzes that have no associated episodes
    const orphanedQuizzes = quizzesWithoutEpisodes?.filter(quiz => 
      !quiz.episodes || quiz.episodes.length === 0
    ) || [];

    // Get total counts for context
    const { count: totalEpisodes, error: totalEpisodesError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('*', { count: 'exact', head: true });

    const { count: totalQuizzes, error: totalQuizzesError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*', { count: 'exact', head: true });

    if (totalEpisodesError || totalQuizzesError) {
      console.error('Error fetching totals:', { totalEpisodesError, totalQuizzesError });
      return res.status(500).json({ error: 'Failed to fetch total counts' });
    }

    // Check for any many-to-many relationships (multiple episodes using same quiz)
    const { data: quizUsageData, error: quizUsageError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('quiz_id')
      .not('quiz_id', 'is', null);

    if (quizUsageError) {
      console.error('Error checking quiz usage:', quizUsageError);
      return res.status(500).json({ error: 'Failed to check quiz usage' });
    }

    // Find quizzes used by multiple episodes
    const quizUsageCounts = quizUsageData?.reduce((acc, episode) => {
      const quizId = episode.quiz_id;
      acc[quizId] = (acc[quizId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const sharedQuizzes = Object.entries(quizUsageCounts)
      .filter(([_, count]) => count > 1)
      .map(([quizId, count]) => ({ quizId, episodeCount: count }));

    // Get current foreign key constraint info
    const { data: constraintInfo, error: constraintError } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          SELECT 
            conname as constraint_name,
            pg_get_constraintdef(c.oid) as constraint_definition
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE t.relname = 'vsk_podcast_episodes' 
            AND c.contype = 'f'
            AND pg_get_constraintdef(c.oid) LIKE '%quiz_id%'
        `
      });

    if (constraintError) {
      console.error('Error checking constraints:', constraintError);
    }

    const auditResults = {
      summary: {
        totalEpisodes: totalEpisodes || 0,
        totalQuizzes: totalQuizzes || 0,
        episodesWithoutQuizzes: episodesWithoutQuizzes?.length || 0,
        quizzesWithoutEpisodes: orphanedQuizzes.length,
        sharedQuizzes: sharedQuizzes.length,
        episodesWithQuizzes: (totalEpisodes || 0) - (episodesWithoutQuizzes?.length || 0)
      },
      details: {
        episodesWithoutQuizzes: episodesWithoutQuizzes?.map(ep => ({
          id: ep.id,
          title: ep.title
        })) || [],
        quizzesWithoutEpisodes: orphanedQuizzes.map(quiz => ({
          id: quiz.id,
          title: quiz.title
        })),
        sharedQuizzes,
        currentConstraints: constraintInfo || []
      },
      recommendations: {
        needsDefaultQuizzes: (episodesWithoutQuizzes?.length || 0) > 0,
        needsOrphanedQuizCleanup: orphanedQuizzes.length > 0,
        needsOneToOneEnforcement: sharedQuizzes.length > 0,
        readyForMigration: (episodesWithoutQuizzes?.length || 0) === 0 && orphanedQuizzes.length === 0
      }
    };

    return res.status(200).json(auditResults);

  } catch (error) {
    console.error('Error in audit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting direct constraint fix...');

    // Step 1: First, get all quiz_questions IDs to see what's valid
    const { data: validQuizIds, error: quizError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id');

    if (quizError) {
      console.error('Error fetching quiz questions:', quizError);
      return res.status(500).json({ 
        message: 'Could not fetch quiz questions', 
        error: quizError 
      });
    }

    const validIds = validQuizIds?.map(q => q.id) || [];
    console.log('Valid quiz question IDs:', validIds);

    // Step 2: Get all podcast episodes with quiz_id
    const { data: episodes, error: episodesError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, quiz_id')
      .not('quiz_id', 'is', null);

    if (episodesError) {
      console.error('Error fetching episodes:', episodesError);
      return res.status(500).json({ 
        message: 'Could not fetch podcast episodes', 
        error: episodesError 
      });
    }

    console.log('Episodes with quiz_id:', episodes);

    // Step 3: Find episodes with invalid quiz_id
    const invalidEpisodes = episodes?.filter(ep => !validIds.includes(ep.quiz_id)) || [];
    console.log('Episodes with invalid quiz_id:', invalidEpisodes);

    // Step 4: Clear invalid quiz_id values
    if (invalidEpisodes.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('vsk_podcast_episodes')
        .update({ quiz_id: null })
        .in('id', invalidEpisodes.map(ep => ep.id));

      if (updateError) {
        console.error('Error updating episodes:', updateError);
        return res.status(500).json({ 
          message: 'Could not update episodes', 
          error: updateError 
        });
      }

      console.log(`Cleared quiz_id for ${invalidEpisodes.length} episodes`);
    }

    // Step 5: Verify the fix
    const { data: remainingInvalid, error: verifyError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, quiz_id')
      .not('quiz_id', 'is', null);

    if (verifyError) {
      console.error('Error verifying fix:', verifyError);
    }

    const stillInvalid = remainingInvalid?.filter(ep => !validIds.includes(ep.quiz_id)) || [];

    return res.status(200).json({ 
      message: 'Foreign key constraint fixed successfully',
      details: {
        validQuizIds: validIds.length,
        episodesWithQuizId: episodes?.length || 0,
        invalidEpisodesFound: invalidEpisodes.length,
        invalidEpisodesCleared: invalidEpisodes.length,
        stillInvalid: stillInvalid.length
      },
      invalidEpisodes: invalidEpisodes.map(ep => ep.id),
      suggestion: invalidEpisodes.length > 0 ? 
        'Invalid quiz_id references have been cleared. You can now assign valid quiz IDs from the quiz management interface.' :
        'No invalid quiz_id references found.'
    });

  } catch (err: any) {
    console.error('Direct constraint fix error:', err);
    return res.status(500).json({ 
      message: 'Failed to fix constraint directly', 
      error: err.message
    });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting podcast quiz constraint fix...');

    // Step 1: Check current constraint
    const { data: constraints, error: constraintError } = await supabaseAdmin
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_name', 'vsk_podcast_episodes')
      .eq('constraint_type', 'FOREIGN KEY');

    console.log('Current constraints:', constraints);

    // Step 2: First, let's see what quiz_id values exist in podcast episodes
    const { data: episodes, error: episodeError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, quiz_id')
      .not('quiz_id', 'is', null);

    console.log('Episodes with quiz_id:', episodes);

    // Step 3: Check what quiz IDs exist in the quizzes table
    const { data: quizzes, error: quizzesError } = await supabaseAdmin
      .from('quizzes')
      .select('id, title');

    console.log('Available quizzes:', quizzes);

    // Step 4: Update any podcast episodes that have invalid quiz_id references
    if (episodes && episodes.length > 0) {
      const validQuizIds = quizzes?.map(q => q.id) || [];
      const invalidEpisodes = episodes.filter(ep => !validQuizIds.includes(ep.quiz_id));
      
      console.log('Episodes with invalid quiz_id:', invalidEpisodes);

      if (invalidEpisodes.length > 0) {
        // Clear invalid quiz_id references
        for (const episode of invalidEpisodes) {
          const { error: updateError } = await supabaseAdmin
            .from('vsk_podcast_episodes')
            .update({ quiz_id: null })
            .eq('id', episode.id);

          if (updateError) {
            console.error(`Error clearing quiz_id for episode ${episode.id}:`, updateError);
          }
        }
        console.log(`Cleared ${invalidEpisodes.length} invalid quiz_id references`);
      }
    }

    // Step 5: Try to test a quiz assignment
    if (episodes && episodes.length > 0 && quizzes && quizzes.length > 0) {
      const testEpisode = episodes[0];
      const testQuiz = quizzes[0];
      
      console.log(`Testing assignment of quiz ${testQuiz.id} to episode ${testEpisode.id}`);
      
      const { data: testResult, error: testError } = await supabaseAdmin
        .from('vsk_podcast_episodes')
        .update({ quiz_id: testQuiz.id })
        .eq('id', testEpisode.id)
        .select();

      if (testError) {
        console.error('Test assignment failed:', testError);
        return res.status(500).json({ 
          message: 'Quiz assignment test failed', 
          error: testError,
          suggestion: 'The foreign key constraint may need to be updated in the database schema'
        });
      } else {
        console.log('Test assignment successful:', testResult);
      }
    }

    return res.status(200).json({ 
      message: 'Podcast quiz constraint check completed',
      constraints,
      episodes,
      quizzes,
      success: true
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err });
  }
} 
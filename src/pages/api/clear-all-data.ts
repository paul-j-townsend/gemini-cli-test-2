import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { confirmation } = req.body;
  if (confirmation !== 'CLEAR_ALL_DATA_CONFIRMED') {
    return res.status(400).json({ error: 'Invalid confirmation code' });
  }

  try {
    console.log('Clearing all data...');

    // Delete all data in dependency order
    await supabaseAdmin.from('vsk_quiz_completions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_user_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_question_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_quiz_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_podcast_episodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_valid_keywords').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('All data cleared successfully');

    return res.status(200).json({
      success: true,
      message: 'All data cleared successfully'
    });

  } catch (error) {
    console.error('Data clearing failed:', error);
    return res.status(500).json({
      error: 'Data clearing failed',
      details: error
    });
  }
}
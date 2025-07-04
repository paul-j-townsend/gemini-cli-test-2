import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { episodeId, quizId } = req.body;

  try {
    // Test assignment
    const { data: updatedEpisode, error: updateError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .update({ quiz_id: quizId })
      .eq('id', episodeId)
      .select('id, title, quiz_id')
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError });
    }

    return res.status(200).json({ success: true, updatedEpisode });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
} 
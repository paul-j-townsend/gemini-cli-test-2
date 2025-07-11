import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Update all episodes that are published but don't have published_at dates
    const { data, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .update({ 
        published_at: new Date().toISOString() 
      })
      .eq('is_published', true)
      .is('published_at', null)
      .select('id, title, published_at, is_published');

    if (error) {
      return res.status(500).json({ error: 'Failed to update published dates', details: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Updated published dates for episodes',
      data: {
        updatedEpisodes: data || [],
        count: data?.length || 0
      }
    });

  } catch (error) {
    console.error('Fix published dates error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
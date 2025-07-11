import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all episodes
    const { data: allEpisodes, error: allError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, title, published_at, is_published')
      .order('created_at', { ascending: false });

    if (allError) {
      return res.status(500).json({ error: 'Failed to fetch all episodes', details: allError.message });
    }

    // Get published episodes (with published_at)
    const { data: publishedEpisodes, error: publishedError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, title, published_at, is_published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (publishedError) {
      return res.status(500).json({ error: 'Failed to fetch published episodes', details: publishedError.message });
    }

    return res.status(200).json({
      success: true,
      data: {
        allEpisodes: allEpisodes || [],
        publishedEpisodes: publishedEpisodes || [],
        counts: {
          total: allEpisodes?.length || 0,
          published: publishedEpisodes?.length || 0,
          unpublished: (allEpisodes?.length || 0) - (publishedEpisodes?.length || 0)
        }
      }
    });

  } catch (error) {
    console.error('Debug episodes error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getEpisodes(req, res);
      case 'POST':
        return await createEpisode(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getEpisodes(req: NextApiRequest, res: NextApiResponse) {
  const { data: episodes, error } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching episodes:', error);
    return res.status(500).json({ message: 'Failed to fetch episodes' });
  }

  return res.status(200).json({ episodes });
}

async function createEpisode(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, audio_url, thumbnail_path, published_at } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const { data: episode, error } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .insert([
      {
        title,
        description,
        audio_url,
        thumbnail_path,
        published_at,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating episode:', error);
    return res.status(500).json({ message: 'Failed to create episode' });
  }

  return res.status(201).json({ episode });
} 
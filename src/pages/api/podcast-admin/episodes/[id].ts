import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Episode ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getEpisode(id, res);
      case 'PUT':
        return await updateEpisode(id, req, res);
      case 'DELETE':
        return await deleteEpisode(id, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getEpisode(id: string, res: NextApiResponse) {
  const { data: episode, error } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching episode:', error);
    return res.status(404).json({ message: 'Episode not found' });
  }

  return res.status(200).json({ episode });
}

async function updateEpisode(id: string, req: NextApiRequest, res: NextApiResponse) {
  const { title, description, audio_url, image_url, published_at } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const { data: episode, error } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .update({
      title,
      description,
      audio_url,
      image_url,
      published_at,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating episode:', error);
    return res.status(500).json({ message: 'Failed to update episode' });
  }

  return res.status(200).json({ episode });
}

async function deleteEpisode(id: string, res: NextApiResponse) {
  const { error } = await supabaseAdmin
    .from('vsk_podcast_episodes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting episode:', error);
    return res.status(500).json({ message: 'Failed to delete episode' });
  }

  return res.status(200).json({ message: 'Episode deleted successfully' });
}
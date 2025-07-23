import { NextApiRequest, NextApiResponse } from 'next';
import { seriesService } from '@/services/seriesService';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Series ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(id, res);
      case 'PUT':
        return await handlePut(id, req, res);
      case 'DELETE':
        return await handleDelete(id, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Series API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(id: string, res: NextApiResponse) {
  try {
    const series = await seriesService.getSeriesById(id);
    
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    return res.status(200).json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return res.status(500).json({ error: 'Failed to fetch series' });
  }
}

async function handlePut(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, slug, description, thumbnail_path, display_order, is_active } = req.body;

    const series = await seriesService.updateSeries(id, {
      name,
      slug,
      description,
      thumbnail_path,
      display_order,
      is_active
    });

    return res.status(200).json(series);
  } catch (error) {
    console.error('Error updating series:', error);
    return res.status(500).json({ error: 'Failed to update series' });
  }
}

async function handleDelete(id: string, res: NextApiResponse) {
  try {
    await seriesService.deleteSeries(id);
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting series:', error);
    if (error instanceof Error && error.message.includes('content is still assigned')) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to delete series' });
  }
}
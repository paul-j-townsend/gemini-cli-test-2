import { NextApiRequest, NextApiResponse } from 'next';
import { seriesService } from '@/services/seriesService';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Series API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { include_inactive, with_content_count } = req.query;
    
    if (with_content_count === 'true') {
      const series = await seriesService.getSeriesWithContentCount();
      return res.status(200).json(series);
    }
    
    const series = await seriesService.getSeries(include_inactive === 'true');
    return res.status(200).json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return res.status(500).json({ error: 'Failed to fetch series' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, slug, description, thumbnail_path, display_order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const series = await seriesService.createSeries({
      name,
      slug,
      description,
      thumbnail_path,
      display_order
    });

    return res.status(201).json(series);
  } catch (error) {
    console.error('Error creating series:', error);
    return res.status(500).json({ error: 'Failed to create series' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Series ID is required' });
    }

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

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Series ID is required' });
    }

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
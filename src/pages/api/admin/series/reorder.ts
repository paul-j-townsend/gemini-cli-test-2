import { NextApiRequest, NextApiResponse } from 'next';
import { seriesService } from '@/services/seriesService';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { series_updates } = req.body;

    if (!Array.isArray(series_updates)) {
      return res.status(400).json({ error: 'series_updates must be an array' });
    }

    // Validate each update object
    for (const update of series_updates) {
      if (!update.id || typeof update.display_order !== 'number') {
        return res.status(400).json({ 
          error: 'Each update must have id and display_order' 
        });
      }
    }

    await seriesService.updateSeriesOrder(series_updates);
    return res.status(200).json({ message: 'Series order updated successfully' });
  } catch (error) {
    console.error('Error updating series order:', error);
    return res.status(500).json({ error: 'Failed to update series order' });
  }
}
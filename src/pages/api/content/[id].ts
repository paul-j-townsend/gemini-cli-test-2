import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Content ID is required' });
    }

    // Get content details from vsk_content table
    const { data: content, error } = await supabaseAdmin
      .from('vsk_content')
      .select(`
        id,
        title,
        description,
        audio_src,
        full_audio_src,
        image_url,
        thumbnail_path,
        duration,
        episode_number,
        season,
        slug,
        published_at,
        is_published,
        featured,
        category,
        tags,
        show_notes,
        transcript,
        file_size,
        meta_title,
        meta_description,
        quiz_title,
        quiz_description,
        quiz_category,
        pass_percentage,
        total_questions,
        quiz_is_active,
        series_id,
        price_cents,
        stripe_price_id,
        is_purchasable,
        created_at,
        updated_at,
        series:vsk_series(
          id,
          name,
          slug,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Content not found' });
      }
      throw error;
    }

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Return content data
    res.status(200).json({
      success: true,
      ...content,
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to fetch content',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to fetch content',
      details: 'Unknown error occurred'
    });
  }
}
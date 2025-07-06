import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Episode ID is required' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        return await updateEpisode(req, res, id);
      case 'DELETE':
        return await deleteEpisode(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateEpisode(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    console.log('Update episode request body:', req.body);
    
    const { 
      title, 
      description, 
      audio_url, 
      thumbnail_path, 
      published_at,
      episode_number,
      season,
      duration,
      slug,
      published,
      featured,
      category,
      tags,
      show_notes,
      transcript,
      meta_title,
      meta_description,
      full_audio_url,
      image_url,
      quiz_id
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validate quiz_id exists if provided
    let validQuizId = null;
    if (quiz_id && quiz_id.trim() !== '') {
      const { data: quizExists } = await supabaseAdmin
        .from('vsk_quizzes')
        .select('id')
        .eq('id', quiz_id)
        .single();
      
      if (quizExists) {
        validQuizId = quiz_id;
      } else {
        console.log(`Quiz ID ${quiz_id} not found, setting to null`);
      }
    }

    // Map frontend field names to database column names
    // Only include columns that exist in the database
    const updateData: any = {
      title,
      description,
      published_at,
      episode_number,
      season,
      duration,
      slug,
      quiz_id: validQuizId,
      is_published: published || false,
      updated_at: new Date().toISOString(),
    };

    // Handle audio URLs - map frontend names to DB column names
    if (audio_url !== undefined) {
      updateData.audio_src = audio_url;
    }
    if (full_audio_url !== undefined) {
      updateData.full_audio_src = full_audio_url;
    }
    
    // Handle image URLs - prioritize image_url over thumbnail_path
    if (image_url !== undefined) {
      updateData.image_url = image_url;
    } else if (thumbnail_path !== undefined) {
      updateData.image_url = thumbnail_path;
    }
    if (thumbnail_path !== undefined) {
      updateData.thumbnail_path = thumbnail_path;
    }

    // Remove fields that don't exist in the database yet
    // (These would be added in future migrations)
    // The form may send these but we'll ignore them for now
    delete updateData.category;
    delete updateData.tags;
    delete updateData.featured;
    delete updateData.show_notes;
    delete updateData.transcript;
    delete updateData.meta_title;
    delete updateData.meta_description;
    delete updateData.file_size;

    console.log('Mapped update data:', updateData);

    const { data: episode, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating episode:', error);
      return res.status(500).json({ 
        message: 'Failed to update episode',
        error: error.message,
        details: error.details
      });
    }

    // Map database fields to frontend-expected fields
    const mappedEpisode = {
      ...episode,
      audio_url: episode.audio_src,
      full_audio_url: episode.full_audio_src,
      published: episode.is_published
    };

    return res.status(200).json({ episode: mappedEpisode });
  } catch (err) {
    console.error('Unexpected error in updateEpisode:', err);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}

async function deleteEpisode(req: NextApiRequest, res: NextApiResponse, id: string) {
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
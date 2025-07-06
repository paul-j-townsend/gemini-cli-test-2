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
  try {
    // First try with quiz relationship - use quizzes table instead of quiz_questions
    const { data: episodes, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select(`
        *,
        vsk_quizzes (
          id,
          title,
          total_questions
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      // If join fails (likely quiz_id column doesn't exist), try without quiz relationship
      console.log('Quiz relationship query failed, trying without quiz data:', error);
      
      const { data: episodesWithoutQuiz, error: fallbackError } = await supabaseAdmin
        .from('vsk_podcast_episodes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fallbackError) {
        console.error('Error fetching episodes (fallback):', fallbackError);
        return res.status(500).json({ message: 'Failed to fetch episodes' });
      }

      // Map database fields to frontend-expected fields for fallback too
      const mappedFallbackEpisodes = episodesWithoutQuiz?.map(episode => ({
        ...episode,
        audio_url: episode.audio_src,
        full_audio_url: episode.full_audio_src,
        published: episode.is_published
      })) || [];

      return res.status(200).json({ episodes: mappedFallbackEpisodes });
    }

    // Map database fields to frontend-expected fields
    const mappedEpisodes = episodes?.map(episode => ({
      ...episode,
      audio_url: episode.audio_src,
      full_audio_url: episode.full_audio_src,
      published: episode.is_published
    })) || [];

    return res.status(200).json({ episodes: mappedEpisodes });
  } catch (err) {
    console.error('Unexpected error fetching episodes:', err);
    return res.status(500).json({ message: 'Failed to fetch episodes' });
  }
}

async function createEpisode(req: NextApiRequest, res: NextApiResponse) {
  try {
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

    // Only insert columns that exist in the database
    const insertData: any = {
      title,
      description,
      audio_src: audio_url, // Map to correct column name
      full_audio_src: full_audio_url, // Map to correct column name
      image_url: image_url || thumbnail_path, // Map to correct column name
      thumbnail_path,
      published_at,
      episode_number,
      season,
      duration,
      slug,
      quiz_id: validQuizId,
      is_published: published || false // Map to correct column name
    };

    const { data: episode, error } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating episode:', error);
      return res.status(500).json({ 
        message: 'Failed to create episode',
        error: error.message,
        details: error.details
      });
    }

    return res.status(201).json({ episode });
  } catch (err) {
    console.error('Unexpected error in createEpisode:', err);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
} 
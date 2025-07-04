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
        quizzes (
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

      return res.status(200).json({ episodes: episodesWithoutQuiz || [] });
    }

    return res.status(200).json({ episodes: episodes || [] });
  } catch (err) {
    console.error('Unexpected error fetching episodes:', err);
    return res.status(500).json({ message: 'Failed to fetch episodes' });
  }
}

async function createEpisode(req: NextApiRequest, res: NextApiResponse) {
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
    quiz_id
  } = req.body;

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
        quiz_id: quiz_id || null
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
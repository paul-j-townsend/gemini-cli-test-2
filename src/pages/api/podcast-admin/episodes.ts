import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { podcastService } from '@/services/podcastService';

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
    // Use the podcast service to always get complete episode data with quiz info
    const episodes = await podcastService.getAllEpisodes();
    
    // Map to expected format for admin interface
    const mappedEpisodes = episodes.map(episode => ({
      ...episode,
      audio_url: episode.audio_src,
      full_audio_url: episode.full_audio_src,
      published: episode.is_published,
      category: [],
      // Always include quiz data as part of unified entity
      quiz: episode.quiz,
      // Keep legacy format for backward compatibility
      vsk_quizzes: episode.quiz ? {
        id: episode.quiz.id,
        title: episode.quiz.title,
        total_questions: episode.quiz.total_questions
      } : undefined
    }));

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

    // Validate content_id exists if provided
    let validContentId = null;
    if (quiz_id && quiz_id.trim() !== '') {
      const { data: contentExists } = await supabaseAdmin
        .from('vsk_content')
        .select('id')
        .eq('id', quiz_id)
        .single();
      
      if (contentExists) {
        validContentId = quiz_id;
      } else {
        console.log(`Content ID ${quiz_id} not found, setting to null`);
      }
    }

    // Parse duration from string format (MM:SS or HH:MM:SS) to seconds
    let durationInSeconds = null;
    if (duration && duration !== '') {
      if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':').map(Number);
        if (parts.length === 2) {
          durationInSeconds = parts[0] * 60 + parts[1]; // MM:SS
        } else if (parts.length === 3) {
          durationInSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
        }
      } else if (typeof duration === 'number') {
        durationInSeconds = duration;
      }
    }

    // Map form fields to database schema
    const insertData: any = {
      title,
      description,
      audio_src: audio_url,
      full_audio_src: full_audio_url,
      image_url,
      thumbnail_path,
      published_at,
      is_published: published || false,
      episode_number,
      season,
      duration: durationInSeconds,
      slug,
      content_id: validContentId
    };

    // Remove undefined fields
    Object.keys(insertData).forEach(key => {
      if (insertData[key] === undefined) {
        delete insertData[key];
      }
    });

    // Use the podcast service to create episode with complete quiz data
    const episode = await podcastService.createEpisode({
      title,
      description,
      audio_src: audio_url,
      full_audio_src: full_audio_url,
      image_url,
      thumbnail_path,
      published_at,
      episode_number,
      season,
      duration: durationInSeconds,
      slug,
      is_published: published || false,
      content_id: validContentId
    });

    // Map to expected format for admin interface
    const mappedEpisode = {
      ...episode,
      audio_url: episode.audio_src,
      full_audio_url: episode.full_audio_src,
      published: episode.is_published,
      quiz: episode.quiz,
      // Keep legacy format for backward compatibility
      vsk_quizzes: episode.quiz ? {
        id: episode.quiz.id,
        title: episode.quiz.title,
        total_questions: episode.quiz.total_questions
      } : undefined
    };

    return res.status(201).json({ episode: mappedEpisode });
  } catch (err) {
    console.error('Unexpected error in createEpisode:', err);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
} 
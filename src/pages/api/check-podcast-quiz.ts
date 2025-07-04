import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check podcast episodes for quiz references
    const { data: episodes, error: episodesError } = await supabase
      .from('vsk_podcast_episodes')
      .select('id, title, quiz_id')
      .limit(5);

    if (episodesError) {
      return res.status(500).json({
        message: 'Failed to fetch episodes',
        error: episodesError.message
      });
    }

    // If any episodes have quiz_id, try to fetch that quiz
    const episodeWithQuiz = episodes?.find(ep => ep.quiz_id);
    let quizData = null;
    
    if (episodeWithQuiz) {
      // Try different quiz endpoints that might work
      try {
        const response = await fetch(`http://localhost:3001/api/quizzes/${episodeWithQuiz.quiz_id}`);
        if (response.ok) {
          quizData = await response.json();
        }
      } catch (err) {
        // Ignore fetch error
      }
    }

    return res.status(200).json({
      message: 'Podcast quiz check complete',
      episodes: episodes?.map(ep => ({
        id: ep.id,
        title: ep.title,
        hasQuiz: !!ep.quiz_id,
        quiz_id: ep.quiz_id
      })),
      episodeWithQuiz,
      quizData,
      success: true
    });

  } catch (error) {
    console.error('Podcast quiz check error:', error);
    return res.status(500).json({ 
      message: 'Check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
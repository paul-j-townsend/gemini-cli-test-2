import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = 'fed2a63e-196d-43ff-9ebc-674db34e72a7'; // Current default user ID

    // First, assign quiz IDs to existing podcast episodes
    const { data: episodes, error: fetchError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, title')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching episodes:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch episodes' });
    }

    // Assign quiz IDs to episodes if they exist
    if (episodes && episodes.length > 0) {
      for (let i = 0; i < episodes.length; i++) {
        const episode = episodes[i];
        let quizId = '';
        
        if (i === 0 || episode.title?.toLowerCase().includes('anatomy') || episode.title === 'a') {
          quizId = 'fed2a63e-196d-43ff-9ebc-674db34e72a7'; // Animal Anatomy & Physiology
        } else {
          quizId = '550e8400-e29b-41d4-a716-446655440000'; // Veterinary Fundamentals
        }

        await supabaseAdmin
          .from('vsk_podcast_episodes')
          .update({ quiz_id: quizId })
          .eq('id', episode.id);
      }
    }

    // Create sample quiz completions
    const completions = [
      {
        user_id: userId,
        quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
        podcast_id: episodes?.[0]?.id || null,
        score: 100,
        max_score: 100,
        percentage: 100,
        time_spent: 600, // 10 minutes
        completed_at: new Date('2025-07-05T10:30:00Z').toISOString(),
        answers: [
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111111', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111112'], isCorrect: true, points: 20 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111113', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111114'], isCorrect: true, points: 20 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111115', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111116'], isCorrect: true, points: 20 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111117', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111118'], isCorrect: true, points: 20 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111119', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111120'], isCorrect: true, points: 20 }
        ],
        passed: true,
        attempts: 1
      },
      {
        user_id: userId,
        quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
        podcast_id: episodes?.[0]?.id || null,
        score: 67,
        max_score: 100,
        percentage: 67,
        time_spent: 720, // 12 minutes
        completed_at: new Date('2025-07-05T14:20:00Z').toISOString(),
        answers: [
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111111', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111121'], isCorrect: false, points: 0 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111113', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111114'], isCorrect: true, points: 20 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111115', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111122'], isCorrect: false, points: 0 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111117', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111118'], isCorrect: true, points: 20 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111119', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111120'], isCorrect: true, points: 20 },
          { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111123', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111124'], isCorrect: true, points: 7 }
        ],
        passed: true,
        attempts: 2
      },
      {
        user_id: userId,
        quiz_id: '550e8400-e29b-41d4-a716-446655440000',
        podcast_id: episodes?.[1]?.id || null,
        score: 85,
        max_score: 100,
        percentage: 85,
        time_spent: 240, // 4 minutes
        completed_at: new Date('2024-01-15T09:00:00Z').toISOString(),
        answers: [
          { questionId: 'b1c2d3e4-f5g6-7890-bcde-222222222221', selectedAnswers: ['b1c2d3e4-f5g6-7890-bcde-222222222222'], isCorrect: true, points: 20 },
          { questionId: 'b1c2d3e4-f5g6-7890-bcde-222222222223', selectedAnswers: ['b1c2d3e4-f5g6-7890-bcde-222222222224'], isCorrect: true, points: 25 },
          { questionId: 'b1c2d3e4-f5g6-7890-bcde-222222222225', selectedAnswers: ['b1c2d3e4-f5g6-7890-bcde-222222222226'], isCorrect: false, points: 0 },
          { questionId: 'b1c2d3e4-f5g6-7890-bcde-222222222227', selectedAnswers: ['b1c2d3e4-f5g6-7890-bcde-222222222228'], isCorrect: true, points: 20 },
          { questionId: 'b1c2d3e4-f5g6-7890-bcde-222222222229', selectedAnswers: ['b1c2d3e4-f5g6-7890-bcde-222222222230'], isCorrect: true, points: 20 }
        ],
        passed: true,
        attempts: 1
      }
    ];

    // Clear existing completions for this user first
    await supabaseAdmin
      .from('vsk_quiz_completions')
      .delete()
      .eq('user_id', userId);

    // Insert new completions
    const { data: insertedCompletions, error: insertError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .insert(completions)
      .select();

    if (insertError) {
      console.error('Error inserting completions:', insertError);
      return res.status(500).json({ error: 'Failed to insert completions', details: insertError });
    }

    // Create/update user progress
    const userProgress = {
      user_id: userId,
      total_quizzes_completed: 3,
      total_quizzes_passed: 3,
      total_score: 252,
      total_max_score: 300,
      average_score: 84,
      total_time_spent: 1560, // 26 minutes
      completion_rate: 100, // All passed
      last_activity_at: new Date('2025-07-05T14:20:00Z').toISOString(),
      streak_days: 1,
      badges: [
        {
          id: 'c1d2e3f4-g5h6-7890-cdef-333333333331',
          name: 'First Steps',
          description: 'Completed your first quiz',
          icon: '🎯',
          earned_at: new Date('2024-01-15T09:00:00Z').toISOString(),
          category: 'completion'
        },
        {
          id: 'c1d2e3f4-g5h6-7890-cdef-333333333332',
          name: 'Perfectionist',
          description: 'Scored 100% on a quiz',
          icon: '💎',
          earned_at: new Date('2025-07-05T10:30:00Z').toISOString(),
          category: 'score'
        },
        {
          id: 'c1d2e3f4-g5h6-7890-cdef-333333333333',
          name: 'High Achiever',
          description: 'Maintained 80%+ average score',
          icon: '🏆',
          earned_at: new Date('2025-07-05T14:20:00Z').toISOString(),
          category: 'score'
        }
      ]
    };

    // Upsert user progress
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('vsk_user_progress')
      .upsert(userProgress, { onConflict: 'user_id' })
      .select();

    if (progressError) {
      console.error('Error upserting user progress:', progressError);
      return res.status(500).json({ error: 'Failed to upsert user progress', details: progressError });
    }

    return res.status(200).json({ 
      message: 'Sample data created successfully',
      completions: insertedCompletions?.length || 0,
      progress: progressData?.[0] || null,
      episodesUpdated: episodes?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
}
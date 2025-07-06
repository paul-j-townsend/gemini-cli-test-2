import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = 'fed2a63e-196d-43ff-9ebc-674db34e72a7';

    // First, create the user if it doesn't exist
    const userData = {
      id: userId,
      email: 'admin@vetsidekick.com',
      name: 'Super Admin',
      role: 'super_admin',
      status: 'active',
      lastLoginAt: new Date().toISOString(),
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };

    // Try to insert the user, or update if it exists
    const { data: userData_result, error: userError } = await supabaseAdmin
      .from('vsk_users')
      .upsert(userData, { onConflict: 'id' })
      .select();

    if (userError) {
      console.error('Error creating user:', userError);
      return res.status(500).json({ error: 'Failed to create user', details: userError });
    }

    // Now create quiz completions
    const completions = [
      {
        userId: userId,
        quizId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
        podcastId: null,
        score: 100,
        maxScore: 100,
        percentage: 100,
        timeSpent: 600,
        completedAt: new Date('2025-07-05T10:30:00Z').toISOString(),
        answers: [
          { questionId: 'q1', selectedAnswers: ['option1'], isCorrect: true, points: 20 },
          { questionId: 'q2', selectedAnswers: ['option2'], isCorrect: true, points: 20 },
          { questionId: 'q3', selectedAnswers: ['option1'], isCorrect: true, points: 20 },
          { questionId: 'q4', selectedAnswers: ['option3'], isCorrect: true, points: 20 },
          { questionId: 'q5', selectedAnswers: ['option2'], isCorrect: true, points: 20 }
        ],
        passed: true,
        attempts: 1
      },
      {
        userId: userId,
        quizId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
        podcastId: null,
        score: 67,
        maxScore: 100,
        percentage: 67,
        timeSpent: 720,
        completedAt: new Date('2025-07-05T14:20:00Z').toISOString(),
        answers: [
          { questionId: 'q1', selectedAnswers: ['option2'], isCorrect: false, points: 0 },
          { questionId: 'q2', selectedAnswers: ['option2'], isCorrect: true, points: 20 },
          { questionId: 'q3', selectedAnswers: ['option1'], isCorrect: false, points: 0 },
          { questionId: 'q4', selectedAnswers: ['option3'], isCorrect: true, points: 20 },
          { questionId: 'q5', selectedAnswers: ['option2'], isCorrect: true, points: 20 },
          { questionId: 'q6', selectedAnswers: ['option1'], isCorrect: true, points: 7 }
        ],
        passed: true,
        attempts: 2
      },
      {
        userId: userId,
        quizId: '550e8400-e29b-41d4-a716-446655440000',
        podcastId: null,
        score: 85,
        maxScore: 100,
        percentage: 85,
        timeSpent: 240,
        completedAt: new Date('2024-01-15T09:00:00Z').toISOString(),
        answers: [
          { questionId: 'q1', selectedAnswers: ['option1'], isCorrect: true, points: 20 },
          { questionId: 'q2', selectedAnswers: ['option2'], isCorrect: true, points: 25 },
          { questionId: 'q3', selectedAnswers: ['option1'], isCorrect: false, points: 0 },
          { questionId: 'q4', selectedAnswers: ['option3'], isCorrect: true, points: 20 },
          { questionId: 'q5', selectedAnswers: ['option2'], isCorrect: true, points: 20 }
        ],
        passed: true,
        attempts: 1
      }
    ];

    // Clear existing completions
    await supabaseAdmin
      .from('vsk_quiz_completions')
      .delete()
      .eq('userId', userId);

    // Insert completions
    const { data: completionData, error: completionError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .insert(completions)
      .select();

    if (completionError) {
      console.error('Error inserting completions:', completionError);
      return res.status(500).json({ error: 'Failed to insert completions', details: completionError });
    }

    // Create user progress
    const userProgress = {
      userId: userId,
      totalQuizzesCompleted: 3,
      totalQuizzesPassed: 3,
      totalScore: 252,
      totalMaxScore: 300,
      averageScore: 84,
      totalTimeSpent: 1560,
      completionRate: 100,
      lastActivityAt: new Date('2025-07-05T14:20:00Z').toISOString(),
      streakDays: 1,
      badges: [
        {
          id: 'first-steps',
          name: 'First Steps',
          description: 'Completed your first quiz',
          icon: '🎯',
          earnedAt: new Date('2024-01-15T09:00:00Z').toISOString(),
          category: 'completion'
        },
        {
          id: 'perfectionist',
          name: 'Perfectionist',
          description: 'Scored 100% on a quiz',
          icon: '💎',
          earnedAt: new Date('2025-07-05T10:30:00Z').toISOString(),
          category: 'score'
        },
        {
          id: 'high-achiever',
          name: 'High Achiever',
          description: 'Maintained 80%+ average score',
          icon: '🏆',
          earnedAt: new Date('2025-07-05T14:20:00Z').toISOString(),
          category: 'score'
        }
      ]
    };

    // Upsert user progress
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('vsk_user_progress')
      .upsert(userProgress, { onConflict: 'userId' })
      .select();

    if (progressError) {
      console.error('Error creating user progress:', progressError);
      return res.status(500).json({ error: 'Failed to create user progress', details: progressError });
    }

    return res.status(200).json({
      message: 'Sample data created successfully',
      user: userData_result?.[0],
      completions: completionData?.length || 0,
      progress: progressData?.[0]
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
}
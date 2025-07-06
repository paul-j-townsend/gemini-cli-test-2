import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to insert a simple completion - let Supabase generate the ID
    const completion = {
      userId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
      quizId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
      podcastId: null,
      score: 100,
      maxScore: 100,
      percentage: 100,
      timeSpent: 600,
      completedAt: new Date('2025-07-05T10:30:00Z').toISOString(),
      answers: [
        { questionId: 'a1b2c3d4-e5f6-7890-abcd-111111111111', selectedAnswers: ['a1b2c3d4-e5f6-7890-abcd-111111111112'], isCorrect: true, points: 20 }
      ],
      passed: true,
      attempts: 1
    };

    // First check what's in the table
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .limit(5);

    console.log('Existing completions:', existing);
    console.log('Select error:', selectError);

    // Try inserting
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .insert(completion)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ 
        error: 'Failed to insert completion', 
        details: error,
        existing: existing
      });
    }

    return res.status(200).json({
      message: 'Test completion inserted successfully',
      data: data,
      existing: existing
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
}
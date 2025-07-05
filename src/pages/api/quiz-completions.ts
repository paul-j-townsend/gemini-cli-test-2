import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getQuizCompletion(req, res);
      case 'POST':
        return await recordQuizCompletion(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Quiz completion API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get quiz completion status for a user/session
async function getQuizCompletion(req: NextApiRequest, res: NextApiResponse) {
  const { quiz_id, session_id } = req.query;

  if (!quiz_id || !session_id) {
    return res.status(400).json({ message: 'quiz_id and session_id are required' });
  }

  const { data: completion, error } = await supabaseAdmin
    .from('quiz_completions')
    .select('*')
    .eq('quiz_id', quiz_id)
    .eq('user_session', session_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching quiz completion:', error);
    return res.status(500).json({ message: 'Failed to fetch completion status' });
  }

  // Return completion status
  return res.status(200).json({
    completed: !!completion,
    passed: completion?.passed || false,
    score_percentage: completion?.score_percentage || 0,
    completed_at: completion?.completed_at || null
  });
}

// Record a quiz completion
async function recordQuizCompletion(req: NextApiRequest, res: NextApiResponse) {
  const { quiz_id, session_id, score_percentage, passed } = req.body;

  if (!quiz_id || !session_id || score_percentage === undefined || passed === undefined) {
    return res.status(400).json({ 
      message: 'quiz_id, session_id, score_percentage, and passed are required' 
    });
  }

  // Validate score_percentage
  if (score_percentage < 0 || score_percentage > 100) {
    return res.status(400).json({ message: 'score_percentage must be between 0 and 100' });
  }

  try {
    // Insert or update the completion record
    const { data: completion, error } = await supabaseAdmin
      .from('quiz_completions')
      .upsert({
        quiz_id,
        user_session: session_id,
        score_percentage,
        passed,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording quiz completion:', error);
      return res.status(500).json({ message: 'Failed to record completion' });
    }

    return res.status(200).json({
      message: 'Quiz completion recorded successfully',
      completion
    });

  } catch (error) {
    console.error('Error in recordQuizCompletion:', error);
    return res.status(500).json({ message: 'Failed to record completion' });
  }
}
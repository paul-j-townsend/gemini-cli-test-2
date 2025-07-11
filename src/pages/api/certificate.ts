import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { QuizCompletion } from '@/types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { completionId, userId } = req.query;

    if (!completionId || !userId) {
      return res.status(400).json({ error: 'Missing completionId or userId' });
    }

    // Fetch the quiz completion
    const { data: completion, error: completionError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .eq('id', completionId)
      .eq('user_id', userId)
      .single();

    if (completionError || !completion) {
      return res.status(404).json({ error: 'Quiz completion not found' });
    }

    // Only allow certificates for passed quizzes
    if (!completion.passed) {
      return res.status(403).json({ error: 'Certificate only available for passed quizzes' });
    }

    // Fetch the user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('vsk_users')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the quiz details
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('title, description')
      .eq('id', completion.quiz_id)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Return certificate data
    return res.status(200).json({
      completion: completion as QuizCompletion,
      userName: user.name,
      userEmail: user.email,
      quizTitle: quiz.title,
      quizDescription: quiz.description,
    });

  } catch (error) {
    console.error('Error fetching certificate data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { quizCompletionService } from '@/services/quizCompletionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getCompletions(req, res);
      case 'POST':
        return await createCompletion(req, res);
      case 'DELETE':
        return await deleteCompletion(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Quiz completion service API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getCompletions(req: NextApiRequest, res: NextApiResponse) {
  const { userId, quizId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    if (quizId) {
      // Get completions for a specific quiz
      const completions = await quizCompletionService.findCompletionsByQuizId(quizId as string);
      return res.status(200).json(completions.filter(c => c.user_id === userId));
    } else {
      // Get all completions for user
      const completions = await quizCompletionService.findCompletionsByUserId(userId as string);
      return res.status(200).json(completions);
    }
  } catch (error) {
    console.error('Error fetching completions:', error);
    return res.status(500).json({ message: 'Failed to fetch completions' });
  }
}

async function createCompletion(req: NextApiRequest, res: NextApiResponse) {
  const { 
    user_id, 
    quiz_id, 
    podcast_id, 
    score, 
    max_score, 
    percentage, 
    time_spent, 
    answers, 
    passed, 
    attempts 
  } = req.body;

  if (!user_id || !quiz_id || score === undefined || max_score === undefined) {
    return res.status(400).json({ 
      message: 'user_id, quiz_id, score, and max_score are required' 
    });
  }

  try {
    const completionData = {
      user_id,
      quiz_id,
      podcast_id: podcast_id || null,
      score,
      max_score,
      percentage: percentage !== undefined ? percentage : Math.round((score / max_score) * 100),
      time_spent: time_spent || 0,
      completed_at: new Date().toISOString(),
      answers: answers || [],
      passed: passed !== undefined ? passed : ((score / max_score) >= 0.7),
      attempts: attempts || 1
    };

    const completion = await quizCompletionService.createCompletion(completionData);
    return res.status(201).json(completion);
  } catch (error) {
    console.error('Error creating completion:', error);
    return res.status(500).json({ message: 'Failed to create completion' });
  }
}

async function deleteCompletion(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Completion ID is required' });
  }

  try {
    const success = await quizCompletionService.deleteCompletion(id);
    
    if (success) {
      return res.status(200).json({ message: 'Completion deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Completion not found' });
    }
  } catch (error) {
    console.error('Error deleting completion:', error);
    return res.status(500).json({ message: 'Failed to delete completion' });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { quizCompletionService } from '../../services/quizCompletionService';
import { continuationService } from '../../services/continuationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, quizId, action } = req.query;

    if (!userId || !quizId) {
      return res.status(400).json({ message: 'userId and quizId are required' });
    }

    switch (action) {
      case 'status':
        const status = await quizCompletionService.checkAttemptLimits(userId as string, quizId as string);
        return res.status(200).json(status);

      case 'remaining':
        const remaining = await quizCompletionService.getRemainingAttempts(userId as string, quizId as string);
        return res.status(200).json({ attemptsRemaining: remaining });

      case 'next-attempt':
        const nextAttempt = await quizCompletionService.getNextAttemptAvailableTime(userId as string, quizId as string);
        return res.status(200).json({ nextAttemptAvailableAt: nextAttempt?.toISOString() || null });

      case 'stats':
        if (!quizId) {
          return res.status(400).json({ message: 'quizId is required for stats' });
        }
        const stats = await quizCompletionService.getContinuationStats(quizId as string);
        return res.status(200).json(stats);

      default:
        // Default to status check
        const defaultStatus = await quizCompletionService.checkAttemptLimits(userId as string, quizId as string);
        return res.status(200).json(defaultStatus);
    }
  } catch (error) {
    console.error('Error in quiz continuation GET:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { action } = req.query;
    const { userId, quizId } = req.body;

    if (!userId || !quizId) {
      return res.status(400).json({ message: 'userId and quizId are required' });
    }

    switch (action) {
      case 'reset':
        await quizCompletionService.resetUserAttempts(userId, quizId);
        return res.status(200).json({ message: 'User attempts reset successfully' });

      case 'record-attempt':
        const { passed = false } = req.body;
        await continuationService.recordAttempt(userId, quizId, passed);
        return res.status(200).json({ message: 'Attempt recorded successfully' });

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in quiz continuation POST:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
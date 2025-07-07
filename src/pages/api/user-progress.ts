import { NextApiRequest, NextApiResponse } from 'next';
import { quizCompletionService } from '@/services/quizCompletionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getUserProgress(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User progress API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getUserProgress(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const progress = await quizCompletionService.getUserProgress(userId as string);
    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return res.status(500).json({ message: 'Failed to fetch user progress' });
  }
}
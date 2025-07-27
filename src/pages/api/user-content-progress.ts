import { NextApiRequest, NextApiResponse } from 'next';
import { userContentProgressService } from '@/services/userContentProgressService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getProgress(req, res);
      case 'POST':
        return await updateProgress(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User content progress API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getProgress(req: NextApiRequest, res: NextApiResponse) {
  const { userId, contentId } = req.query;

  if (!userId || !contentId) {
    return res.status(400).json({ message: 'userId and contentId are required' });
  }

  try {
    const progress = await userContentProgressService.getProgress(
      userId as string, 
      contentId as string
    );

    if (!progress) {
      // Return default progress if none found
      return res.status(200).json({
        user_id: userId,
        content_id: contentId,
        has_listened: false,
        listen_progress_percentage: 0,
        quiz_completed: false,
        report_downloaded: false,
        certificate_downloaded: false
      });
    }

    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching user content progress:', error);
    return res.status(500).json({ message: 'Failed to fetch progress' });
  }
}

async function updateProgress(req: NextApiRequest, res: NextApiResponse) {
  const { userId, contentId, action, data } = req.body;

  console.log('updateProgress called with:', { userId, contentId, action, data });

  if (!userId || !contentId || !action) {
    console.log('Missing required fields:', { userId, contentId, action });
    return res.status(400).json({ 
      message: 'userId, contentId, and action are required' 
    });
  }

  try {
    let result = null;

    switch (action) {
      case 'listen_progress':
        const { progressPercentage, hasListened } = data;
        console.log('Updating listen progress:', { progressPercentage, hasListened });
        result = await userContentProgressService.updateListenProgress(
          userId, 
          contentId, 
          progressPercentage, 
          hasListened
        );
        break;

      case 'quiz_completed':
        console.log('Marking quiz completed');
        result = await userContentProgressService.markQuizCompleted(userId, contentId);
        break;

      case 'report_downloaded':
        console.log('Marking report downloaded');
        result = await userContentProgressService.markReportDownloaded(userId, contentId);
        break;

      case 'certificate_downloaded':
        console.log('Marking certificate downloaded');
        result = await userContentProgressService.markCertificateDownloaded(userId, contentId);
        break;

      default:
        console.log('Invalid action:', action);
        return res.status(400).json({ message: 'Invalid action' });
    }

    if (!result) {
      console.log('Service returned null result');
      return res.status(500).json({ message: 'Failed to update progress' });
    }

    console.log('Successfully updated progress:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating user content progress:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ message: 'Failed to update progress' });
  }
}
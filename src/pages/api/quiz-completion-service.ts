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
    console.log('GET request - userId:', userId, 'quizId:', quizId);
    
    if (quizId) {
      // Get completions for a specific quiz
      console.log('Fetching completions for specific quiz:', quizId);
      const completions = await quizCompletionService.findCompletionsByQuizId(quizId as string);
      console.log('Found completions for quiz:', completions.length);
      return res.status(200).json(completions.filter(c => c.user_id === userId));
    } else {
      // Get all completions for user
      console.log('Fetching all completions for user:', userId);
      const completions = await quizCompletionService.findCompletionsByUserId(userId as string);
      console.log('Found user completions:', completions.length);
      return res.status(200).json(completions);
    }
  } catch (error) {
    console.error('Error fetching completions:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return res.status(500).json({ 
      message: 'Failed to fetch completions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function createCompletion(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== QUIZ COMPLETION API START ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { 
    user_id, 
    content_id,
    quiz_id, // legacy support 
    podcast_id, // legacy support
    score, 
    max_score, 
    percentage, 
    time_spent, 
    answers, 
    passed, 
    attempts 
  } = req.body;

  // Support both new content_id and legacy quiz_id
  const finalContentId = content_id || quiz_id;

  console.log('Extracted values:');
  console.log('- user_id:', user_id);
  console.log('- finalContentId:', finalContentId);
  console.log('- score:', score, 'max_score:', max_score);
  console.log('- percentage:', percentage);
  console.log('- passed:', passed);
  console.log('- attempts:', attempts);

  if (!user_id || !finalContentId || score === undefined || max_score === undefined) {
    console.log('VALIDATION ERROR - Missing required fields:', { 
      user_id: !!user_id, 
      finalContentId: !!finalContentId, 
      score: score !== undefined, 
      max_score: max_score !== undefined 
    });
    return res.status(400).json({ 
      message: 'user_id, content_id (or quiz_id), score, and max_score are required' 
    });
  }

  try {
    const completionData = {
      user_id,
      quiz_id: finalContentId, // Map content_id to quiz_id for database schema
      score,
      max_score,
      percentage: percentage !== undefined ? percentage : Math.round((score / max_score) * 100),
      time_spent: time_spent || 0,
      completed_at: new Date().toISOString(),
      answers: answers || [],
      passed: passed !== undefined ? passed : ((score / max_score) >= 0.7),
      attempts: attempts || 1
    };

    console.log('Completion data to send to service:', JSON.stringify(completionData, null, 2));
    
    const completion = await quizCompletionService.createCompletion(completionData);
    console.log('SERVICE RETURNED SUCCESS:', JSON.stringify(completion, null, 2));
    return res.status(201).json(completion);
  } catch (error) {
    console.error('=== SERVICE ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=== END SERVICE ERROR ===');
    
    return res.status(500).json({ 
      message: 'Failed to create completion',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
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
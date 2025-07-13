import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Valid quiz ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getQuiz(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getQuiz(req: NextApiRequest, res: NextApiResponse, id: string) {
  // This endpoint is deprecated due to unified content system
  // Use /api/admin/content?id=xxx instead
  return res.status(501).json({ 
    message: 'Quiz endpoint deprecated - use unified content API', 
    redirectTo: `/api/admin/content?id=${id}` 
  });
} 
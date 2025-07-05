import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try to select the learning_outcome column to see if it exists
    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .select('learning_outcome')
      .limit(1);
    
    if (error) {
      if (error.code === '42703') {
        // Column doesn't exist
        return res.status(200).json({ 
          exists: false, 
          message: 'learning_outcome column does not exist'
        });
      } else {
        // Other error
        return res.status(500).json({ 
          exists: false, 
          message: 'Error checking column',
          error: error.message
        });
      }
    }
    
    // Column exists
    return res.status(200).json({ 
      exists: true, 
      message: 'learning_outcome column exists'
    });
    
  } catch (err) {
    return res.status(500).json({ 
      exists: false, 
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
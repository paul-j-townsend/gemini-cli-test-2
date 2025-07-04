import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try inserting a minimal record to see what columns are required/available
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert([{}]) // Empty object to see what's required
      .select();

    return res.status(200).json({
      message: 'Insert test result',
      success: !error,
      error: error?.message,
      data
    });

  } catch (error) {
    console.error('Column check error:', error);
    return res.status(500).json({ 
      message: 'Column check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
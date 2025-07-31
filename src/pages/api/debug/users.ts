import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: users, error } = await supabaseAdmin
      .from('vsk_users')
      .select('id, email, name, role, status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ 
      error: 'Failed to get users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
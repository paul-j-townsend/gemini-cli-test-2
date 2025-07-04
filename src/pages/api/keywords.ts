import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('vsk_valid_keywords')
      .select('keyword')
      .order('keyword', { ascending: true });

    if (error) {
      console.error('Error fetching keywords:', error);
      return res.status(500).json({ message: 'Failed to fetch keywords', error: error.message });
    }

    const keywords = (data || []).map((row: { keyword: string }) => row.keyword);

    return res.status(200).json({ keywords });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get recent purchases
    const { data: purchases, error } = await supabaseAdmin
      .from('vsk_content_purchases')
      .select(`
        *,
        content:vsk_content(id, title),
        user:vsk_users(id, email, name)
      `)
      .order('purchased_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    // Get user ID from query if provided
    const { userId } = req.query;
    if (userId) {
      const { data: userPurchases, error: userError } = await supabaseAdmin
        .from('vsk_content_purchases')
        .select(`
          *,
          content:vsk_content(id, title)
        `)
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });

      if (userError) {
        throw userError;
      }

      return res.status(200).json({
        userPurchases,
        allRecentPurchases: purchases
      });
    }

    return res.status(200).json({ purchases });
  } catch (error) {
    console.error('Error getting purchases:', error);
    return res.status(500).json({ 
      error: 'Failed to get purchases',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
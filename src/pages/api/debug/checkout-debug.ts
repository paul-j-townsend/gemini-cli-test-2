import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentId, userId } = req.body;

    if (!contentId || !userId) {
      return res.status(400).json({ error: 'contentId and userId are required' });
    }

    // Check if content exists
    const { data: content, error: contentError } = await supabaseAdmin
      .from('vsk_content')
      .select('id, title, price_cents, stripe_price_id, is_purchasable')
      .eq('id', contentId)
      .single();

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('vsk_users')
      .select('id, email, name')
      .eq('id', userId)
      .single();

    // Check environment variables
    const stripeConfig = {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    };

    return res.status(200).json({
      content: {
        exists: !contentError,
        data: content,
        error: contentError?.message,
      },
      user: {
        exists: !userError,
        data: user,
        error: userError?.message,
      },
      stripe: stripeConfig,
    });

  } catch (error) {
    console.error('Debug checkout error:', error);
    return res.status(500).json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
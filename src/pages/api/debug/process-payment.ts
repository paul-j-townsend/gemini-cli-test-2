import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentId, userId, sessionId } = req.body;

    if (!contentId || !userId) {
      return res.status(400).json({ error: 'Missing contentId or userId' });
    }

    // Get content details for pricing
    const { data: content, error: contentError } = await supabaseAdmin
      .from('vsk_content')
      .select('id, title, price_cents')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Record the purchase manually
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('vsk_content_purchases')
      .insert({
        user_id: userId,
        content_id: contentId,
        stripe_checkout_session_id: sessionId || `debug_${Date.now()}`,
        stripe_payment_intent_id: `pi_debug_${Date.now()}`,
        amount_paid_cents: content.price_cents || 2999, // Default price
        currency: 'usd',
        status: 'completed',
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
      return res.status(500).json({ error: 'Failed to record purchase', details: purchaseError.message });
    }

    return res.status(200).json({ 
      success: true, 
      purchase,
      message: 'Payment manually processed successfully'
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({ 
      error: 'Failed to process payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
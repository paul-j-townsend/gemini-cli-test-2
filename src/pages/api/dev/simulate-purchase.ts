import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Development helper to simulate successful purchases
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, contentId } = req.body;

    if (!userId || !contentId) {
      return res.status(400).json({ error: 'User ID and Content ID are required' });
    }

    // Check if purchase already exists
    const { data: existingPurchase } = await supabaseAdmin
      .from('vsk_content_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (existingPurchase) {
      return res.status(200).json({ 
        success: true, 
        message: 'Purchase already exists',
        purchase: existingPurchase 
      });
    }

    // Get content price for the purchase record
    const { data: content } = await supabaseAdmin
      .from('vsk_content')
      .select('price_cents, special_offer_price_cents, special_offer_active, title')
      .eq('id', contentId)
      .single();

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Use special offer price if active, otherwise regular price
    const finalPrice = content.special_offer_active && content.special_offer_price_cents 
      ? content.special_offer_price_cents 
      : content.price_cents || 0;

    // Create simulated purchase record
    const { data: purchase, error } = await supabaseAdmin
      .from('vsk_content_purchases')
      .insert({
        user_id: userId,
        content_id: contentId,
        stripe_checkout_session_id: `dev_sim_${Date.now()}`,
        stripe_payment_intent_id: `pi_dev_sim_${Date.now()}`,
        amount_paid_cents: finalPrice,
        currency: 'gbp',
        status: 'completed',
        purchased_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating simulated purchase:', error);
      return res.status(500).json({ error: 'Failed to create purchase record' });
    }

    console.log(`🛒 Development: Simulated purchase created for user ${userId}, content: "${content.title}" (${contentId})`);

    res.status(200).json({
      success: true,
      message: 'Simulated purchase created',
      purchase: {
        id: purchase.id,
        contentId: purchase.content_id,
        amountPaid: purchase.amount_paid_cents,
        currency: purchase.currency,
        purchasedAt: purchase.purchased_at,
        status: purchase.status,
      },
    });

  } catch (error) {
    console.error('Error simulating purchase:', error);
    return res.status(500).json({ 
      error: 'Failed to simulate purchase',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
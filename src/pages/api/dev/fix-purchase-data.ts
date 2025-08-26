import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Development helper to fix purchase data integrity issues
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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`🔧 Development: Fixing purchase data integrity for user ${userId}`);

    // Get all content where user has downloaded certificates but no purchase record
    // First get progress records with certificates
    const { data: progressRecords } = await supabaseAdmin
      .from('vsk_user_content_progress')
      .select('content_id, certificate_downloaded')
      .eq('user_id', userId)
      .eq('certificate_downloaded', true);

    console.log(`📊 Found ${progressRecords?.length || 0} records with certificates downloaded`);

    if (!progressRecords || progressRecords.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No certificates found for user',
        created: []
      });
    }

    // Get content details for these records
    const contentIds = progressRecords.map(p => p.content_id);
    const { data: contentRecords } = await supabaseAdmin
      .from('vsk_content')
      .select('id, title, price_cents, special_offer_price_cents, special_offer_active, is_purchasable')
      .in('id', contentIds);

    if (!progressRecords || progressRecords.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No certificates found for user',
        created: []
      });
    }

    const createdPurchases = [];

    for (const progress of progressRecords) {
      const contentId = progress.content_id;
      const content = contentRecords?.find(c => c.id === contentId);

      // Skip if content not found
      if (!content) {
        console.log(`⏩ Content not found for ID: ${contentId}`);
        continue;
      }

      // Skip if not purchasable
      if (!content.is_purchasable) {
        console.log(`⏩ Skipping ${content.title} - not purchasable`);
        continue;
      }

      // Check if purchase already exists
      const { data: existingPurchase } = await supabaseAdmin
        .from('vsk_content_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      if (existingPurchase) {
        console.log(`⏩ Purchase already exists for: ${content.title}`);
        continue;
      }

      // Create purchase record
      const finalPrice = content.special_offer_active && content.special_offer_price_cents 
        ? content.special_offer_price_cents 
        : content.price_cents || 0;

      const { data: purchase, error } = await supabaseAdmin
        .from('vsk_content_purchases')
        .insert({
          user_id: userId,
          content_id: contentId,
          stripe_checkout_session_id: `dev_fix_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          stripe_payment_intent_id: `pi_dev_fix_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          amount_paid_cents: finalPrice,
          currency: 'gbp',
          status: 'completed',
          purchased_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating purchase for ${content.title}:`, error);
        continue;
      }

      console.log(`✅ Created purchase record for: ${content.title} (£${finalPrice/100})`);
      createdPurchases.push({
        contentId,
        title: content.title,
        amountPaid: finalPrice,
        purchaseId: purchase.id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Fixed purchase data integrity. Created ${createdPurchases.length} purchase records.`,
      created: createdPurchases,
    });

  } catch (error) {
    console.error('Error fixing purchase data:', error);
    return res.status(500).json({ 
      error: 'Failed to fix purchase data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
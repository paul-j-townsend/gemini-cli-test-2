import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '@/services/paymentService';
import { accessControlService } from '@/services/accessControlService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    console.log('User purchases API called for userId:', userId);

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's purchases
    const purchases = await paymentService.getUserPurchases(userId as string);

    // Get user's subscription
    const subscription = await paymentService.getUserSubscription(userId as string);

    // Get accessible content IDs
    const accessibleContentIds = await accessControlService.getUserAccessibleContent(userId as string);

    // Get payment summary
    const paymentSummary = await accessControlService.getUserPaymentSummary(userId as string);

    console.log('Purchase data for user:', {
      userId,
      purchasesCount: purchases.length,
      purchases: purchases.map(p => ({ contentId: p.content_id, status: p.status })),
      accessibleContentIds,
      paymentSummary
    });

    res.status(200).json({
      success: true,
      userId,
      purchases: purchases.map(purchase => ({
        id: purchase.id,
        contentId: purchase.content_id,
        amountPaid: purchase.amount_paid_cents,
        currency: purchase.currency,
        purchasedAt: purchase.purchased_at,
        status: purchase.status,
      })),
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      } : null,
      accessibleContentIds,
      summary: {
        totalPurchases: paymentSummary.totalPurchases,
        totalSpent: paymentSummary.totalSpent,
        hasActiveSubscription: paymentSummary.hasActiveSubscription,
        subscriptionStatus: paymentSummary.subscriptionStatus,
      },
    });

  } catch (error) {
    console.error('Error getting user purchases:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to get user purchases',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to get user purchases',
      details: 'Unknown error occurred'
    });
  }
}
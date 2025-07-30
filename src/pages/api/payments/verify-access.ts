import { NextApiRequest, NextApiResponse } from 'next';
import { accessControlService } from '@/services/accessControlService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, contentId, seriesId } = req.query;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!contentId && !seriesId) {
      return res.status(400).json({ 
        error: 'Either Content ID or Series ID is required' 
      });
    }

    let hasAccess = false;
    let accessType = '';

    if (contentId) {
      // Check content access
      hasAccess = await accessControlService.hasFullCPDAccess(
        userId as string, 
        contentId as string
      );
      accessType = 'content';
    } else if (seriesId) {
      // Check series access
      hasAccess = await accessControlService.hasSeriesAccess(
        userId as string, 
        seriesId as string
      );
      accessType = 'series';
    }

    // Get user's payment summary for additional context
    const paymentSummary = await accessControlService.getUserPaymentSummary(userId as string);

    res.status(200).json({
      success: true,
      hasAccess,
      accessType,
      userId,
      contentId: contentId || null,
      seriesId: seriesId || null,
      paymentSummary: {
        hasActiveSubscription: paymentSummary.hasActiveSubscription,
        subscriptionStatus: paymentSummary.subscriptionStatus,
        totalPurchases: paymentSummary.totalPurchases,
        purchasedContentIds: paymentSummary.purchasedContentIds,
      },
    });

  } catch (error) {
    console.error('Error verifying access:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to verify access',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to verify access',
      details: 'Unknown error occurred'
    });
  }
}
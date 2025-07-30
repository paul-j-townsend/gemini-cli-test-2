import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '@/services/paymentService';
import { accessControlService } from '@/services/accessControlService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      contentId, 
      userId, 
      type = 'content_purchase',  // 'content_purchase' or 'subscription'
      priceId,  // For subscriptions
      successUrl,
      cancelUrl 
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ 
        error: 'Success URL and Cancel URL are required' 
      });
    }

    let session;

    if (type === 'content_purchase') {
      if (!contentId) {
        return res.status(400).json({ error: 'Content ID is required for content purchase' });
      }

      // Check if user already has access to this content
      const hasAccess = await accessControlService.hasFullCPDAccess(userId, contentId);
      if (hasAccess) {
        return res.status(400).json({ 
          error: 'User already has access to this content' 
        });
      }

      // Create checkout session for content purchase
      session = await paymentService.createCheckoutSession(
        contentId,
        userId,
        successUrl,
        cancelUrl
      );

    } else if (type === 'subscription') {
      if (!priceId) {
        return res.status(400).json({ error: 'Price ID is required for subscription' });
      }

      // Check if user already has active subscription
      const hasSubscription = await accessControlService.hasActiveSubscription(userId);
      if (hasSubscription) {
        return res.status(400).json({ 
          error: 'User already has an active subscription' 
        });
      }

      // Create checkout session for subscription
      session = await paymentService.createSubscriptionCheckout(
        userId,
        priceId,
        successUrl,
        cancelUrl
      );

    } else {
      return res.status(400).json({ 
        error: 'Invalid checkout type. Must be "content_purchase" or "subscription"' 
      });
    }

    // Return the checkout session
    res.status(200).json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      session: {
        id: session.id,
        url: session.url,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
      }
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to create checkout session',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: 'Unknown error occurred'
    });
  }
}
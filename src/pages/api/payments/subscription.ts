import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '@/services/paymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    switch (req.method) {
      case 'GET': {
        // Get user's subscription details
        const subscription = await paymentService.getUserSubscription(userId as string);

        if (!subscription) {
          return res.status(404).json({ 
            error: 'No active subscription found',
            subscription: null 
          });
        }

        res.status(200).json({
          success: true,
          subscription: {
            id: subscription.id,
            stripeSubscriptionId: subscription.stripe_subscription_id,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at,
            trialStart: subscription.trial_start,
            trialEnd: subscription.trial_end,
          },
        });
        break;
      }

      case 'POST': {
        // Cancel subscription
        const { action } = req.body;

        if (action !== 'cancel') {
          return res.status(400).json({ 
            error: 'Invalid action. Only "cancel" is supported.' 
          });
        }

        // Get user's subscription
        const subscription = await paymentService.getUserSubscription(userId as string);
        
        if (!subscription) {
          return res.status(404).json({ 
            error: 'No active subscription found to cancel' 
          });
        }

        if (subscription.status !== 'active' && subscription.status !== 'trialing') {
          return res.status(400).json({ 
            error: 'Subscription is not active and cannot be canceled' 
          });
        }

        // Cancel the subscription (at period end)
        await paymentService.cancelSubscription(subscription.stripe_subscription_id);

        res.status(200).json({
          success: true,
          message: 'Subscription will be canceled at the end of the current billing period',
          subscriptionId: subscription.id,
        });
        break;
      }

      default: {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
      }
    }

  } catch (error) {
    console.error('Error managing subscription:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to manage subscription',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to manage subscription',
      details: 'Unknown error occurred'
    });
  }
}
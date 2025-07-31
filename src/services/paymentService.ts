import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ContentPurchase, Subscription, Content } from '@/types/database';
import Stripe from 'stripe';

export class PaymentService {
  
  // Create Stripe checkout session for content purchase
  async createCheckoutSession(
    contentId: string, 
    userId: string, 
    successUrl: string, 
    cancelUrl: string,
    priceCents?: number
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Get content details
      const { data: content, error: contentError } = await supabaseAdmin
        .from('vsk_content')
        .select('id, title, price_cents, stripe_price_id, is_purchasable')
        .eq('id', contentId)
        .single();

      if (contentError || !content) {
        throw new Error(`Content not found: ${contentError?.message || 'Content does not exist'}`);
      }

      if (!content.is_purchasable) {
        throw new Error('Content is not available for purchase');
      }

      // Use passed price if provided, otherwise use content price
      const finalPrice = priceCents || content.price_cents;
      
      if (!finalPrice || finalPrice <= 0) {
        throw new Error('Content price not set or invalid');
      }

      // Get or create Stripe customer
      const customer = await this.getOrCreateStripeCustomer(userId);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `CPD Access: ${content.title}`,
                description: 'Full access to podcast, quiz, report, and certificate',
              },
              unit_amount: finalPrice,
            },
            quantity: 1,
          },
        ],
        metadata: {
          content_id: contentId,
          user_id: userId,
          type: 'content_purchase',
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  // Create subscription checkout session
  async createSubscriptionCheckout(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Get or create Stripe customer
      const customer = await this.getOrCreateStripeCustomer(userId);

      // Create checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          user_id: userId,
          type: 'subscription',
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        subscription_data: {
          trial_period_days: 7, // Optional: 7-day free trial
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      throw new Error('Failed to create subscription checkout');
    }
  }

  // Get or create Stripe customer for user
  private async getOrCreateStripeCustomer(userId: string): Promise<Stripe.Customer> {
    try {
      // Get user details
      const { data: user, error: userError } = await supabaseAdmin
        .from('vsk_users')
        .select('id, email, name')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Check if customer already exists in Stripe
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          user_id: userId,
        },
      });

      return customer;
    } catch (error) {
      console.error('Error getting/creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Process successful payment from webhook
  async processPaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const { content_id, user_id, type } = session.metadata || {};

      if (!content_id || !user_id) {
        throw new Error('Missing metadata in session');
      }

      if (type === 'content_purchase') {
        // Record content purchase
        const { error } = await supabaseAdmin
          .from('vsk_content_purchases')
          .insert({
            user_id,
            content_id,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid_cents: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'completed',
          });

        if (error) {
          console.error('Error recording purchase:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error processing payment success:', error);
      throw error;
    }
  }

  // Process subscription events from webhook
  async processSubscriptionEvent(
    subscription: Stripe.Subscription, 
    eventType: string
  ): Promise<void> {
    try {
      const userId = subscription.metadata?.user_id;
      if (!userId) {
        throw new Error('Missing user_id in subscription metadata');
      }

      const subscriptionData = {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        status: subscription.status as any,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      };

      // Upsert subscription record
      const { error } = await supabaseAdmin
        .from('vsk_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'stripe_subscription_id',
        });

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error processing subscription event:', error);
      throw error;
    }
  }

  // Get user's purchases
  async getUserPurchases(userId: string): Promise<ContentPurchase[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vsk_content_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('purchased_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user purchases:', error);
      return [];
    }
  }

  // Get user's active subscription
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vsk_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No subscription found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Process refund
  async processRefund(paymentIntentId: string, reason?: string): Promise<void> {
    try {
      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
      });

      // Update purchase record
      const { error } = await supabaseAdmin
        .from('vsk_content_purchases')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_reason: reason || 'Customer request',
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (error) {
        console.error('Error updating refund status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }
}

export const paymentService = new PaymentService();
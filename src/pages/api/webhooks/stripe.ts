import { NextApiRequest, NextApiResponse } from 'next';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { paymentService } from '@/services/paymentService';
import Stripe from 'stripe';

// Disable Next.js body parsing for webhook endpoints
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body from request
const getRawBody = (req: NextApiRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event: Stripe.Event;

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      console.error('Missing Stripe signature');
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    if (!STRIPE_CONFIG.webhookSecret) {
      console.error('Missing webhook secret');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_CONFIG.webhookSecret
    );

    console.log(`Received Stripe webhook: ${event.type}`);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).json({ 
      error: 'Webhook signature verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout session completed:', session.id);
        
        // Process the completed payment
        await paymentService.processPaymentSuccess(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing subscription ${event.type}:`, subscription.id);
        
        // Process subscription event
        await paymentService.processSubscriptionEvent(subscription, event.type);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Processing invoice payment succeeded:', invoice.id);
        
        // For subscription renewals, we might want to update subscription status
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await paymentService.processSubscriptionEvent(subscription, 'subscription.renewed');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Processing invoice payment failed:', invoice.id);
        
        // Handle failed subscription payments
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await paymentService.processSubscriptionEvent(subscription, 'subscription.payment_failed');
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Processing payment intent succeeded:', paymentIntent.id);
        
        // This is handled by checkout.session.completed, but we log it for completeness
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Processing payment intent failed:', paymentIntent.id);
        
        // Could update payment status to failed if needed
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log('Processing charge dispute created:', dispute.id);
        
        // Could mark purchase as disputed
        // await paymentService.handleDispute(dispute);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
        break;
    }

    // Return success response
    res.status(200).json({ 
      received: true, 
      eventType: event.type,
      eventId: event.id 
    });

  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    
    // Return error response
    res.status(500).json({ 
      error: 'Webhook processing failed',
      eventType: event.type,
      eventId: event.id,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    // Store in Supabase (you can create a subscribers table)
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .insert([
        { 
          email, 
          subscribed_at: new Date().toISOString(),
          source: 'website',
          status: 'pending'
        }
      ]);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Failed to subscribe' });
    }

    // Optional: Integrate with email service (Mailchimp, ConvertKit, etc.)
    // For now, we'll just store in database
    
    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

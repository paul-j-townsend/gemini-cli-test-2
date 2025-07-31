import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, email, name, role = 'user', status = 'active', auth_provider = 'google' } = req.body;

    if (!id || !email || !name) {
      return res.status(400).json({ error: 'id, email, and name are required' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('vsk_users')
      .insert({
        id,
        email,
        name,
        role,
        status,
        email_verified: true,
        auth_provider: auth_provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({ 
      success: true, 
      user,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error',
      fullError: error
    });
  }
}
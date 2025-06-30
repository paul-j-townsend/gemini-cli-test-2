import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test if we can list buckets
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketError) {
      return res.status(500).json({ 
        message: 'Failed to list buckets', 
        error: bucketError.message 
      });
    }

    // Test if we can list files in audio bucket
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from('audio')
      .list('', { limit: 10 });

    return res.status(200).json({ 
      buckets: buckets.map(b => ({ id: b.id, name: b.name, public: b.public })),
      audioFiles: files || [],
      filesError: filesError?.message || null
    });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
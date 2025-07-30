import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing Supabase admin connection...');
    
    // Test bucket listing
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    console.log('Buckets:', buckets, 'Error:', bucketsError);

    if (bucketsError) {
      return res.status(500).json({ 
        error: 'Failed to list buckets', 
        details: bucketsError.message 
      });
    }

    // Test if we can access the audio bucket
    const { data: audioFiles, error: audioError } = await supabaseAdmin.storage
      .from('audio')
      .list('episodes', { limit: 1 });
    
    console.log('Audio files:', audioFiles, 'Error:', audioError);

    return res.status(200).json({
      success: true,
      buckets: buckets?.map(b => b.name),
      audioAccessible: !audioError,
      audioError: audioError?.message
    });

  } catch (error) {
    console.error('Storage test error:', error);
    return res.status(500).json({ 
      error: 'Storage test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
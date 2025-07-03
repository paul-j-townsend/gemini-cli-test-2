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
    const { data: audioFiles, error: audioError } = await supabaseAdmin.storage
      .from('audio')
      .list('', { limit: 10 });

    // Test if we can list files in images bucket
    const { data: imageFiles, error: imageError } = await supabaseAdmin.storage
      .from('images')
      .list('', { limit: 10 });

    // Test podcast-thumbnails folder specifically
    const { data: thumbnailFiles, error: thumbnailError } = await supabaseAdmin.storage
      .from('images')
      .list('podcast-thumbnails', { limit: 10 });

    return res.status(200).json({ 
      buckets: buckets.map(b => ({ id: b.id, name: b.name, public: b.public })),
      audioFiles: audioFiles || [],
      imageFiles: imageFiles || [],
      thumbnailFiles: thumbnailFiles || [],
      errors: {
        audio: audioError?.message || null,
        images: imageError?.message || null,
        thumbnails: thumbnailError?.message || null
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
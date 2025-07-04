import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // List all files in the audio bucket podcasts folder
    const { data, error } = await supabaseAdmin.storage
      .from('audio')
      .list('podcasts', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error fetching audio files:', error);
      return res.status(500).json({ message: 'Failed to fetch audio files', error: error.message });
    }



    // Filter out folders and get only audio files (files have both name AND id, folders only have name)
    const audioFilesData = data.filter(item => 
      item.name && 
      item.id && 
      item.name.match(/\.(mp3|wav|ogg|aac|m4a)$/i)
    );
    
    // Get public URLs for all files
    const audioFiles = audioFilesData.map(file => {
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('audio')
        .getPublicUrl(`podcasts/${file.name}`);
      
      // Create a display name from the filename
      const displayName = file.name
        .replace(/^\d{4}-\d{2}-\d{2}_/, '') // Remove date prefix
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Title case
      
      return {
        name: file.name,
        displayName,
        url: publicUrl,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at
      };
    });

    return res.status(200).json({ files: audioFiles });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
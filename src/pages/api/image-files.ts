import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // List all files in the images bucket podcast-thumbnails folder
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .list('podcast-thumbnails', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error fetching image files:', error);
      return res.status(500).json({ message: 'Failed to fetch image files', error: error.message });
    }



    // Filter out folders and get only image files
    const imageFilesData = data.filter(item => 
      item.name && 
      item.id && 
      item.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    
    // Get public URLs for all files
    const imageFiles = imageFilesData.map(file => {
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(`podcast-thumbnails/${file.name}`);
      
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
        path: `podcast-thumbnails/${file.name}`, // Full path for storage
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at
      };
    });

    return res.status(200).json({ files: imageFiles });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // List all files from both folders
    const [podcastThumbnails, articleImages] = await Promise.all([
      supabaseAdmin.storage
        .from('images')
        .list('podcast-thumbnails', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        }),
      supabaseAdmin.storage
        .from('images')
        .list('article-images', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })
    ]);

    if (podcastThumbnails.error && articleImages.error) {
      console.error('Error fetching image files:', podcastThumbnails.error, articleImages.error);
      return res.status(500).json({ message: 'Failed to fetch image files' });
    }

    // Combine files from both folders
    const allFiles = [
      ...(podcastThumbnails.data || []).map(file => ({ ...file, folder: 'podcast-thumbnails' })),
      ...(articleImages.data || []).map(file => ({ ...file, folder: 'article-images' }))
    ];

    // Filter out folders and get only image files
    const imageFilesData = allFiles.filter(item => 
      item.name && 
      item.id && 
      item.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    
    // Get public URLs for all files
    const imageFiles = imageFilesData.map(file => {
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(`${file.folder}/${file.name}`);
      
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
        path: `${file.folder}/${file.name}`, // Full path for storage
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at,
        folder: file.folder
      };
    });

    // Sort by creation date (newest first)
    imageFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.status(200).json({ files: imageFiles });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
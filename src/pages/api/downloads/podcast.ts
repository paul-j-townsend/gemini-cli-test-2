import { NextApiRequest, NextApiResponse } from 'next';
import { accessControlService } from '@/services/accessControlService';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, contentId } = req.query;

    if (!userId || !contentId) {
      return res.status(400).json({ error: 'User ID and Content ID are required' });
    }

    // Verify user has access to this content
    const hasAccess = await accessControlService.hasFullCPDAccess(userId as string, contentId as string);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. You must purchase this content first.' });
    }

    // Get the content details to find the audio file path
    const { data: contentData, error: contentError } = await supabase
      .from('vsk_content')
      .select('title, audio_file_path')
      .eq('id', contentId)
      .single();

    if (contentError || !contentData) {
      console.error('Error fetching content:', contentError);
      return res.status(404).json({ error: 'Content not found' });
    }

    if (!contentData.audio_file_path) {
      return res.status(404).json({ error: 'Audio file not available for this content' });
    }

    // Create signed URL for the audio file
    const { data, error } = supabase.storage
      .from('audio')
      .createSignedUrl(contentData.audio_file_path, 3600); // URL valid for 1 hour

    if (error) {
      console.error('Error creating signed URL for audio:', error);
      return res.status(404).json({ error: 'Audio file not found' });
    }

    // Clean filename for download
    const cleanTitle = contentData.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
    const fileExtension = contentData.audio_file_path.split('.').pop() || 'mp3';
    const filename = `${cleanTitle}.${fileExtension}`;

    // Return the signed URL for download
    res.status(200).json({
      success: true,
      downloadUrl: data.signedUrl,
      filename: filename,
      title: contentData.title
    });

  } catch (error) {
    console.error('Error in podcast download:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to generate download link',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate download link',
      details: 'Unknown error occurred'
    });
  }
}
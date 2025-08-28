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

    // Get the report file URL from Supabase storage
    // Assuming reports are stored in a 'reports' bucket with filename pattern: {contentId}-report.pdf
    const { data, error } = supabase.storage
      .from('reports')
      .createSignedUrl(`${contentId}-report.pdf`, 3600); // URL valid for 1 hour

    if (error) {
      console.error('Error creating signed URL:', error);
      return res.status(404).json({ error: 'Learning report not found' });
    }

    // Update user progress to mark report as downloaded
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-content-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        contentId,
        action: 'report_downloaded'
      }),
    });

    // Return the signed URL for download
    res.status(200).json({
      success: true,
      downloadUrl: data.signedUrl,
      filename: `learning-report-${contentId}.pdf`
    });

  } catch (error) {
    console.error('Error in learning report download:', error);
    
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
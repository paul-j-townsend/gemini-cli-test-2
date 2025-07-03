import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Image upload handler called:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting image file processing...');
    
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: ({ mimetype }) => {
        return mimetype?.startsWith('image/') || false;
      },
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Generate clean filename
    const fileExt = file.originalFilename?.split('.').pop() || 'jpg';
    const originalName = file.originalFilename?.replace(/\.[^/.]+$/, "") || 'thumbnail';
    const cleanName = originalName.replace(/[^a-zA-Z0-9\-_\s]/g, '').replace(/\s+/g, '_').toLowerCase();
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const fileName = `${timestamp}_${cleanName}.${fileExt}`;
    const filePath = `podcast-thumbnails/${fileName}`; // Upload to podcast-thumbnails subfolder

    // Read file data
    const fileData = fs.readFileSync(file.filepath);

    // Upload to Supabase storage (images bucket, podcast-thumbnails folder)
    console.log('Attempting to upload image:', filePath, 'Size:', fileData.length);
    
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(filePath, fileData, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.mimetype || 'image/jpeg',
      });

    if (error) {
      console.error('Storage upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        message: 'Failed to upload file', 
        error: error.message,
        details: error
      });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(filePath);

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({ 
      path: filePath,
      filename: fileName,
      url: publicUrl // Keep for preview purposes
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: 'Failed to upload file', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
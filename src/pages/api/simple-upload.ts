import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Simple upload API called');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    console.log('Parsing form...');
    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!type || !['image', 'audio'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file type specified' });
    }

    // Read file
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = file.originalFilename || 'file';
    const timestamp = Date.now();
    const fileExtension = path.extname(fileName);
    const sanitizedFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    
    // Determine storage bucket and path
    const bucket = type === 'image' ? 'images' : 'audio';
    const storageKey = `${type === 'image' ? 'thumbnails' : 'episodes'}/${sanitizedFileName}`;
    
    console.log(`Uploading to bucket: ${bucket}, key: ${storageKey}, size: ${fileBuffer.length}`);
    
    // Try direct upload without listing buckets first
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storageKey, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: true // Allow overwrite to avoid conflicts
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ 
        error: 'Failed to upload file', 
        supabaseError: error.message 
      });
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(storageKey);

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      data: {
        url: publicUrlData.publicUrl,
        path: storageKey,
        filename: sanitizedFileName,
        type: file.mimetype,
        size: file.size
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
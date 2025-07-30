import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Test upload API called');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    console.log('Parsing form data...');
    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
    
    console.log('File received:', {
      originalFilename: file?.originalFilename,
      size: file?.size,
      mimetype: file?.mimetype,
      type: type
    });

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Just save to local public directory for testing
    const publicDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalFilename}`;
    const filePath = path.join(publicDir, fileName);
    
    // Copy file from temp to public directory
    fs.copyFileSync(file.filepath, filePath);
    
    // Clean up temp file
    fs.unlinkSync(file.filepath);

    const publicUrl = `/uploads/${fileName}`;

    return res.status(200).json({
      success: true,
      data: {
        url: publicUrl,
        filename: fileName,
        type: file.mimetype,
        size: file.size
      }
    });

  } catch (error) {
    console.error('Upload test error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
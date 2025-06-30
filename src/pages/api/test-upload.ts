import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Test upload endpoint hit!');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Just return success without processing
    return res.status(200).json({ 
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ 
      message: 'Test failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
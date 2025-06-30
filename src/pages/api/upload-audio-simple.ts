import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 SIMPLE UPLOAD HANDLER CALLED!', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return res.status(200).json({ message: 'Simple handler working!' });
}
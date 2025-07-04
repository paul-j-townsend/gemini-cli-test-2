import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Valid quiz question ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getQuizQuestion(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getQuizQuestion(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { data: question, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quiz question:', error);
    if (error.code === 'PGRST116') {
      return res.status(404).json({ message: 'Quiz question not found' });
    }
    return res.status(500).json({ message: 'Failed to fetch quiz question' });
  }

  return res.status(200).json(question);
} 
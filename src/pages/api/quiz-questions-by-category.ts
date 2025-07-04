import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        learning_outcome,
        rationale,
        category,
        difficulty,
        mcq_answers (
          id,
          answer_text,
          is_correct
        )
      `)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ message: 'Failed to fetch questions' });
    }

    const categorizedQuestions = (questions || []).reduce((acc: any, question: any) => {
      const category = question.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(question);
      return acc;
    }, {});

    const categories = Object.entries(categorizedQuestions).map(([name, questions]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
      questions,
    }));

    return res.status(200).json({ categories });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 
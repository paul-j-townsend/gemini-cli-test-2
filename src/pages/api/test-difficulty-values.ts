import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const difficulties = ['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced'];
  const results: any = {};

  for (const difficulty of difficulties) {
    try {
      const { data, error } = await supabaseAdmin
        .from('quizzes')
        .insert([{
          title: `Test ${difficulty}`,
          description: 'Test',
          difficulty: difficulty,
          total_questions: 0,
          pass_percentage: 70
        }])
        .select();

      if (error) {
        results[difficulty] = { works: false, error: error.message };
      } else {
        results[difficulty] = { works: true };
        // Clean up
        if (data && data[0]) {
          await supabaseAdmin.from('quizzes').delete().eq('id', data[0].id);
        }
      }
    } catch (err) {
      results[difficulty] = { works: false, error: `Exception: ${err}` };
    }
  }

  return res.status(200).json({
    message: 'Difficulty values test complete',
    results,
    workingValues: Object.keys(results).filter(key => results[key].works)
  });
}
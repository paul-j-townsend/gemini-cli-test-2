import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const log: string[] = [];

    // Try inserting with just the most basic fields one by one to discover the schema
    const quizId = '9efe4f6c-8ec5-4845-a7c5-90d472426fe0';

    const basicFields = [
      { id: 'test-1' },
      { quiz_id: quizId },
      { title: 'Test' },
      { question_text: 'Test?' },
      { options: [] },
      { answer: 'A' },
      { correct_option: 'A' },
      { explanation: 'Test explanation' }
    ];

    for (const field of basicFields) {
      try {
        const { data, error } = await supabaseAdmin
          .from('quiz_questions')
          .insert([field])
          .select();

        if (error) {
          log.push(`Field ${JSON.stringify(field)} failed: ${error.message}`);
        } else {
          log.push(`Field ${JSON.stringify(field)} succeeded!`);
          log.push(`Created: ${JSON.stringify(data)}`);
          
          // Clean up - delete the test record
          if (data && data[0]) {
            await supabaseAdmin
              .from('quiz_questions')
              .delete()
              .eq('id', data[0].id);
          }
          break; // Found a working field combination
        }
      } catch (err) {
        log.push(`Field ${JSON.stringify(field)} exception: ${err}`);
      }
    }

    // Try combinations
    const combinations = [
      { quiz_id: quizId, title: 'Test' },
      { quiz_id: quizId, question_text: 'Test?' },
      { quiz_id: quizId, title: 'Test', question_text: 'Test?' },
    ];

    for (const combo of combinations) {
      try {
        const { data, error } = await supabaseAdmin
          .from('quiz_questions')
          .insert([combo])
          .select();

        if (error) {
          log.push(`Combo ${JSON.stringify(combo)} failed: ${error.message}`);
        } else {
          log.push(`Combo ${JSON.stringify(combo)} succeeded!`);
          log.push(`Created: ${JSON.stringify(data)}`);
          
          // Clean up
          if (data && data[0]) {
            await supabaseAdmin
              .from('quiz_questions')
              .delete()
              .eq('id', data[0].id);
          }
          break;
        }
      } catch (err) {
        log.push(`Combo ${JSON.stringify(combo)} exception: ${err}`);
      }
    }

    return res.status(200).json({
      message: 'Schema discovery complete',
      log
    });

  } catch (error) {
    console.error('Schema discovery error:', error);
    return res.status(500).json({ 
      message: 'Schema discovery failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
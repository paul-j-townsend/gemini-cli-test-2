import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Inserting quiz answers...');

    // Insert answers for Animal Anatomy questions
    const anatomyAnswers = [
      // Question 1: Heart chamber
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111111', answer_letter: 'A', answer_text: 'Left atrium', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111111', answer_letter: 'B', answer_text: 'Right atrium', is_correct: true },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111111', answer_letter: 'C', answer_text: 'Left ventricle', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111111', answer_letter: 'D', answer_text: 'Right ventricle', is_correct: false },
      
      // Question 2: Small intestine function
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111113', answer_letter: 'A', answer_text: 'Protein synthesis', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111113', answer_letter: 'B', answer_text: 'Nutrient absorption', is_correct: true },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111113', answer_letter: 'C', answer_text: 'Waste elimination', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111113', answer_letter: 'D', answer_text: 'Blood filtration', is_correct: false },
      
      // Question 3: Heart muscle type
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111115', answer_letter: 'A', answer_text: 'Skeletal muscle', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111115', answer_letter: 'B', answer_text: 'Smooth muscle', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111115', answer_letter: 'C', answer_text: 'Cardiac muscle', is_correct: true },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111115', answer_letter: 'D', answer_text: 'Nervous tissue', is_correct: false },
      
      // Question 4: Respiratory rate
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111117', answer_letter: 'A', answer_text: '5-10 breaths per minute', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111117', answer_letter: 'B', answer_text: '10-30 breaths per minute', is_correct: true },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111117', answer_letter: 'C', answer_text: '30-50 breaths per minute', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111117', answer_letter: 'D', answer_text: '50-80 breaths per minute', is_correct: false },
      
      // Question 5: Insulin production
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111119', answer_letter: 'A', answer_text: 'Liver', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111119', answer_letter: 'B', answer_text: 'Kidney', is_correct: false },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111119', answer_letter: 'C', answer_text: 'Pancreas', is_correct: true },
      { question_id: 'a1b2c3d4-e5f6-1890-abcd-111111111119', answer_letter: 'D', answer_text: 'Spleen', is_correct: false }
    ];

    // Insert anatomy answers only (fundamentals already has answers)
    const { error: anatomyError } = await supabaseAdmin
      .from('vsk_question_answers')
      .upsert(anatomyAnswers, { onConflict: 'question_id,answer_letter' });

    if (anatomyError) throw anatomyError;

    // Verify answer insertion
    const { count: answerCount } = await supabaseAdmin
      .from('vsk_question_answers')
      .select('*', { count: 'exact', head: true });

    console.log(`Inserted ${answerCount} answers successfully`);

    return res.status(200).json({
      success: true,
      message: 'Quiz answers inserted successfully',
      answerCount
    });

  } catch (error) {
    console.error('Answer insertion failed:', error);
    return res.status(500).json({
      error: 'Answer insertion failed',
      details: error
    });
  }
}
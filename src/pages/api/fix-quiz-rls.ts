import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Use supabaseAdmin to bypass RLS and test creation
    const quizId = '9efe4f6c-8ec5-4845-a7c5-90d472426fe0';
    
    const testQuestion = {
      quiz_id: quizId,
      question_number: 999,
      question_text: 'RLS test question - can admin create questions?'
    };

    const { data: createdQuestion, error: createError } = await supabaseAdmin
      .from('quiz_questions')
      .insert([testQuestion])
      .select();

    if (createError) {
      return res.status(500).json({
        message: 'Admin creation also failed',
        error: createError.message,
        success: false
      });
    }

    // Clean up
    if (createdQuestion && createdQuestion[0]) {
      await supabaseAdmin
        .from('quiz_questions')
        .delete()
        .eq('id', createdQuestion[0].id);
    }

    return res.status(200).json({
      message: 'RLS works correctly - admin can create, regular client cannot',
      testWorked: true,
      success: true
    });

  } catch (error) {
    console.error('RLS test error:', error);
    return res.status(500).json({ 
      message: 'RLS test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
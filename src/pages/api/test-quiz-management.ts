import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test the exact query that QuizManagement component uses
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        category,
        difficulty,
        total_questions,
        pass_percentage,
        created_at,
        quiz_questions (
          id,
          question_number,
          question_text
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({
        message: 'QuizManagement query failed',
        error: error.message,
        success: false
      });
    }

    // Test creating a new question
    if (data && data.length > 0) {
      const quizId = data[0].id;
      const testQuestion = {
        quiz_id: quizId,
        question_number: 99,
        question_text: 'Test question for verification?'
      };

      const { data: createdQuestion, error: createError } = await supabase
        .from('quiz_questions')
        .insert([testQuestion])
        .select();

      if (createError) {
        return res.status(500).json({
          message: 'Question creation failed',
          error: createError.message,
          queryData: data,
          success: false
        });
      }

      // Clean up test question
      if (createdQuestion && createdQuestion[0]) {
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('id', createdQuestion[0].id);
      }

      return res.status(200).json({
        message: 'QuizManagement verification successful',
        quizzes: data,
        testQuestionCreated: true,
        success: true
      });
    }

    return res.status(200).json({
      message: 'No quizzes found but query worked',
      quizzes: data,
      success: true
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ 
      message: 'Verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test the quiz_questions relationship
    const { data: quizTest, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        quiz_questions (
          id,
          question,
          options
        )
      `)
      .limit(1);

    if (quizError) {
      return res.status(500).json({
        message: 'Quiz relationship test failed',
        error: quizError.message,
        success: false
      });
    }

    // If that works, let's add a test question to see if we can create the relationship
    const quizId = quizTest?.[0]?.id;
    if (quizId) {
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .insert([{
          quiz_id: quizId,
          title: 'Test Question',
          question: 'This is a test question?',
          options: [
            {"label": "A", "text": "Option A"},
            {"label": "B", "text": "Option B"},
            {"label": "C", "text": "Option C"},
            {"label": "D", "text": "Option D"}
          ],
          correct_answer_label: 'A',
          correct_answer_text: 'Option A',
          learning_outcome: 'Test learning outcome',
          rationale: 'Test rationale'
        }])
        .select();

      if (questionError) {
        return res.status(500).json({
          message: 'Failed to create test question',
          error: questionError.message,
          quizData: quizTest
        });
      }

      // Now test the relationship again
      const { data: finalTest, error: finalError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          quiz_questions (
            id,
            question,
            options,
            correct_answer_label
          )
        `)
        .eq('id', quizId)
        .single();

      return res.status(200).json({
        message: 'Test completed successfully',
        quizWithQuestions: finalTest,
        createdQuestion: questionData,
        success: true
      });
    }

    return res.status(200).json({
      message: 'Quiz found but no questions',
      quizData: quizTest,
      success: true
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ 
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
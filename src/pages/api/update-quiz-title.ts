import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const quizId = '550e8400-e29b-41d4-a716-446655440002';
    
    // Update the quiz title and description
    const { data: updatedQuiz, error: updateError } = await supabaseAdmin
      .from('quizzes')
      .update({
        title: 'Veterinary Ethics Fundamentals',
        description: 'Test your knowledge of core ethical principles in veterinary practice',
        category: 'Ethics',
        total_questions: 2
      })
      .eq('id', quizId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ 
        message: 'Failed to update quiz',
        error: updateError 
      });
    }

    // Clean up any empty questions (questions with empty question_text)
    const { data: allQuestions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, question_text, question_number')
      .eq('quiz_id', quizId);

    if (questionsError) {
      return res.status(500).json({ 
        message: 'Failed to fetch questions',
        error: questionsError 
      });
    }

    // Delete questions with empty text
    const emptyQuestions = allQuestions?.filter(q => !q.question_text || q.question_text.trim() === '') || [];
    
    if (emptyQuestions.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('quiz_questions')
        .delete()
        .in('id', emptyQuestions.map(q => q.id));

      if (deleteError) {
        console.error('Error deleting empty questions:', deleteError);
      }
    }

    // Get the remaining questions and verify they have answers
    const { data: finalQuestions, error: finalError } = await supabaseAdmin
      .from('quiz_questions')
      .select(`
        id,
        question_text,
        question_number,
        question_answers (
          id,
          answer_text,
          is_correct
        )
      `)
      .eq('quiz_id', quizId)
      .order('question_number');

    if (finalError) {
      return res.status(500).json({ 
        message: 'Failed to verify questions',
        error: finalError 
      });
    }

    return res.status(200).json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz,
      questionsDeleted: emptyQuestions.length,
      finalQuestions: finalQuestions?.map(q => ({
        id: q.id,
        text: q.question_text,
        answerCount: q.question_answers?.length || 0
      }))
    });

  } catch (error) {
    console.error('Update quiz error:', error);
    return res.status(500).json({ 
      message: 'Failed to update quiz',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const log: string[] = [];

    // Step 1: Try to create a quiz first
    log.push('Step 1: Creating quiz...');
    const { data: newQuiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .insert([{
        title: 'Debug Test Quiz',
        description: 'Test quiz for debugging',
        category: 'test',
        difficulty: 'beginner',  // Try the value that worked before
        total_questions: 1,
        pass_percentage: 70
      }])
      .select()
      .single();

    if (quizError) {
      log.push(`Quiz creation failed: ${quizError.message}`);
      return res.status(500).json({ 
        message: 'Quiz creation failed',
        error: quizError.message,
        log 
      });
    }

    log.push(`Quiz created successfully: ${newQuiz.id}`);

    // Step 2: Try to create a question
    log.push('Step 2: Creating question...');
    const { data: newQuestion, error: questionError } = await supabaseAdmin
      .from('quiz_questions')
      .insert([{
        quiz_id: newQuiz.id,
        question_number: 1,
        question_text: 'What is this test question?'
      }])
      .select();

    if (questionError) {
      log.push(`Question creation failed: ${questionError.message}`);
      
      // Clean up quiz
      await supabaseAdmin.from('quizzes').delete().eq('id', newQuiz.id);
      
      return res.status(500).json({ 
        message: 'Question creation failed',
        error: questionError.message,
        log 
      });
    }

    log.push(`Question created successfully: ${JSON.stringify(newQuestion)}`);

    // Step 3: Test the relationship query
    log.push('Step 3: Testing relationship query...');
    const { data: quizWithQuestions, error: relationshipError } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id,
        title,
        quiz_questions (
          id,
          question_number,
          question_text
        )
      `)
      .eq('id', newQuiz.id)
      .single();

    if (relationshipError) {
      log.push(`Relationship query failed: ${relationshipError.message}`);
    } else {
      log.push(`Relationship query successful: ${JSON.stringify(quizWithQuestions)}`);
    }

    // Clean up
    await supabaseAdmin.from('quizzes').delete().eq('id', newQuiz.id);
    log.push('Cleanup completed');

    return res.status(200).json({
      message: 'Debug test completed successfully',
      log,
      success: true
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ 
      message: 'Debug test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
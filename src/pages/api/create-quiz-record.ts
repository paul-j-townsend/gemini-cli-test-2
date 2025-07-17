import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('=== CREATING QUIZ RECORD TO SATISFY FOREIGN KEY ===');
    
    const quizId = '022b3131-5889-4496-85ee-df43059f5461';
    
    // Step 1: Check if quiz record already exists
    const { data: existingQuiz, error: checkError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
    
    console.log('Existing quiz check:', { data: existingQuiz, error: checkError });
    
    if (existingQuiz) {
      console.log('Quiz record already exists');
      return res.status(200).json({
        message: 'Quiz record already exists',
        quiz: existingQuiz
      });
    }
    
    // Step 2: Create a quiz record to satisfy the foreign key constraint
    // Use minimal fields that we know exist: id, title, description
    const quizRecord = {
      id: quizId, // This is already a UUID format
      title: 'Podcast Quiz - Auto Generated',
      description: 'Quiz for podcast episode - auto-generated to satisfy foreign key constraint'
    };
    
    console.log('Creating quiz record:', quizRecord);
    
    const { data: createdQuiz, error: createError } = await supabaseAdmin
      .from('vsk_quizzes')
      .insert(quizRecord)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating quiz record:', createError);
      return res.status(500).json({
        message: 'Failed to create quiz record',
        error: createError.message
      });
    }
    
    console.log('Quiz record created successfully:', createdQuiz);
    
    // Step 3: Test if we can now insert a quiz completion
    const testCompletion = {
      user_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
      quiz_id: quizId,
      score: 100,
      max_score: 100,
      percentage: 100,
      time_spent: 10,
      completed_at: new Date().toISOString(),
      answers: [],
      passed: true,
      attempts: 1
    };
    
    const { data: testData, error: testError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .insert(testCompletion)
      .select()
      .single();
    
    const success = !testError;
    
    if (success) {
      console.log('SUCCESS: Quiz completion test successful!');
      // Clean up test record
      await supabaseAdmin
        .from('vsk_quiz_completions')
        .delete()
        .eq('id', testData.id);
      console.log('Test completion record cleaned up');
    } else {
      console.error('FAILED: Quiz completion test failed:', testError);
    }
    
    return res.status(success ? 200 : 500).json({
      message: success ? 'Quiz record created and foreign key constraint satisfied' : 'Quiz record created but completion test failed',
      success: success,
      createdQuiz: createdQuiz,
      testError: testError?.message
    });
    
  } catch (error) {
    console.error('Error creating quiz record:', error);
    return res.status(500).json({
      message: 'Error creating quiz record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
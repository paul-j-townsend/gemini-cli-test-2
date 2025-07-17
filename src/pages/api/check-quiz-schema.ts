import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('=== CHECKING QUIZ TABLE SCHEMA ===');
    
    // Try to get existing quiz records to see the structure
    const { data: existingQuizzes, error: quizError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*')
      .limit(3);
    
    console.log('Existing quiz sample:', { data: existingQuizzes, error: quizError });
    
    // Try to insert a minimal record to see what fields are required
    const testQuizId = '12345678-1234-1234-1234-123456789abc'; // Proper UUID format
    const minimalQuiz = {
      id: testQuizId,
      title: 'Test Quiz for Schema Check'
    };
    
    const { data: insertTest, error: insertError } = await supabaseAdmin
      .from('vsk_quizzes')
      .insert(minimalQuiz)
      .select()
      .single();
    
    console.log('Minimal insert test:', { data: insertTest, error: insertError });
    
    // If successful, clean up
    if (insertTest) {
      await supabaseAdmin
        .from('vsk_quizzes')
        .delete()
        .eq('id', testQuizId);
    }
    
    // Try different field combinations based on common quiz table patterns
    const testCombinations = [
      { id: '12345678-1234-1234-1234-123456789ab2', title: 'Test 2' },
      { id: '12345678-1234-1234-1234-123456789ab3', title: 'Test 3', description: 'Test description' },
      { id: '12345678-1234-1234-1234-123456789ab4', title: 'Test 4', description: 'Test description', pass_percentage: 70 },
      { id: '12345678-1234-1234-1234-123456789ab5', title: 'Test 5', description: 'Test description', total_questions: 2 },
    ];
    
    const testResults = [];
    
    for (const combo of testCombinations) {
      const { data: comboData, error: comboError } = await supabaseAdmin
        .from('vsk_quizzes')
        .insert(combo)
        .select()
        .single();
      
      const success = !comboError;
      testResults.push({
        fields: Object.keys(combo),
        success,
        error: comboError?.message
      });
      
      // Clean up if successful
      if (comboData) {
        await supabaseAdmin
          .from('vsk_quizzes')
          .delete()
          .eq('id', combo.id);
      }
      
      // Stop at first success
      if (success) break;
    }
    
    return res.status(200).json({
      message: 'Quiz table schema checked',
      existingQuizzes: existingQuizzes,
      existingQuizzesError: quizError?.message,
      minimalInsertTest: {
        success: !insertError,
        error: insertError?.message
      },
      fieldTests: testResults
    });
    
  } catch (error) {
    console.error('Error checking quiz schema:', error);
    return res.status(500).json({
      message: 'Error checking quiz schema',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('=== TESTING DATABASE DIRECT ACCESS ===');
    
    // Test 1: Check if we can access the table
    console.log('Test 1: Checking table access...');
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*')
      .limit(1);
    
    console.log('Table access result:', { data: tableData, error: tableError });
    
    // Test 2: Try to insert our problematic record directly
    console.log('Test 2: Attempting direct insert...');
    const testRecord = {
      user_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
      quiz_id: '022b3131-5889-4496-85ee-df43059f5461',
      score: 100,
      max_score: 100,
      percentage: 100,
      time_spent: 10,
      completed_at: new Date().toISOString(),
      answers: [],
      passed: true,
      attempts: 1
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .insert(testRecord)
      .select()
      .single();
    
    console.log('Direct insert result:', { data: insertData, error: insertError });
    
    // Test 3: Check if the record exists
    if (insertData) {
      console.log('Test 3: Checking if record was created...');
      const { data: checkData, error: checkError } = await supabaseAdmin
        .from('vsk_quiz_completions')
        .select('*')
        .eq('id', insertData.id);
      
      console.log('Check result:', { data: checkData, error: checkError });
      
      // Clean up
      await supabaseAdmin
        .from('vsk_quiz_completions')
        .delete()
        .eq('id', insertData.id);
      
      console.log('Test record cleaned up');
    }
    
    return res.status(200).json({
      message: 'Direct database test completed',
      results: {
        tableAccess: { success: !tableError, error: tableError?.message },
        directInsert: { success: !insertError, error: insertError?.message, data: insertData },
        recordExists: insertData ? true : false
      }
    });
    
  } catch (error) {
    console.error('Direct DB test error:', error);
    return res.status(500).json({
      message: 'Direct database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
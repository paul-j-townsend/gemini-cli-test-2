import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('=== REMOVING FOREIGN KEY CONSTRAINT ===');
    
    // Step 1: Check current constraints
    const { data: constraints, error: constraintError } = await supabaseAdmin
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_name', 'vsk_quiz_completions')
      .eq('constraint_type', 'FOREIGN KEY');
    
    console.log('Current constraints:', constraints);
    
    // Step 2: Try to remove the foreign key constraint using SQL
    const dropConstraintSQL = `
      ALTER TABLE vsk_quiz_completions 
      DROP CONSTRAINT IF EXISTS vsk_quiz_completions_quiz_id_fkey;
    `;
    
    console.log('Attempting to drop constraint with SQL:', dropConstraintSQL);
    
    // Method 1: Try using the sql template literal method
    try {
      const { data: dropResult, error: dropError } = await supabaseAdmin
        .rpc('exec_sql', { sql: dropConstraintSQL });
      
      if (dropError) {
        console.error('exec_sql failed:', dropError);
        throw dropError;
      }
      console.log('Constraint dropped successfully via exec_sql');
    } catch (execError) {
      console.log('exec_sql not available, trying alternative approach...');
      
      // Method 2: Try using a raw SQL query if the RPC function doesn't exist
      try {
        const { data: rawResult, error: rawError } = await supabaseAdmin
          .from('pg_constraint')
          .select('*')
          .eq('conname', 'vsk_quiz_completions_quiz_id_fkey');
        
        console.log('Constraint lookup result:', { data: rawResult, error: rawError });
        
        if (rawError) {
          throw new Error(`Cannot access constraint information: ${rawError.message}`);
        }
        
        // If we can't use SQL directly, let's try a different approach
        console.log('Will need to use Supabase dashboard or CLI to remove constraint');
      } catch (altError) {
        console.error('Alternative approach failed:', altError);
        throw altError;
      }
    }
    
    // Step 3: Test if constraint is gone by attempting insert
    console.log('Testing constraint removal...');
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
    
    const { data: testData, error: testError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .insert(testRecord)
      .select()
      .single();
    
    const success = !testError;
    
    if (success) {
      console.log('SUCCESS: Constraint removed, test insert successful!');
      // Clean up test record
      await supabaseAdmin
        .from('vsk_quiz_completions')
        .delete()
        .eq('id', testData.id);
    } else {
      console.error('FAILED: Constraint still exists:', testError);
    }
    
    return res.status(success ? 200 : 500).json({
      message: success ? 'Foreign key constraint removed successfully' : 'Failed to remove foreign key constraint',
      success: success,
      originalConstraints: constraints,
      testError: testError?.message,
      testData: testData
    });
    
  } catch (error) {
    console.error('Error removing constraint:', error);
    return res.status(500).json({
      message: 'Error removing foreign key constraint',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
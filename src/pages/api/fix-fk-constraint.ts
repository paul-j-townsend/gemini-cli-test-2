import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Attempting to remove foreign key constraint...');
    
    // Try to remove the foreign key constraint using raw SQL
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE vsk_quiz_completions DROP CONSTRAINT IF EXISTS vsk_quiz_completions_quiz_id_fkey;'
    });

    if (error) {
      console.error('RPC exec_sql failed, trying alternative method:', error);
      
      // Alternative approach - check if we can query the constraints table
      const { data: constraints, error: constraintError } = await supabaseAdmin
        .from('information_schema.table_constraints')
        .select('*')
        .eq('table_name', 'vsk_quiz_completions')
        .eq('constraint_type', 'FOREIGN KEY');

      if (constraintError) {
        console.error('Cannot query constraints:', constraintError);
        return res.status(500).json({ 
          message: 'Cannot access database constraints', 
          error: constraintError.message 
        });
      }

      console.log('Found constraints:', constraints);
      
      return res.status(200).json({ 
        message: 'Could not remove constraint via RPC, but found existing constraints',
        constraints: constraints,
        originalError: error.message
      });
    }

    console.log('Foreign key constraint removed successfully');
    return res.status(200).json({ 
      message: 'Foreign key constraint removed successfully' 
    });
  } catch (error) {
    console.error('Error in fix-fk-constraint:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
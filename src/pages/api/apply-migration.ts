import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting database schema fix...');
    
    // Step 1: Check current state
    const { data: tables, error: tableError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['vsk_quiz_completions', 'vsk_user_progress']);

    if (tableError) {
      console.error('Error checking tables:', tableError);
      return res.status(500).json({ message: 'Error checking database state' });
    }

    console.log('Current tables:', tables);

    // Step 2: Try to clear existing data and recreate without foreign key constraints
    const results = [];

    // First, try to check if we can access the table
    try {
      const { data: existingData, error: selectError } = await supabaseAdmin
        .from('vsk_quiz_completions')
        .select('count')
        .limit(1);

      if (selectError) {
        console.log('Table might not exist or have issues:', selectError.message);
      } else {
        console.log('Table exists, clearing data...');
        // Clear existing data
        const { error: deleteError } = await supabaseAdmin
          .from('vsk_quiz_completions')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

        if (deleteError) {
          console.error('Error clearing data:', deleteError);
        } else {
          console.log('Data cleared successfully');
        }
      }
    } catch (error) {
      console.log('Error accessing table:', error);
    }

    // Step 3: Try to insert a test record to see if it works now
    try {
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

      if (testError) {
        console.error('Test insert failed:', testError);
        results.push({ step: 'test_insert', success: false, error: testError.message });
      } else {
        console.log('Test insert successful:', testData);
        results.push({ step: 'test_insert', success: true, data: testData });
        
        // Clean up test record
        await supabaseAdmin
          .from('vsk_quiz_completions')
          .delete()
          .eq('id', testData.id);
      }
    } catch (error) {
      console.error('Test insert error:', error);
      results.push({ step: 'test_insert', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    return res.status(200).json({ 
      message: 'Database schema check completed',
      results: results,
      tables: tables
    });
  } catch (error) {
    console.error('Error in migration:', error);
    return res.status(500).json({ 
      message: 'Error in migration', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
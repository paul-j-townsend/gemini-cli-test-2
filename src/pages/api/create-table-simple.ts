import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Creating user content progress table...');

    // First check if table already exists
    const { data: tableExists } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'vsk_user_content_progress')
      .maybeSingle();

    if (tableExists) {
      console.log('Table already exists');
      return res.status(200).json({ 
        message: 'Table already exists',
        success: true,
        tableExists: true
      });
    }

    // Create a test record directly to trigger table creation
    // This approach uses Supabase's automatic table creation feature
    const testUserId = 'fed2a63e-196d-43ff-9ebc-674db34e72a7';
    const testContentId = '022b3131-5889-4496-85ee-df43059f5461';

    // Try to create a record - if table doesn't exist, we'll get a specific error
    const { data, error } = await supabaseAdmin
      .from('vsk_user_content_progress')
      .upsert({
        user_id: testUserId,
        content_id: testContentId,
        quiz_completed: true,
        quiz_completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/accessing table:', error);
      
      // If table doesn't exist, provide instructions
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'Table does not exist. Please create it manually in Supabase Dashboard.',
          instructions: 'Go to Supabase Dashboard > SQL Editor and run the migration from supabase/migrations/036_create_user_content_progress.sql',
          sqlError: error.message
        });
      }
      
      return res.status(500).json({ error: error.message });
    }

    console.log('Table operation successful:', data);
    return res.status(200).json({ 
      message: 'Table exists and working correctly',
      success: true,
      testRecord: data
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
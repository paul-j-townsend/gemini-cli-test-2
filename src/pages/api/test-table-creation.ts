import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // First check if table exists
    const { data: existingTable, error: checkError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'vsk_user_content_progress')
      .maybeSingle();

    if (existingTable) {
      return res.status(200).json({ 
        message: 'Table already exists',
        tableExists: true,
        table: existingTable
      });
    }

    // Create the table with minimal structure for testing
    const createSQL = `
      CREATE TABLE vsk_user_content_progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        content_id UUID NOT NULL,
        has_listened BOOLEAN DEFAULT false,
        listen_progress_percentage INTEGER DEFAULT 0,
        listened_at TIMESTAMP WITH TIME ZONE,
        quiz_completed BOOLEAN DEFAULT false,
        quiz_completed_at TIMESTAMP WITH TIME ZONE,
        report_downloaded BOOLEAN DEFAULT false,
        report_downloaded_at TIMESTAMP WITH TIME ZONE,
        certificate_downloaded BOOLEAN DEFAULT false,
        certificate_downloaded_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, content_id)
      );

      ALTER TABLE vsk_user_content_progress ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Service role access" ON vsk_user_content_progress
        FOR ALL USING (auth.role() = 'service_role');
    `;

    // Execute SQL using raw query
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: createSQL 
    });

    if (error) {
      console.error('SQL execution error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Verify table was created
    const { data: newTable, error: verifyError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'vsk_user_content_progress')
      .single();

    if (verifyError) {
      return res.status(500).json({ 
        error: 'Table creation verification failed',
        details: verifyError
      });
    }

    return res.status(200).json({ 
      message: 'Table created successfully',
      tableExists: true,
      table: newTable
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Execute the migration SQL directly
    const createTableSQL = `
      -- Create table for tracking user progress on content items
      CREATE TABLE IF NOT EXISTS vsk_user_content_progress (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          content_id UUID NOT NULL,
          
          -- Progress tracking
          has_listened BOOLEAN DEFAULT false,
          listen_progress_percentage INTEGER DEFAULT 0 CHECK (listen_progress_percentage >= 0 AND listen_progress_percentage <= 100),
          listened_at TIMESTAMP WITH TIME ZONE,
          
          quiz_completed BOOLEAN DEFAULT false,
          quiz_completed_at TIMESTAMP WITH TIME ZONE,
          
          report_downloaded BOOLEAN DEFAULT false,
          report_downloaded_at TIMESTAMP WITH TIME ZONE,
          
          certificate_downloaded BOOLEAN DEFAULT false,
          certificate_downloaded_at TIMESTAMP WITH TIME ZONE,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- Ensure one record per user per content
          UNIQUE(user_id, content_id)
      );
    `;

    const indexSQL = `
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_vsk_user_content_progress_user_id ON vsk_user_content_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_vsk_user_content_progress_content_id ON vsk_user_content_progress(content_id);
      CREATE INDEX IF NOT EXISTS idx_vsk_user_content_progress_has_listened ON vsk_user_content_progress(has_listened);
      CREATE INDEX IF NOT EXISTS idx_vsk_user_content_progress_quiz_completed ON vsk_user_content_progress(quiz_completed);
    `;

    const rlsSQL = `
      -- Enable Row Level Security
      ALTER TABLE vsk_user_content_progress ENABLE ROW LEVEL SECURITY;
    `;

    const policiesSQL = `
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view their own progress" ON vsk_user_content_progress;
      DROP POLICY IF EXISTS "Users can insert their own progress" ON vsk_user_content_progress;
      DROP POLICY IF EXISTS "Users can update their own progress" ON vsk_user_content_progress;
      DROP POLICY IF EXISTS "Service role can do everything on progress" ON vsk_user_content_progress;

      -- Create RLS policies
      CREATE POLICY "Users can view their own progress" ON vsk_user_content_progress
          FOR SELECT USING (auth.uid()::text = user_id::text);

      CREATE POLICY "Users can insert their own progress" ON vsk_user_content_progress
          FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

      CREATE POLICY "Users can update their own progress" ON vsk_user_content_progress
          FOR UPDATE USING (auth.uid()::text = user_id::text);

      -- Allow service role to do everything
      CREATE POLICY "Service role can do everything on progress" ON vsk_user_content_progress
          FOR ALL USING (auth.role() = 'service_role');
    `;

    const triggerSQL = `
      -- Create function to update the updated_at timestamp
      CREATE OR REPLACE FUNCTION update_vsk_user_content_progress_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Drop existing trigger if it exists
      DROP TRIGGER IF EXISTS trigger_update_vsk_user_content_progress_updated_at ON vsk_user_content_progress;

      -- Create trigger to automatically update updated_at
      CREATE TRIGGER trigger_update_vsk_user_content_progress_updated_at
          BEFORE UPDATE ON vsk_user_content_progress
          FOR EACH ROW
          EXECUTE FUNCTION update_vsk_user_content_progress_updated_at();
    `;

    // Execute each SQL block
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: createTableSQL 
    });
    if (createError) throw createError;

    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: indexSQL 
    });
    if (indexError) throw indexError;

    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: rlsSQL 
    });
    if (rlsError) throw rlsError;

    const { error: policyError } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: policiesSQL 
    });
    if (policyError) throw policyError;

    const { error: triggerError } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: triggerSQL 
    });
    if (triggerError) throw triggerError;

    // Verify table was created
    const { data: tableCheck, error: checkError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'vsk_user_content_progress')
      .single();

    if (checkError || !tableCheck) {
      throw new Error('Table creation verification failed');
    }

    return res.status(200).json({ 
      message: 'User content progress table created successfully',
      table: tableCheck
    });

  } catch (error) {
    console.error('Error creating user content progress table:', error);
    return res.status(500).json({ 
      message: 'Failed to create table',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
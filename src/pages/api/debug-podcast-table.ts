import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Checking podcast episodes table structure...');

    // Check if table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .rpc('execute_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'vsk_podcast_episodes' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (tableError) {
      console.error('Error checking table structure:', tableError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to check table structure',
        error: tableError.message
      });
    }

    // Check what tables exist with 'podcast' in the name
    const { data: podcastTables, error: tablesError } = await supabaseAdmin
      .rpc('execute_sql', {
        sql: `
          SELECT table_name
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name LIKE '%podcast%'
          ORDER BY table_name;
        `
      });

    if (tablesError) {
      console.error('Error checking podcast tables:', tablesError);
    }

    // Try to get a sample of existing data
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('*')
      .limit(1);

    return res.status(200).json({
      success: true,
      tableExists: tableInfo && tableInfo.length > 0,
      tableStructure: tableInfo || [],
      podcastTables: podcastTables || [],
      sampleData: sampleData || [],
      sampleError: sampleError?.message || null
    });

  } catch (error) {
    console.error('Unexpected error during table check:', error);
    return res.status(500).json({
      success: false,
      message: 'Unexpected error during table check',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
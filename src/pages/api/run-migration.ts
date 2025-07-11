import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { migrationFile } = req.body;

  if (!migrationFile) {
    return res.status(400).json({ error: 'Migration file name required' });
  }

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      return res.status(404).json({ error: 'Migration file not found' });
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    console.log('Executing migration:', migrationFile);
    
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('Migration error:', error);
      return res.status(500).json({ 
        error: 'Migration failed', 
        details: error.message || error 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Migration executed successfully',
      data: data || 'No data returned'
    });

  } catch (error) {
    console.error('Error executing migration:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sql = fs.readFileSync(path.join(process.cwd(), 'sql', 'new_quiz_schema.sql')).toString();

    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      sql
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({ 
      message: 'New quiz schema applied successfully'
    });

  } catch (err: any) {
    console.error('Migration Error:', err);
    return res.status(500).json({ 
      message: 'Migration failed', 
      error: err.message,
      suggestion: 'You may need to run the migration manually in your Supabase dashboard using the SQL in sql/new_quiz_schema.sql'
    });
  }
}
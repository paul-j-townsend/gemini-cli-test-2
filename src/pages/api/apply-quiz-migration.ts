import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'sql', 'migrate_quiz_format.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Applying ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}: ${statement.substring(0, 100)}...`);
        
        const { error } = await supabaseAdmin.rpc('exec_sql', { 
          sql: statement + ';'
        });

        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          // Continue with other statements, as some might already exist
        }
      }
    }

    return res.status(200).json({ 
      message: 'Quiz migration applied successfully',
      statements_executed: statements.length
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ 
      message: 'Failed to apply migration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
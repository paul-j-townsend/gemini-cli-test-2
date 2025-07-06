import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Checking database tables...');

    // Query to get all table names in the public schema
    const { data: tables, error } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });

    if (error) throw error;

    // Parse the results to extract table names
    const tableNames = tables?.map((row: any) => row.table_name) || [];

    // Categorize tables
    const vskTables = tableNames.filter((name: string) => name.startsWith('vsk_'));
    const nonVskTables = tableNames.filter((name: string) => !name.startsWith('vsk_') && !name.startsWith('_'));
    const systemTables = tableNames.filter((name: string) => name.startsWith('_'));

    // Look for potential duplicates
    const potentialDuplicates = [];
    vskTables.forEach((vskTable: string) => {
      const baseTableName = vskTable.replace('vsk_', '');
      if (nonVskTables.includes(baseTableName)) {
        potentialDuplicates.push({
          vsk_table: vskTable,
          duplicate_table: baseTableName
        });
      }
    });

    // Check row counts for each table
    const tableCounts: any = {};
    for (const tableName of [...vskTables, ...nonVskTables]) {
      try {
        const { count } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        tableCounts[tableName] = count || 0;
      } catch (err) {
        tableCounts[tableName] = 'ERROR';
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        total_tables: tableNames.length,
        vsk_tables: vskTables.length,
        non_vsk_tables: nonVskTables.length,
        system_tables: systemTables.length,
        potential_duplicates: potentialDuplicates.length
      },
      tables: {
        vsk_tables: vskTables,
        non_vsk_tables: nonVskTables,
        system_tables: systemTables,
        potential_duplicates: potentialDuplicates
      },
      row_counts: tableCounts
    });

  } catch (error) {
    console.error('Database table check failed:', error);
    return res.status(500).json({
      error: 'Database table check failed',
      details: error
    });
  }
}
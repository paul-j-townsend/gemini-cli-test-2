import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData: any = {
      timestamp,
      tables: {}
    };

    // Define tables to backup in dependency order
    const tablesToBackup = [
      'vsk_users',
      'vsk_articles', 
      'vsk_quizzes',
      'vsk_quiz_questions',
      'vsk_question_answers',
      'vsk_podcast_episodes',
      'vsk_quiz_completions',
      'vsk_user_progress'
    ];

    // Backup each table
    for (const tableName of tablesToBackup) {
      try {
        const { data, error, count } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact' });

        if (error) {
          console.error(`Error backing up ${tableName}:`, error);
          // Continue with other tables even if one fails
          backupData.tables[tableName] = {
            error: error.message,
            count: 0,
            data: []
          };
        } else {
          backupData.tables[tableName] = {
            count: count || 0,
            data: data || []
          };
          console.log(`Backed up ${tableName}: ${count || 0} records`);
        }
      } catch (tableError) {
        console.error(`Exception backing up ${tableName}:`, tableError);
        backupData.tables[tableName] = {
          error: `Exception: ${tableError}`,
          count: 0,
          data: []
        };
      }
    }

    // Get database schema information
    try {
      const { data: schemaInfo, error: schemaError } = await supabaseAdmin
        .rpc('exec_sql', {
          query: `
            SELECT 
              table_name,
              column_name,
              data_type,
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name LIKE 'vsk_%'
            ORDER BY table_name, ordinal_position
          `
        });

      if (!schemaError) {
        backupData.schema = schemaInfo;
      }
    } catch (schemaError) {
      console.error('Error getting schema info:', schemaError);
    }

    // Get foreign key constraints
    try {
      const { data: constraintInfo, error: constraintError } = await supabaseAdmin
        .rpc('exec_sql', {
          query: `
            SELECT 
              tc.table_name,
              kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name,
              tc.constraint_name,
              rc.delete_rule,
              rc.update_rule
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu 
              ON ccu.constraint_name = tc.constraint_name
            JOIN information_schema.referential_constraints rc 
              ON tc.constraint_name = rc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name LIKE 'vsk_%'
            ORDER BY tc.table_name
          `
        });

      if (!constraintError) {
        backupData.constraints = constraintInfo;
      }
    } catch (constraintError) {
      console.error('Error getting constraint info:', constraintError);
    }

    // Create backup summary
    const totalRecords = Object.values(backupData.tables).reduce((sum: number, table: any) => 
      sum + (table.count || 0), 0
    );

    const backupSummary = {
      timestamp,
      totalTables: tablesToBackup.length,
      totalRecords,
      tablesWithErrors: Object.entries(backupData.tables).filter(([_, table]: [string, any]) => 
        table.error
      ).length,
      success: true
    };

    // Return backup data (in production, this would be saved to file/storage)
    return res.status(200).json({
      summary: backupSummary,
      backup: backupData
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    return res.status(500).json({ 
      error: 'Failed to create backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
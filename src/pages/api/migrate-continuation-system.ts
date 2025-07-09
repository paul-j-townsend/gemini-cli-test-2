import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting continuation system migration...');
    
    // Step 1: Add new columns to vsk_quizzes table
    console.log('Adding new columns to vsk_quizzes table...');
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE vsk_quizzes 
        ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3,
        ADD COLUMN IF NOT EXISTS cooldown_period_hours INTEGER DEFAULT 24,
        ADD COLUMN IF NOT EXISTS reset_period_days INTEGER DEFAULT 7;
      `
    });

    // Step 2: Add new columns to vsk_quiz_completions table
    console.log('Adding new columns to vsk_quiz_completions table...');
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE vsk_quiz_completions 
        ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS next_attempt_available_at TIMESTAMPTZ;
      `
    });

    // Step 3: Create vsk_quiz_continuation_limits table
    console.log('Creating vsk_quiz_continuation_limits table...');
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vsk_quiz_continuation_limits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          quiz_id UUID NOT NULL,
          attempts_used INTEGER DEFAULT 0,
          last_attempt_at TIMESTAMPTZ,
          blocked_until TIMESTAMPTZ,
          reset_at TIMESTAMPTZ NOT NULL,
          custom_max_attempts INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, quiz_id)
        );
      `
    });

    // Step 4: Create indexes for performance
    console.log('Creating indexes...');
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_quiz_continuation_user_quiz 
        ON vsk_quiz_continuation_limits(user_id, quiz_id);
        
        CREATE INDEX IF NOT EXISTS idx_quiz_continuation_reset_at 
        ON vsk_quiz_continuation_limits(reset_at);
        
        CREATE INDEX IF NOT EXISTS idx_quiz_continuation_blocked_until 
        ON vsk_quiz_continuation_limits(blocked_until);
      `
    });

    // Step 5: Set up Row Level Security (RLS)
    console.log('Setting up RLS policies...');
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE vsk_quiz_continuation_limits ENABLE ROW LEVEL SECURITY;
        
        -- Users can only see their own continuation limits
        CREATE POLICY "Users can view own continuation limits" 
        ON vsk_quiz_continuation_limits FOR SELECT 
        USING (auth.uid() = user_id);
        
        -- Users can only update their own continuation limits
        CREATE POLICY "Users can update own continuation limits" 
        ON vsk_quiz_continuation_limits FOR UPDATE 
        USING (auth.uid() = user_id);
        
        -- Service role can manage all continuation limits
        CREATE POLICY "Service role can manage all continuation limits" 
        ON vsk_quiz_continuation_limits FOR ALL 
        USING (true);
      `
    });

    // Step 6: Update existing quiz records with default values
    console.log('Updating existing quiz records with default values...');
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        UPDATE vsk_quizzes 
        SET 
          max_attempts = COALESCE(max_attempts, 3),
          cooldown_period_hours = COALESCE(cooldown_period_hours, 24),
          reset_period_days = COALESCE(reset_period_days, 7)
        WHERE 
          max_attempts IS NULL 
          OR cooldown_period_hours IS NULL 
          OR reset_period_days IS NULL;
      `
    });

    // Step 7: Update existing quiz completion records
    console.log('Updating existing quiz completion records...');
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        UPDATE vsk_quiz_completions 
        SET attempt_number = COALESCE(attempt_number, 1)
        WHERE attempt_number IS NULL;
      `
    });

    console.log('Migration completed successfully!');
    
    res.status(200).json({ 
      message: 'Continuation system migration completed successfully',
      steps: [
        'Added new columns to vsk_quizzes table',
        'Added new columns to vsk_quiz_completions table',
        'Created vsk_quiz_continuation_limits table',
        'Created performance indexes',
        'Set up RLS policies',
        'Updated existing records with default values'
      ]
    });

  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ 
      message: 'Migration failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
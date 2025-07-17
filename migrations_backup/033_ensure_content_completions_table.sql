-- Migration: Ensure vsk_content_completions table exists
-- Date: 2025-07-14
-- Description: Create content completions table if it doesn't exist

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS vsk_content_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    time_spent INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers JSONB NOT NULL DEFAULT '[]',
    passed BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_vsk_content_completions_user_id ON vsk_content_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_content_completions_content_id ON vsk_content_completions(content_id);
CREATE INDEX IF NOT EXISTS idx_vsk_content_completions_passed ON vsk_content_completions(passed);
CREATE INDEX IF NOT EXISTS idx_vsk_content_completions_completed_at ON vsk_content_completions(completed_at);

-- Enable RLS
ALTER TABLE vsk_content_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DROP POLICY IF EXISTS "Allow read access to content completions" ON vsk_content_completions;
DROP POLICY IF EXISTS "Allow all operations on content completions" ON vsk_content_completions;

CREATE POLICY "Allow read access to content completions" ON vsk_content_completions FOR SELECT USING (true);
CREATE POLICY "Allow all operations on content completions" ON vsk_content_completions FOR ALL USING (auth.role() = 'authenticated');

-- Verification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_content_completions') THEN
        RAISE NOTICE 'SUCCESS: vsk_content_completions table exists and is ready';
    ELSE
        RAISE EXCEPTION 'ERROR: vsk_content_completions table was not created';
    END IF;
END $$;
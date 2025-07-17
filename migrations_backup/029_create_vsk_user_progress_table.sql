-- Migration: Create vsk_user_progress table for user progress tracking
-- Date: 2025-07-05
-- Description: Track user progress, statistics, and achievements

-- Create vsk_user_progress table
CREATE TABLE IF NOT EXISTS vsk_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE, -- One progress record per user
    total_quizzes_completed INTEGER NOT NULL DEFAULT 0,
    total_quizzes_passed INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    total_max_score INTEGER NOT NULL DEFAULT 0,
    average_score INTEGER NOT NULL DEFAULT 0,
    total_time_spent INTEGER NOT NULL DEFAULT 0, -- Time in seconds
    completion_rate INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    streak_days INTEGER NOT NULL DEFAULT 0,
    badges JSONB NOT NULL DEFAULT '[]', -- Array of badge objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_user_id ON vsk_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_total_quizzes_completed ON vsk_user_progress(total_quizzes_completed);
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_average_score ON vsk_user_progress(average_score);
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_last_activity_at ON vsk_user_progress(last_activity_at);

-- Add RLS policies
ALTER TABLE vsk_user_progress ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read progress (for now - can be restricted later)
CREATE POLICY "Allow read access to user progress" ON vsk_user_progress
    FOR SELECT USING (true);

-- Allow anyone to insert progress
CREATE POLICY "Allow insert access to user progress" ON vsk_user_progress
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update progress
CREATE POLICY "Allow update access to user progress" ON vsk_user_progress
    FOR UPDATE USING (true);

-- Allow anyone to delete progress
CREATE POLICY "Allow delete access to user progress" ON vsk_user_progress
    FOR DELETE USING (true);

-- Add comment
COMMENT ON TABLE vsk_user_progress IS 'Track user progress, statistics, and achievements across all quizzes';

-- Verify the table was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'vsk_user_progress'
    ) THEN
        RAISE NOTICE 'SUCCESS: vsk_user_progress table has been created';
    ELSE
        RAISE EXCEPTION 'ERROR: vsk_user_progress table was not created';
    END IF;
END $$;
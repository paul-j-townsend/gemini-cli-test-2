-- Migration: Create vsk_quiz_completions table for comprehensive quiz tracking
-- Date: 2025-07-05
-- Description: Enhanced quiz completion tracking with detailed answers and progress

-- Create vsk_quiz_completions table
CREATE TABLE IF NOT EXISTS vsk_quiz_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- References users table
    quiz_id UUID NOT NULL, -- References quizzes table
    podcast_id UUID, -- Optional reference to podcast episodes
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    time_spent INTEGER NOT NULL DEFAULT 0, -- Time in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers JSONB NOT NULL DEFAULT '[]', -- Array of answer objects
    passed BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_user_id ON vsk_quiz_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_quiz_id ON vsk_quiz_completions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_podcast_id ON vsk_quiz_completions(podcast_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_passed ON vsk_quiz_completions(passed);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_completed_at ON vsk_quiz_completions(completed_at);

-- Add RLS policies
ALTER TABLE vsk_quiz_completions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read completions (for now - can be restricted later)
CREATE POLICY "Allow read access to quiz completions" ON vsk_quiz_completions
    FOR SELECT USING (true);

-- Allow anyone to insert completions
CREATE POLICY "Allow insert access to quiz completions" ON vsk_quiz_completions
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update completions
CREATE POLICY "Allow update access to quiz completions" ON vsk_quiz_completions
    FOR UPDATE USING (true);

-- Allow anyone to delete completions
CREATE POLICY "Allow delete access to quiz completions" ON vsk_quiz_completions
    FOR DELETE USING (true);

-- Add comment
COMMENT ON TABLE vsk_quiz_completions IS 'Comprehensive quiz completion tracking with detailed answers and progress metrics';

-- Verify the table was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'vsk_quiz_completions'
    ) THEN
        RAISE NOTICE 'SUCCESS: vsk_quiz_completions table has been created';
    ELSE
        RAISE EXCEPTION 'ERROR: vsk_quiz_completions table was not created';
    END IF;
END $$;
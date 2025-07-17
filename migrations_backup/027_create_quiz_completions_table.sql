-- Migration: Create quiz_completions table
-- Date: 2025-07-05
-- Description: Track when users successfully complete quizzes for certificate eligibility

-- Create quiz_completions table
CREATE TABLE IF NOT EXISTS quiz_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_session TEXT NOT NULL, -- For now using session ID, could be user_id later
    score_percentage INTEGER NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one completion record per user per quiz (latest attempt)
    UNIQUE(quiz_id, user_session)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_completions_quiz_id ON quiz_completions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_user_session ON quiz_completions(user_session);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_passed ON quiz_completions(passed);

-- Add RLS policies
ALTER TABLE quiz_completions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read their own completions (using session)
CREATE POLICY "Users can view their own quiz completions" ON quiz_completions
    FOR SELECT USING (true); -- Open for now, can restrict later

-- Allow anyone to insert their own completions
CREATE POLICY "Users can insert their own quiz completions" ON quiz_completions
    FOR INSERT WITH CHECK (true); -- Open for now, can restrict later

-- Allow users to update their own completions (for retakes)
CREATE POLICY "Users can update their own quiz completions" ON quiz_completions
    FOR UPDATE USING (true); -- Open for now, can restrict later

-- Add comment
COMMENT ON TABLE quiz_completions IS 'Tracks successful quiz completions for certificate eligibility';

-- Verify the table was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'quiz_completions'
    ) THEN
        RAISE NOTICE 'SUCCESS: quiz_completions table has been created';
    ELSE
        RAISE EXCEPTION 'ERROR: quiz_completions table was not created';
    END IF;
END $$;
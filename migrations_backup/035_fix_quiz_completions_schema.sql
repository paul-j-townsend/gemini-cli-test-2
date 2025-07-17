-- Migration: Fix quiz completions schema for unified content system
-- Date: 2025-07-17
-- Description: Remove foreign key constraint and clean up quiz completions table

-- Drop the existing vsk_quiz_completions table and recreate it without foreign key constraints
DROP TABLE IF EXISTS vsk_quiz_completions CASCADE;

-- Create a new, clean vsk_quiz_completions table
CREATE TABLE vsk_quiz_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    quiz_id UUID NOT NULL, -- No foreign key constraint - can be any content ID
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    time_spent INTEGER NOT NULL DEFAULT 0, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers JSONB NOT NULL DEFAULT '[]',
    passed BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_vsk_quiz_completions_user_id ON vsk_quiz_completions(user_id);
CREATE INDEX idx_vsk_quiz_completions_quiz_id ON vsk_quiz_completions(quiz_id);
CREATE INDEX idx_vsk_quiz_completions_passed ON vsk_quiz_completions(passed);
CREATE INDEX idx_vsk_quiz_completions_completed_at ON vsk_quiz_completions(completed_at);
CREATE INDEX idx_vsk_quiz_completions_percentage ON vsk_quiz_completions(percentage);

-- Enable Row Level Security
ALTER TABLE vsk_quiz_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own completions" ON vsk_quiz_completions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own completions" ON vsk_quiz_completions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own completions" ON vsk_quiz_completions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow service role to do everything
CREATE POLICY "Service role can do everything" ON vsk_quiz_completions
    FOR ALL USING (auth.role() = 'service_role');

-- Also clean up the vsk_user_progress table if it exists
DROP TABLE IF EXISTS vsk_user_progress CASCADE;

-- Create a clean vsk_user_progress table
CREATE TABLE vsk_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    total_quizzes_completed INTEGER NOT NULL DEFAULT 0,
    total_quizzes_passed INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    total_max_score INTEGER NOT NULL DEFAULT 0,
    average_score INTEGER NOT NULL DEFAULT 0,
    total_time_spent INTEGER NOT NULL DEFAULT 0,
    completion_rate INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_days INTEGER NOT NULL DEFAULT 0,
    badges JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user progress
CREATE INDEX idx_vsk_user_progress_user_id ON vsk_user_progress(user_id);
CREATE INDEX idx_vsk_user_progress_average_score ON vsk_user_progress(average_score);
CREATE INDEX idx_vsk_user_progress_last_activity ON vsk_user_progress(last_activity_at);

-- Enable Row Level Security
ALTER TABLE vsk_user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user progress
CREATE POLICY "Users can view their own progress" ON vsk_user_progress
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own progress" ON vsk_user_progress
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own progress" ON vsk_user_progress
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow service role to do everything
CREATE POLICY "Service role can do everything on progress" ON vsk_user_progress
    FOR ALL USING (auth.role() = 'service_role');

-- Verification
DO $$
BEGIN
    -- Check if vsk_quiz_completions was created successfully
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_quiz_completions') THEN
        RAISE NOTICE 'SUCCESS: vsk_quiz_completions table created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: vsk_quiz_completions table was not created';
    END IF;

    -- Check if vsk_user_progress was created successfully
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_user_progress') THEN
        RAISE NOTICE 'SUCCESS: vsk_user_progress table created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: vsk_user_progress table was not created';
    END IF;

    -- Check that there are no foreign key constraints on quiz_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'vsk_quiz_completions' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%quiz_id%'
    ) THEN
        RAISE NOTICE 'SUCCESS: No foreign key constraints on quiz_id';
    ELSE
        RAISE EXCEPTION 'ERROR: Foreign key constraints still exist on quiz_id';
    END IF;
END $$;
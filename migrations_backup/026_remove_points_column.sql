-- Migration: Remove points column from quiz_questions table
-- Date: 2025-07-05
-- Description: Remove the points functionality by dropping the points column from quiz_questions table

-- Drop the points column from quiz_questions table
ALTER TABLE quiz_questions DROP COLUMN IF EXISTS points;

-- Verify the change
DO $$
BEGIN
    -- Check if the column was successfully removed
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' 
        AND column_name = 'points'
    ) THEN
        RAISE NOTICE 'SUCCESS: points column has been removed from quiz_questions table';
    ELSE
        RAISE EXCEPTION 'ERROR: points column was not removed from quiz_questions table';
    END IF;
END $$;
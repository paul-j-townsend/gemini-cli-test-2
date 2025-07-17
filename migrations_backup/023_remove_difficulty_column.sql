-- Migration: Remove difficulty column from quizzes table
-- Date: 2025-01-05
-- Description: Remove the difficulty field from quizzes table as it's no longer needed

-- Remove the difficulty column from quizzes table
ALTER TABLE quizzes DROP COLUMN IF EXISTS difficulty;

-- Remove any indexes that might exist on the difficulty column
DROP INDEX IF EXISTS idx_quizzes_difficulty;

-- Update any existing quiz records to ensure they have proper data
-- (This is mainly for data integrity, but there shouldn't be any issues)
UPDATE quizzes 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Verify the change
DO $$
BEGIN
    -- Check if the column was successfully removed
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quizzes' 
        AND column_name = 'difficulty'
    ) THEN
        RAISE NOTICE 'SUCCESS: difficulty column has been removed from quizzes table';
    ELSE
        RAISE EXCEPTION 'ERROR: difficulty column still exists in quizzes table';
    END IF;
END $$; 
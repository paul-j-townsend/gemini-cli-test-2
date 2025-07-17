-- Migration: Add rationale field to quiz_questions table
-- Date: 2025-01-05
-- Description: Add rationale field to store explanation text for correct answers

-- Add the rationale column to quiz_questions table
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS rationale TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN quiz_questions.rationale IS 'Explanation text shown after answering the question, providing rationale for the correct answer';

-- Update the updated_at timestamp for any existing records
UPDATE quiz_questions 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Verify the change
DO $$
BEGIN
    -- Check if the column was successfully added
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' 
        AND column_name = 'rationale'
    ) THEN
        RAISE NOTICE 'SUCCESS: rationale column has been added to quiz_questions table';
    ELSE
        RAISE EXCEPTION 'ERROR: rationale column was not added to quiz_questions table';
    END IF;
END $$; 
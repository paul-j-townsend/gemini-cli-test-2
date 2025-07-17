-- Migration: Add learning_outcome field to quiz_questions table
-- Date: 2025-07-05
-- Description: Add learning_outcome field to store learning objectives for each question

-- Add the learning_outcome column to quiz_questions table
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS learning_outcome TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN quiz_questions.learning_outcome IS 'Learning objective or outcome text shown after answering the question, describing what the student should learn';

-- Verify the change
DO $$
BEGIN
    -- Check if the column was successfully added
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' 
        AND column_name = 'learning_outcome'
    ) THEN
        RAISE NOTICE 'SUCCESS: learning_outcome column has been added to quiz_questions table';
    ELSE
        RAISE EXCEPTION 'ERROR: learning_outcome column was not added to quiz_questions table';
    END IF;
END $$;
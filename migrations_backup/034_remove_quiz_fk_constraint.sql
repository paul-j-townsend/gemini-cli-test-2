-- Migration: Remove foreign key constraint from vsk_quiz_completions
-- Date: 2025-07-17
-- Description: Remove the foreign key constraint that requires quiz_id to exist in vsk_quizzes
-- This allows unified content system where podcast episodes can have quiz completions

-- Remove the foreign key constraint
ALTER TABLE vsk_quiz_completions 
DROP CONSTRAINT IF EXISTS vsk_quiz_completions_quiz_id_fkey;

-- Verification
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vsk_quiz_completions_quiz_id_fkey'
        AND table_name = 'vsk_quiz_completions'
    ) THEN
        RAISE NOTICE 'SUCCESS: Foreign key constraint removed from vsk_quiz_completions';
    ELSE
        RAISE EXCEPTION 'ERROR: Foreign key constraint still exists';
    END IF;
END $$;
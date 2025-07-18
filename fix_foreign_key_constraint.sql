-- Remove the problematic foreign key constraint
ALTER TABLE vsk_quiz_completions 
DROP CONSTRAINT IF EXISTS vsk_quiz_completions_quiz_id_fkey;

-- Since we're using content_id from vsk_content table, we don't need a strict foreign key
-- to a vsk_quizzes table. The quiz_id field in vsk_quiz_completions should just be
-- a reference to the content_id from vsk_content.

-- Alternatively, we could add a foreign key to vsk_content table if needed:
-- ALTER TABLE vsk_quiz_completions 
-- ADD CONSTRAINT vsk_quiz_completions_quiz_id_fkey 
-- FOREIGN KEY (quiz_id) REFERENCES vsk_content(id) ON DELETE CASCADE;

-- But for now, let's remove the constraint entirely to allow flexible referencing
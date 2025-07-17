-- Fix quiz foreign key constraint for podcast episodes
-- The previous migration incorrectly referenced quiz_questions instead of vsk_quizzes

-- Drop the incorrect constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vsk_podcast_episodes_quiz_id_fkey' 
        AND table_name = 'vsk_podcast_episodes'
    ) THEN
        ALTER TABLE vsk_podcast_episodes DROP CONSTRAINT vsk_podcast_episodes_quiz_id_fkey;
    END IF;
END $$;

-- Add the correct foreign key constraint
ALTER TABLE vsk_podcast_episodes 
ADD CONSTRAINT vsk_podcast_episodes_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES vsk_quizzes(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN vsk_podcast_episodes.quiz_id IS 'Optional reference to associated quiz for this podcast episode';
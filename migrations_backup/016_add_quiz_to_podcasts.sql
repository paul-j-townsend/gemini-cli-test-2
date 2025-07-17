-- Add quiz relationship to podcast episodes
-- This allows each podcast episode to be associated with a quiz

-- Add quiz_id field to podcast episodes table
ALTER TABLE vsk_podcast_episodes 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES vsk_quizzes(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_quiz_id 
ON vsk_podcast_episodes(quiz_id);

-- Add comment for documentation
COMMENT ON COLUMN vsk_podcast_episodes.quiz_id IS 'Optional reference to associated quiz question for this podcast episode';
-- Quiz Tables Migration
-- Run these commands in Supabase SQL Editor

-- 1. Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    podcast_episode_id UUID,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    total_questions INTEGER DEFAULT 0,
    pass_percentage INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add quiz_id column to quiz_questions table
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS quiz_id UUID;

-- 3. Create foreign key constraint
ALTER TABLE public.quiz_questions 
ADD CONSTRAINT fk_quiz_questions_quiz_id 
FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- 4. Create quiz attempts summary table
CREATE TABLE IF NOT EXISTS public.quiz_attempts_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INTEGER,
    total_questions INTEGER,
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_taken_minutes INTEGER
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_podcast_episode_id ON public.quizzes(podcast_episode_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON public.quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_summary_quiz_id ON public.quiz_attempts_summary(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_summary_user_id ON public.quiz_attempts_summary(user_id);

-- 6. Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts_summary ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for quizzes (allow read access to all)
CREATE POLICY "Allow read access to quizzes" ON public.quizzes
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage quizzes" ON public.quizzes
    FOR ALL USING (auth.role() = 'authenticated');

-- 8. Create RLS policies for quiz attempts summary
CREATE POLICY "Users can view their own quiz summaries" ON public.quiz_attempts_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz summaries" ON public.quiz_attempts_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz summaries" ON public.quiz_attempts_summary
    FOR UPDATE USING (auth.uid() = user_id);

-- 9. Insert sample quiz data
INSERT INTO public.quizzes (title, description, category, difficulty, total_questions, pass_percentage)
VALUES (
    'Veterinary Ethics and Professional Practice',
    'Test your knowledge of ethical frameworks, professional boundaries, and decision-making in veterinary nursing practice.',
    'ethics',
    'medium',
    5,
    70
);

-- 10. Get the quiz ID and update existing questions
-- First, get the quiz ID
WITH quiz_data AS (
    SELECT id FROM public.quizzes WHERE title = 'Veterinary Ethics and Professional Practice' LIMIT 1
)
UPDATE public.quiz_questions 
SET quiz_id = (SELECT id FROM quiz_data)
WHERE category IN ('ethics', 'professional-practice', 'animal-welfare');

-- 11. Update the quiz total_questions count based on actual questions
UPDATE public.quizzes 
SET total_questions = (
    SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = quizzes.id
)
WHERE title = 'Veterinary Ethics and Professional Practice';

-- 12. Create a second quiz for companion animal care
INSERT INTO public.quizzes (title, description, category, difficulty, total_questions, pass_percentage)
VALUES (
    'Companion Animal Healthcare Fundamentals',
    'Essential knowledge for modern veterinary nursing practice.',
    'companion-animal-care',
    'medium',
    0,
    60
);

-- 13. Link podcast episodes to the ethics quiz
WITH quiz_data AS (
    SELECT id FROM public.quizzes WHERE title = 'Veterinary Ethics and Professional Practice' LIMIT 1
)
UPDATE public.vsk_podcast_episodes 
SET quiz_id = (SELECT id FROM quiz_data)
WHERE quiz_id IS NOT NULL;

-- 14. Verify the setup
SELECT 
    q.title as quiz_title,
    q.total_questions,
    COUNT(qq.id) as actual_questions
FROM public.quizzes q
LEFT JOIN public.quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title, q.total_questions
ORDER BY q.created_at;

-- Fix foreign key constraint for podcast episodes
-- The current constraint points to quiz_questions but should point to quizzes table

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE vsk_podcast_episodes 
DROP CONSTRAINT IF EXISTS vsk_podcast_episodes_quiz_id_fkey;

-- Now create the correct foreign key constraint pointing to quizzes table
ALTER TABLE vsk_podcast_episodes 
ADD CONSTRAINT vsk_podcast_episodes_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL;

-- Update any existing podcast episodes that have invalid quiz_id references
UPDATE vsk_podcast_episodes 
SET quiz_id = NULL 
WHERE quiz_id IS NOT NULL 
AND quiz_id NOT IN (SELECT id FROM quizzes); 
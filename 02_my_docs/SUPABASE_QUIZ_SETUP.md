# Supabase Quiz Tables Setup

Since the API cannot create tables directly in Supabase, you need to manually create the quiz tables through the Supabase dashboard.

## Manual Setup Instructions

### 1. Access Supabase Dashboard
- Go to [supabase.com](https://supabase.com)
- Navigate to your project
- Go to the "SQL Editor" tab

### 2. Create Quiz Tables

Run the following SQL commands in the SQL Editor:

```sql
-- Create quizzes table
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

-- Add quiz_id column to existing quiz_questions table
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS quiz_id UUID;

-- Create foreign key relationship
ALTER TABLE public.quiz_questions 
ADD CONSTRAINT fk_quiz_questions_quiz_id 
FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- Create quiz attempts summary table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_podcast_episode_id ON public.quizzes(podcast_episode_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON public.quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_summary_quiz_id ON public.quiz_attempts_summary(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_summary_user_id ON public.quiz_attempts_summary(user_id);

-- Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quizzes
CREATE POLICY "Allow read access to quizzes" ON public.quizzes
    FOR SELECT USING (true);

-- Create RLS policies for quiz attempts summary
CREATE POLICY "Users can view their own quiz summaries" ON public.quiz_attempts_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz summaries" ON public.quiz_attempts_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz summaries" ON public.quiz_attempts_summary
    FOR UPDATE USING (auth.uid() = user_id);
```

### 3. Create Sample Data

After creating the tables, create some sample quiz data:

```sql
-- Insert a sample quiz
INSERT INTO public.quizzes (title, description, category, difficulty, total_questions, pass_percentage)
VALUES (
    'Veterinary Ethics and Professional Practice',
    'Test your knowledge of ethical frameworks, professional boundaries, and decision-making in veterinary nursing practice.',
    'ethics',
    'medium',
    2,
    70
);

-- Get the quiz ID and update existing questions
-- First, get the quiz ID
SELECT id FROM public.quizzes WHERE title = 'Veterinary Ethics and Professional Practice';

-- Update existing questions to belong to this quiz (replace the UUID with the actual quiz ID from above)
UPDATE public.quiz_questions 
SET quiz_id = 'YOUR_QUIZ_ID_HERE'
WHERE category IN ('ethics', 'professional-practice', 'animal-welfare');

-- Update podcast episodes to link to the new quiz (replace with actual quiz ID)
UPDATE public.vsk_podcast_episodes 
SET quiz_id = 'YOUR_QUIZ_ID_HERE'
WHERE quiz_id IS NOT NULL OR id IN (
    SELECT id FROM public.vsk_podcast_episodes LIMIT 1
);
```

## Current Status

**The application is currently working with a virtual quiz system** that:
- Uses existing `quiz_questions` table
- Groups questions by category to create virtual multi-question quizzes
- Works through the `/api/quiz-questions-by-category` endpoint

## Features Available Now

✅ **Multi-question quizzes** - Groups questions by category  
✅ **Progress tracking** - Shows current question number  
✅ **Score calculation** - Tracks correct/incorrect answers  
✅ **Results summary** - Shows final score and pass/fail  
✅ **Question navigation** - Next question flow  
✅ **Answer explanations** - Detailed feedback  

## After Manual Table Setup

Once you create the tables manually, you can:
- Use the full quiz management system
- Create proper quiz-to-question relationships
- Track comprehensive quiz attempts
- Link quizzes directly to podcast episodes
- Use all the new API endpoints (`/api/quizzes`, `/api/quiz-attempts-summary`, etc.)

## Testing

You can test the current virtual quiz system at:
- `http://localhost:3000/podcasts` - Take multi-question quizzes inline
- `http://localhost:3000/api/quiz-questions-by-category?id=efdc3fe7-a0e3-4767-af79-35261ebb8c17` - API test 
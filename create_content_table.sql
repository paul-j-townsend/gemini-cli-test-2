-- Create vsk_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS vsk_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_src TEXT,
  full_audio_src TEXT,
  image_url TEXT,
  thumbnail_path TEXT,
  duration INTEGER,
  episode_number INTEGER,
  season INTEGER DEFAULT 1,
  slug TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  category TEXT,
  tags TEXT[],
  show_notes TEXT,
  transcript TEXT,
  file_size INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  quiz_title TEXT,
  quiz_description TEXT,
  quiz_category TEXT,
  pass_percentage INTEGER DEFAULT 80,
  total_questions INTEGER DEFAULT 0,
  quiz_is_active BOOLEAN DEFAULT true,
  series_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vsk_content_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS vsk_content_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES vsk_content(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  explanation TEXT,
  rationale TEXT,
  learning_outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, question_number)
);

-- Create vsk_content_question_answers table if it doesn't exist
CREATE TABLE IF NOT EXISTS vsk_content_question_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES vsk_content_questions(id) ON DELETE CASCADE,
  answer_letter TEXT NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, answer_letter)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('images', 'images', true),
  ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_content_slug ON vsk_content(slug);
CREATE INDEX IF NOT EXISTS idx_vsk_content_published ON vsk_content(is_published);
CREATE INDEX IF NOT EXISTS idx_vsk_content_episode_number ON vsk_content(episode_number);
CREATE INDEX IF NOT EXISTS idx_vsk_content_questions_content_id ON vsk_content_questions(content_id);
CREATE INDEX IF NOT EXISTS idx_vsk_content_question_answers_question_id ON vsk_content_question_answers(question_id);

-- Enable Row Level Security
ALTER TABLE vsk_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_question_answers ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
DROP POLICY IF EXISTS "Allow all operations" ON vsk_content;
CREATE POLICY "Allow all operations" ON vsk_content FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON vsk_content_questions;
CREATE POLICY "Allow all operations" ON vsk_content_questions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON vsk_content_question_answers;
CREATE POLICY "Allow all operations" ON vsk_content_question_answers FOR ALL USING (true);

-- Create storage policies for images bucket
CREATE POLICY "Allow public image uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow public image downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Allow public image updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow public image deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'images');

-- Create storage policies for audio bucket
CREATE POLICY "Allow public audio uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Allow public audio downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Allow public audio updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'audio') WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Allow public audio deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'audio');

-- Create user content progress table
CREATE TABLE IF NOT EXISTS vsk_user_content_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    
    -- Progress tracking
    has_listened BOOLEAN DEFAULT false,
    listen_progress_percentage INTEGER DEFAULT 0 CHECK (listen_progress_percentage >= 0 AND listen_progress_percentage <= 100),
    listened_at TIMESTAMP WITH TIME ZONE,
    
    quiz_completed BOOLEAN DEFAULT false,
    quiz_completed_at TIMESTAMP WITH TIME ZONE,
    
    report_downloaded BOOLEAN DEFAULT false,
    report_downloaded_at TIMESTAMP WITH TIME ZONE,
    
    certificate_downloaded BOOLEAN DEFAULT false,
    certificate_downloaded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per content
    UNIQUE(user_id, content_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vsk_user_content_progress_user_id ON vsk_user_content_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_user_content_progress_content_id ON vsk_user_content_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_vsk_user_content_progress_has_listened ON vsk_user_content_progress(has_listened);
CREATE INDEX IF NOT EXISTS idx_vsk_user_content_progress_quiz_completed ON vsk_user_content_progress(quiz_completed);

-- Enable Row Level Security for progress table
ALTER TABLE vsk_user_content_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for progress table
CREATE POLICY "Users can view their own progress" ON vsk_user_content_progress
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own progress" ON vsk_user_content_progress
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own progress" ON vsk_user_content_progress
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow service role to do everything on progress table
CREATE POLICY "Service role can do everything on progress" ON vsk_user_content_progress
    FOR ALL USING (auth.role() = 'service_role');
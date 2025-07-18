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
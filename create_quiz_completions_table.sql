-- Create vsk_quiz_completions table
CREATE TABLE IF NOT EXISTS vsk_quiz_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  time_spent INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answers JSONB DEFAULT '[]'::jsonb,
  passed BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_user_id ON vsk_quiz_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_quiz_id ON vsk_quiz_completions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_user_quiz ON vsk_quiz_completions(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_passed ON vsk_quiz_completions(passed);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_completed_at ON vsk_quiz_completions(completed_at);

-- Enable Row Level Security
ALTER TABLE vsk_quiz_completions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
DROP POLICY IF EXISTS "Allow all operations" ON vsk_quiz_completions;
CREATE POLICY "Allow all operations" ON vsk_quiz_completions FOR ALL USING (true);

-- Create vsk_users table if it doesn't exist (needed for foreign key)
CREATE TABLE IF NOT EXISTS vsk_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security on users table
ALTER TABLE vsk_users ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
DROP POLICY IF EXISTS "Allow all operations" ON vsk_users;
CREATE POLICY "Allow all operations" ON vsk_users FOR ALL USING (true);

-- Create vsk_user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS vsk_user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_score INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on user progress table
ALTER TABLE vsk_user_progress ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
DROP POLICY IF EXISTS "Allow all operations" ON vsk_user_progress;
CREATE POLICY "Allow all operations" ON vsk_user_progress FOR ALL USING (true);

-- Create indexes for user progress
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_user_id ON vsk_user_progress(user_id);

-- Create vsk_quiz_attempts table for attempt tracking
CREATE TABLE IF NOT EXISTS vsk_quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  passed BOOLEAN DEFAULT false,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on quiz attempts table
ALTER TABLE vsk_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
DROP POLICY IF EXISTS "Allow all operations" ON vsk_quiz_attempts;
CREATE POLICY "Allow all operations" ON vsk_quiz_attempts FOR ALL USING (true);

-- Create indexes for quiz attempts
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_attempts_user_id ON vsk_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_attempts_quiz_id ON vsk_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_attempts_user_quiz ON vsk_quiz_attempts(user_id, quiz_id);
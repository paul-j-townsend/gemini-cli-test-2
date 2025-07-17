-- Migration: Create all VSK tables for comprehensive system
-- Date: 2025-07-06
-- Description: Complete database schema for VSK application including quizzes, podcasts, articles, and user progress

-- =============================================================================
-- 0. VSK_USERS TABLE (drop and recreate to ensure correct schema)
-- =============================================================================
DROP TABLE IF EXISTS vsk_users CASCADE;

CREATE TABLE vsk_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'editor', 'user', 'viewer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}'
);

-- =============================================================================
-- 1. VSK_QUIZZES TABLE
-- =============================================================================
DROP TABLE IF EXISTS vsk_quizzes CASCADE;

CREATE TABLE vsk_quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    pass_percentage INTEGER DEFAULT 70 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
    total_questions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. VSK_QUIZ_QUESTIONS TABLE
-- =============================================================================
DROP TABLE IF EXISTS vsk_quiz_questions CASCADE;

CREATE TABLE vsk_quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES vsk_quizzes(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT,
    rationale TEXT,
    learning_outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(quiz_id, question_number)
);

-- =============================================================================
-- 3. VSK_QUESTION_ANSWERS TABLE
-- =============================================================================
DROP TABLE IF EXISTS vsk_question_answers CASCADE;

CREATE TABLE vsk_question_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES vsk_quiz_questions(id) ON DELETE CASCADE,
    answer_letter TEXT NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, answer_letter)
);

-- =============================================================================
-- 4. VSK_QUIZ_COMPLETIONS TABLE
-- =============================================================================
DROP TABLE IF EXISTS vsk_quiz_completions CASCADE;

CREATE TABLE vsk_quiz_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES vsk_users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES vsk_quizzes(id) ON DELETE CASCADE,
    podcast_id UUID, -- Optional reference to podcast episodes
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    time_spent INTEGER NOT NULL DEFAULT 0, -- Time in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers JSONB NOT NULL DEFAULT '[]', -- Array of answer objects
    passed BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 5. VSK_USER_PROGRESS TABLE
-- =============================================================================
DROP TABLE IF EXISTS vsk_user_progress CASCADE;

CREATE TABLE vsk_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES vsk_users(id) ON DELETE CASCADE, -- One progress record per user
    total_quizzes_completed INTEGER NOT NULL DEFAULT 0,
    total_quizzes_passed INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    total_max_score INTEGER NOT NULL DEFAULT 0,
    average_score INTEGER NOT NULL DEFAULT 0,
    total_time_spent INTEGER NOT NULL DEFAULT 0, -- Time in seconds
    completion_rate INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    streak_days INTEGER NOT NULL DEFAULT 0,
    badges JSONB NOT NULL DEFAULT '[]', -- Array of badge objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 6. VSK_PODCAST_EPISODES TABLE
-- =============================================================================
DROP TABLE IF EXISTS vsk_podcast_episodes CASCADE;

CREATE TABLE vsk_podcast_episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    audio_src TEXT, -- Preview/short version audio URL
    full_audio_src TEXT, -- Full version audio URL
    image_url TEXT,
    thumbnail_path TEXT,
    duration INTEGER, -- Duration in seconds
    episode_number INTEGER,
    season INTEGER,
    slug TEXT UNIQUE,
    quiz_id UUID REFERENCES vsk_quizzes(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 7. VSK_ARTICLES TABLE
-- =============================================================================
DROP TABLE IF EXISTS vsk_articles CASCADE;

CREATE TABLE vsk_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author TEXT,
    image_url TEXT,
    keywords TEXT[], -- Array of keywords
    category TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 8. VSK_VALID_KEYWORDS TABLE
-- =============================================================================
DROP TABLE IF EXISTS vsk_valid_keywords CASCADE;

CREATE TABLE vsk_valid_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_vsk_users_email ON vsk_users(email);
CREATE INDEX IF NOT EXISTS idx_vsk_users_role ON vsk_users(role);
CREATE INDEX IF NOT EXISTS idx_vsk_users_status ON vsk_users(status);

-- Quiz completion indexes
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_user_id ON vsk_quiz_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_quiz_id ON vsk_quiz_completions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_podcast_id ON vsk_quiz_completions(podcast_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_passed ON vsk_quiz_completions(passed);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_completions_completed_at ON vsk_quiz_completions(completed_at);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_user_id ON vsk_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_total_quizzes_completed ON vsk_user_progress(total_quizzes_completed);
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_average_score ON vsk_user_progress(average_score);
CREATE INDEX IF NOT EXISTS idx_vsk_user_progress_last_activity_at ON vsk_user_progress(last_activity_at);

-- Quiz question indexes
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_questions_quiz_id ON vsk_quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_vsk_quiz_questions_question_number ON vsk_quiz_questions(question_number);

-- Question answer indexes
CREATE INDEX IF NOT EXISTS idx_vsk_question_answers_question_id ON vsk_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_vsk_question_answers_is_correct ON vsk_question_answers(is_correct);

-- Podcast episode indexes
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_quiz_id ON vsk_podcast_episodes(quiz_id);
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_published_at ON vsk_podcast_episodes(published_at);
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_is_published ON vsk_podcast_episodes(is_published);
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_slug ON vsk_podcast_episodes(slug);

-- Article indexes
CREATE INDEX IF NOT EXISTS idx_vsk_articles_slug ON vsk_articles(slug);
CREATE INDEX IF NOT EXISTS idx_vsk_articles_status ON vsk_articles(status);
CREATE INDEX IF NOT EXISTS idx_vsk_articles_published_at ON vsk_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_vsk_articles_category ON vsk_articles(category);
CREATE INDEX IF NOT EXISTS idx_vsk_articles_keywords ON vsk_articles USING GIN(keywords);

-- Keyword indexes
CREATE INDEX IF NOT EXISTS idx_vsk_valid_keywords_keyword ON vsk_valid_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_vsk_valid_keywords_category ON vsk_valid_keywords(category);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE vsk_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_quiz_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_valid_keywords ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read access to users" ON vsk_users FOR SELECT USING (true);
CREATE POLICY "Allow read access to quizzes" ON vsk_quizzes FOR SELECT USING (true);
CREATE POLICY "Allow read access to quiz questions" ON vsk_quiz_questions FOR SELECT USING (true);
CREATE POLICY "Allow read access to question answers" ON vsk_question_answers FOR SELECT USING (true);
CREATE POLICY "Allow read access to quiz completions" ON vsk_quiz_completions FOR SELECT USING (true);
CREATE POLICY "Allow read access to user progress" ON vsk_user_progress FOR SELECT USING (true);
CREATE POLICY "Allow read access to podcast episodes" ON vsk_podcast_episodes FOR SELECT USING (true);
CREATE POLICY "Allow read access to articles" ON vsk_articles FOR SELECT USING (true);
CREATE POLICY "Allow read access to valid keywords" ON vsk_valid_keywords FOR SELECT USING (true);

-- Allow full access for authenticated users (can be restricted later)
CREATE POLICY "Allow all operations on users" ON vsk_users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations on quizzes" ON vsk_quizzes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations on quiz questions" ON vsk_quiz_questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations on question answers" ON vsk_question_answers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations on quiz completions" ON vsk_quiz_completions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations on user progress" ON vsk_user_progress FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations on podcast episodes" ON vsk_podcast_episodes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations on articles" ON vsk_articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations on valid keywords" ON vsk_valid_keywords FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- SAMPLE DATA INSERTION
-- =============================================================================

-- Insert sample users
INSERT INTO vsk_users (id, email, name, role, status, email_verified, last_login_at) 
VALUES 
    ('fed2a63e-196d-43ff-9ebc-674db34e72a7', 'admin@vetsidekick.com', 'Super Admin', 'super_admin', 'active', true, NOW()),
    ('550e8400-e29b-41d4-a716-446655440099', 'editor@vetsidekick.com', 'Content Editor', 'editor', 'active', true, NOW()),
    ('550e8400-e29b-41d4-a716-446655440098', 'user@vetsidekick.com', 'Test User', 'user', 'active', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz
INSERT INTO vsk_quizzes (id, title, description, category, pass_percentage, total_questions, is_active) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Veterinary Ethics Quiz', 'Test your knowledge of veterinary ethics and professional practice', 'ethics', 70, 2, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz questions
INSERT INTO vsk_quiz_questions (id, quiz_id, question_number, question_text, explanation, rationale, learning_outcome)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 1, 
     'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
     'This question tests understanding of the four core principles of biomedical ethics.',
     'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.',
     'Analyze ethical dilemmas using established ethical frameworks'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 2,
     'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
     'This question tests knowledge of professional boundaries and legal scope of practice.',
     'Schedule 3 permits RVNs to administer medicines (oral, topical, subcutaneous, intramuscular, intravenous) under veterinary direction, but does not permit independent diagnosis, prescribing, or major surgery.',
     'Demonstrate understanding of professional boundaries and scope of practice')
ON CONFLICT (id) DO NOTHING;

-- Insert sample answers for question 1
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'A', 'Autonomy', false),
    ('550e8400-e29b-41d4-a716-446655440001', 'B', 'Beneficence', true),
    ('550e8400-e29b-41d4-a716-446655440001', 'C', 'Non-maleficence', false),
    ('550e8400-e29b-41d4-a716-446655440001', 'D', 'Justice', false)
ON CONFLICT (question_id, answer_letter) DO NOTHING;

-- Insert sample answers for question 2
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440002', 'A', 'Diagnosing medical conditions independently', false),
    ('550e8400-e29b-41d4-a716-446655440002', 'B', 'Prescribing prescription-only medicines', false),
    ('550e8400-e29b-41d4-a716-446655440002', 'C', 'Administering medicines under veterinary direction', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'D', 'Performing major surgery involving body cavities', false)
ON CONFLICT (question_id, answer_letter) DO NOTHING;

-- Insert sample podcast episode
INSERT INTO vsk_podcast_episodes (id, title, description, audio_src, full_audio_src, episode_number, quiz_id, is_published)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', 'Ethics in Veterinary Practice', 'An introduction to ethical considerations in veterinary nursing', 
     '/audio/ethics-preview.mp3', '/audio/ethics-full.mp3', 1, '550e8400-e29b-41d4-a716-446655440000', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample article
INSERT INTO vsk_articles (id, title, slug, content, excerpt, author, category, status, published_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440020', 'Introduction to Veterinary Ethics', 'intro-veterinary-ethics',
     'Veterinary ethics forms the foundation of professional practice...', 
     'Learn the fundamental principles of veterinary ethics and their practical applications.',
     'Dr. Sarah Johnson', 'ethics', 'published', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample keywords
INSERT INTO vsk_valid_keywords (keyword, description, category)
VALUES 
    ('ethics', 'Professional ethics and moral considerations', 'professional'),
    ('veterinary', 'Related to veterinary medicine and practice', 'medical'),
    ('nursing', 'Veterinary nursing and care procedures', 'medical'),
    ('legislation', 'Laws and regulations governing veterinary practice', 'legal'),
    ('professional-practice', 'Standards and guidelines for professional conduct', 'professional')
ON CONFLICT (keyword) DO NOTHING;

-- =============================================================================
-- TABLE COMMENTS
-- =============================================================================
COMMENT ON TABLE vsk_users IS 'User accounts and authentication data';
COMMENT ON TABLE vsk_quizzes IS 'Quiz definitions and metadata';
COMMENT ON TABLE vsk_quiz_questions IS 'Individual questions within quizzes';
COMMENT ON TABLE vsk_question_answers IS 'Multiple choice answers for quiz questions';
COMMENT ON TABLE vsk_quiz_completions IS 'Comprehensive quiz completion tracking with detailed answers and progress metrics';
COMMENT ON TABLE vsk_user_progress IS 'Track user progress, statistics, and achievements across all quizzes';
COMMENT ON TABLE vsk_podcast_episodes IS 'Podcast episodes with associated quizzes and metadata';
COMMENT ON TABLE vsk_articles IS 'Article content and metadata for the knowledge base';
COMMENT ON TABLE vsk_valid_keywords IS 'Valid keywords for categorizing and tagging content';

-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
    -- Verify all tables were created
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_users') THEN
        RAISE EXCEPTION 'ERROR: vsk_users table was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_quizzes') THEN
        RAISE EXCEPTION 'ERROR: vsk_quizzes table was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_quiz_questions') THEN
        RAISE EXCEPTION 'ERROR: vsk_quiz_questions table was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_question_answers') THEN
        RAISE EXCEPTION 'ERROR: vsk_question_answers table was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_quiz_completions') THEN
        RAISE EXCEPTION 'ERROR: vsk_quiz_completions table was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_user_progress') THEN
        RAISE EXCEPTION 'ERROR: vsk_user_progress table was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_podcast_episodes') THEN
        RAISE EXCEPTION 'ERROR: vsk_podcast_episodes table was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_articles') THEN
        RAISE EXCEPTION 'ERROR: vsk_articles table was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vsk_valid_keywords') THEN
        RAISE EXCEPTION 'ERROR: vsk_valid_keywords table was not created';
    END IF;
    
    RAISE NOTICE 'SUCCESS: All VSK tables have been created successfully';
    RAISE NOTICE 'Tables created: vsk_users, vsk_quizzes, vsk_quiz_questions, vsk_question_answers, vsk_quiz_completions, vsk_user_progress, vsk_podcast_episodes, vsk_articles, vsk_valid_keywords';
    RAISE NOTICE 'Sample data inserted for testing';
END $$;
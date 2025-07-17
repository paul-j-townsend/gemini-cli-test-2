-- ===================================================================
-- REDESIGNED QUIZ DATABASE STRUCTURE
-- ===================================================================
-- This creates a proper MCQ (Multiple Choice Question) structure:
-- 
-- quizzes (main quiz container)
--   └── quiz_questions (questions in each quiz)
--       └── question_answers (multiple choice options for each question)
--
-- ===================================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_attempts_summary CASCADE;
DROP TABLE IF EXISTS question_answers CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;

-- ===================================================================
-- 1. QUIZZES TABLE (Main quiz container)
-- ===================================================================
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    time_limit_minutes INTEGER DEFAULT 30,
    pass_percentage INTEGER DEFAULT 70 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
    total_questions INTEGER DEFAULT 0, -- Will be calculated from questions count
    is_active BOOLEAN DEFAULT true,
    podcast_episode_id UUID, -- Optional link to podcast episode
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- User who created the quiz
);

-- ===================================================================
-- 2. QUIZ_QUESTIONS TABLE (Questions belonging to a quiz)
-- ===================================================================
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL, -- Order within the quiz (1, 2, 3, etc.)
    question_text TEXT NOT NULL,
    explanation TEXT, -- Learning outcome/explanation after answering
    points INTEGER DEFAULT 1, -- Points awarded for correct answer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique question numbers within each quiz
    UNIQUE(quiz_id, question_number)
);

-- ===================================================================
-- 3. QUESTION_ANSWERS TABLE (Multiple choice options for each question)
-- ===================================================================
CREATE TABLE question_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_letter CHAR(1) NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique answer letters within each question
    UNIQUE(question_id, answer_letter)
);

-- ===================================================================
-- 4. QUIZ_ATTEMPTS TABLE (Individual question attempts)
-- ===================================================================
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    user_id UUID, -- Can be null for anonymous users
    selected_answer_id UUID REFERENCES question_answers(id),
    selected_answer_letter CHAR(1),
    is_correct BOOLEAN,
    attempt_number INTEGER DEFAULT 1, -- Allow multiple attempts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 5. QUIZ_SESSIONS TABLE (Overall quiz completion tracking)
-- ===================================================================
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID, -- Can be null for anonymous users
    session_id VARCHAR(100), -- For anonymous tracking
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    score_percentage DECIMAL(5,2) DEFAULT 0,
    time_taken_seconds INTEGER,
    passed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- SAMPLE DATA FOR TESTING
-- ===================================================================

-- Sample Quiz 1: Veterinary Ethics
INSERT INTO quizzes (id, title, description, category, difficulty, pass_percentage, podcast_episode_id) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Veterinary Ethics Fundamentals',
    'Test your knowledge of core ethical principles in veterinary practice',
    'Ethics',
    'beginner',
    70,
    '665dfab3-b203-4181-9483-479e7528c0ed'
);

-- Questions for Quiz 1
INSERT INTO quiz_questions (id, quiz_id, question_number, question_text, explanation) VALUES
(
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    'What is the primary ethical principle that guides veterinary decision-making when animal welfare conflicts with owner wishes?',
    'The welfare of the animal is the primary consideration in veterinary ethics, even when it conflicts with owner preferences.'
),
(
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440001',
    2,
    'In veterinary practice, what is the most appropriate response when an owner requests a procedure that could harm their animal?',
    'Veterinarians have a professional obligation to refuse procedures that could cause unnecessary harm to animals.'
);

-- Answers for Question 1
INSERT INTO question_answers (question_id, answer_letter, answer_text, is_correct) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'A', 'Always follow the owner''s wishes', false),
('550e8400-e29b-41d4-a716-446655440101', 'B', 'Animal welfare takes precedence', true),
('550e8400-e29b-41d4-a716-446655440101', 'C', 'Compromise between both interests', false),
('550e8400-e29b-41d4-a716-446655440101', 'D', 'Refer to another veterinarian', false);

-- Answers for Question 2
INSERT INTO question_answers (question_id, answer_letter, answer_text, is_correct) VALUES
('550e8400-e29b-41d4-a716-446655440102', 'A', 'Perform the procedure if paid well', false),
('550e8400-e29b-41d4-a716-446655440102', 'B', 'Refuse and explain the ethical concerns', true),
('550e8400-e29b-41d4-a716-446655440102', 'C', 'Perform a modified version', false),
('550e8400-e29b-41d4-a716-446655440102', 'D', 'Get a second opinion first', false);

-- Sample Quiz 2: Animal Nutrition
INSERT INTO quizzes (id, title, description, category, difficulty, pass_percentage) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'Small Animal Nutrition Basics',
    'Essential nutrition knowledge for companion animal care',
    'Nutrition',
    'intermediate',
    75
);

-- Questions for Quiz 2
INSERT INTO quiz_questions (id, quiz_id, question_number, question_text, explanation) VALUES
(
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440002',
    1,
    'Which nutrient class provides the most concentrated source of energy for dogs and cats?',
    'Fats provide more than twice the energy per gram compared to proteins or carbohydrates.'
);

-- Answers for Nutrition Question 1
INSERT INTO question_answers (question_id, answer_letter, answer_text, is_correct) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'A', 'Proteins', false),
('550e8400-e29b-41d4-a716-446655440201', 'B', 'Carbohydrates', false),
('550e8400-e29b-41d4-a716-446655440201', 'C', 'Fats', true),
('550e8400-e29b-41d4-a716-446655440201', 'D', 'Vitamins', false);
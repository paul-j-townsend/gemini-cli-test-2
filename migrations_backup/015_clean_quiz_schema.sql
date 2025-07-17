-- Clean Quiz Schema Migration
-- Drop all existing quiz tables and create clean structure

-- Drop existing tables in correct order (foreign keys first)
DROP TABLE IF EXISTS question_attempts CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS mcq_answers CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;

-- Create main quizzes table
CREATE TABLE quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    total_questions INTEGER DEFAULT 0,
    pass_percentage INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz questions table
CREATE TABLE quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_number INTEGER,
    title TEXT,
    learning_outcome TEXT,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- [{"label": "A", "text": "Answer text"}, ...]
    correct_answer_label TEXT NOT NULL,
    correct_answer_text TEXT NOT NULL,
    rationale TEXT,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz attempts table
CREATE TABLE quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID,
    score INTEGER,
    total_questions INTEGER,
    passed BOOLEAN,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question attempts table  
CREATE TABLE question_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_answer_label TEXT,
    selected_answer_text TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_question_attempts_quiz_attempt_id ON question_attempts(quiz_attempt_id);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow read access to quizzes and questions
CREATE POLICY "Allow read access to quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Allow read access to quiz questions" ON quiz_questions FOR SELECT USING (true);

-- Allow admin to manage quizzes and questions
CREATE POLICY "Allow admin to manage quizzes" ON quizzes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to manage quiz questions" ON quiz_questions FOR ALL USING (auth.role() = 'authenticated');

-- Users can manage their own attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own question attempts" ON question_attempts FOR SELECT USING (auth.uid() = (SELECT user_id FROM quiz_attempts WHERE id = quiz_attempt_id));
CREATE POLICY "Users can insert their own question attempts" ON question_attempts FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM quiz_attempts WHERE id = quiz_attempt_id));

-- Insert sample quiz
INSERT INTO quizzes (title, description, category, difficulty, total_questions, pass_percentage) VALUES
('Veterinary Ethics Quiz', 'Test your knowledge of veterinary ethics and professional practice', 'ethics', 'medium', 2, 70);

-- Insert sample questions
INSERT INTO quiz_questions (
    quiz_id, question_number, title, learning_outcome, question, options, 
    correct_answer_label, correct_answer_text, rationale, category, difficulty
) VALUES
(
    (SELECT id FROM quizzes WHERE title = 'Veterinary Ethics Quiz'),
    1,
    'Ethical Framework Application',
    'Analyze ethical dilemmas using established ethical frameworks',
    'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
    '[
        {"label": "A", "text": "Autonomy"},
        {"label": "B", "text": "Beneficence"},
        {"label": "C", "text": "Non-maleficence"},
        {"label": "D", "text": "Justice"}
    ]',
    'B',
    'Beneficence',
    'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.',
    'ethics',
    'medium'
),
(
    (SELECT id FROM quizzes WHERE title = 'Veterinary Ethics Quiz'),
    2,
    'Professional Boundaries',
    'Demonstrate understanding of professional boundaries and scope of practice',
    'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
    '[
        {"label": "A", "text": "Diagnosing medical conditions independently"},
        {"label": "B", "text": "Prescribing prescription-only medicines"},
        {"label": "C", "text": "Administering medicines under veterinary direction"},
        {"label": "D", "text": "Performing major surgery involving body cavities"}
    ]',
    'C',
    'Administering medicines under veterinary direction',
    'Schedule 3 permits RVNs to administer medicines (oral, topical, subcutaneous, intramuscular, intravenous) under veterinary direction, but does not permit independent diagnosis, prescribing, or major surgery.',
    'professional-practice',
    'medium'
);
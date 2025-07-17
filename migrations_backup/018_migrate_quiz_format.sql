-- Migration to update quiz_questions table to new format
-- This handles the transition from old format to new format

-- First, drop existing table and recreate with new structure
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;

-- Create quiz questions table with new format
CREATE TABLE quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_number INTEGER,
    title TEXT NOT NULL,
    learning_outcome TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of answer options with labels (A, B, C, D)
    correct_answer_label TEXT NOT NULL, -- Label of correct answer (A, B, C, D)
    correct_answer_text TEXT NOT NULL, -- Full text of correct answer
    rationale TEXT NOT NULL, -- Detailed explanation of why this answer is correct
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create quiz attempts table for tracking user responses
CREATE TABLE quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Future user system integration
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_answer_label TEXT, -- A, B, C, or D
    selected_answer_text TEXT, -- Full text of selected answer
    is_correct BOOLEAN,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_questions_question_number ON quiz_questions(question_number);
CREATE INDEX idx_quiz_attempts_question_id ON quiz_attempts(question_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_questions (allow read access to all, admin for write)
CREATE POLICY "Allow read access to quiz questions" ON quiz_questions
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage quiz questions" ON quiz_questions
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for quiz_attempts (users can only see their own attempts)
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample quiz questions in the new format
INSERT INTO quiz_questions (
    question_number, title, learning_outcome, question, options, 
    correct_answer_label, correct_answer_text, rationale, category, difficulty
) VALUES
(
    1,
    'Ethical Framework Application',
    'Analyze ethical dilemmas using established ethical frameworks relevant to veterinary nursing practice',
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
    2,
    'Professional Boundaries',
    'Demonstrate understanding of professional boundaries and scope of practice within the veterinary team',
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
),
(
    3,
    'Ethical Decision-Making Process',
    'Apply ethical decision-making processes when faced with conflicts between client wishes and animal welfare',
    'A client refuses pain medication for their post-operative cat due to cost concerns. Using the Fraser Model for ethical decision-making, what should be the RVN''s first step?',
    '[
        {"label": "A", "text": "Immediately report the client to animal welfare authorities"},
        {"label": "B", "text": "Identify the ethical issue and gather relevant facts"},
        {"label": "C", "text": "Override the client''s decision and administer pain relief"},
        {"label": "D", "text": "Document that the client refused treatment and take no further action"}
    ]',
    'B',
    'Identify the ethical issue and gather relevant facts',
    'The Fraser Model begins with identifying the ethical issue (conflict between client autonomy and animal welfare) and gathering relevant facts about pain management options, costs, and alternatives before proceeding with further steps.',
    'ethics',
    'medium'
),
(
    4,
    'Animal Welfare Advocacy',
    'Justify advocacy actions for animal welfare while maintaining professional relationships',
    'When advocating for an animal''s welfare needs with a reluctant client, which approach best maintains professional relationships while ensuring animal welfare?',
    '[
        {"label": "A", "text": "Threaten to report the client unless they comply immediately"},
        {"label": "B", "text": "Provide evidence-based information and explore alternative solutions"},
        {"label": "C", "text": "Accept the client''s decision without question to avoid conflict"},
        {"label": "D", "text": "Refuse to provide any further services to the client"}
    ]',
    'B',
    'Provide evidence-based information and explore alternative solutions',
    'Effective advocacy involves educating clients with evidence-based information while exploring alternatives that meet both animal welfare needs and client circumstances, maintaining professional relationships while prioritizing animal welfare.',
    'animal-welfare',
    'medium'
),
(
    5,
    'Personal Values and Professional Practice',
    'Evaluate personal values and biases that may influence professional decision-making',
    'An RVN personally opposes euthanasia but is asked to assist with a medically justified euthanasia procedure. What is the most appropriate professional response?',
    '[
        {"label": "A", "text": "Refuse to participate and leave the room immediately"},
        {"label": "B", "text": "Express personal disagreement with the decision to the client"},
        {"label": "C", "text": "Recognize personal bias and provide professional support or arrange appropriate coverage"},
        {"label": "D", "text": "Participate reluctantly while making disapproval obvious"}
    ]',
    'C',
    'Recognize personal bias and provide professional support or arrange appropriate coverage',
    'Professional practice requires recognizing personal values and biases, then ensuring patient care is not compromised. The RVN should either provide professional support despite personal views or arrange appropriate colleague coverage while maintaining professionalism.',
    'professional-practice',
    'medium'
);

-- Migration to support multi-question quizzes
-- Create a new quizzes table to group multiple questions

CREATE TABLE IF NOT EXISTS quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    podcast_episode_id UUID, -- Link to podcast episode
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    total_questions INTEGER DEFAULT 0,
    pass_percentage INTEGER DEFAULT 70, -- Percentage needed to pass
    time_limit_minutes INTEGER, -- Optional time limit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_podcast_episode_id ON quizzes(podcast_episode_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Enable Row Level Security (RLS) for quizzes table
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies for quizzes (allow read access to all)
CREATE POLICY "Allow read access to quizzes" ON quizzes
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage quizzes" ON quizzes
    FOR ALL USING (auth.role() = 'authenticated');

-- Create quiz attempts summary table to track overall quiz completion
CREATE TABLE IF NOT EXISTS quiz_attempts_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Future user system integration
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER, -- Number of correct answers
    total_questions INTEGER,
    percentage DECIMAL(5,2), -- Calculated percentage score
    passed BOOLEAN, -- Whether they passed based on pass_percentage
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_taken_minutes INTEGER
);

-- Create indexes for quiz attempts summary
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_summary_quiz_id ON quiz_attempts_summary(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_summary_user_id ON quiz_attempts_summary(user_id);

-- Enable RLS for quiz attempts summary
ALTER TABLE quiz_attempts_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz attempts summary
CREATE POLICY "Users can view their own quiz summaries" ON quiz_attempts_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz summaries" ON quiz_attempts_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz summaries" ON quiz_attempts_summary
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample quizzes and reorganize existing questions
-- First, create a sample quiz for veterinary ethics
INSERT INTO quizzes (title, description, category, difficulty, total_questions, pass_percentage)
VALUES (
    'Veterinary Ethics and Professional Practice',
    'Test your knowledge of ethical frameworks, professional boundaries, and decision-making in veterinary nursing practice.',
    'ethics',
    'medium',
    5,
    70
);

-- Get the quiz ID and update existing questions to belong to this quiz
-- (This would normally be done programmatically, but for the migration we'll use a subquery)
UPDATE quiz_questions 
SET quiz_id = (SELECT id FROM quizzes WHERE title = 'Veterinary Ethics and Professional Practice' LIMIT 1)
WHERE category IN ('ethics', 'professional-practice', 'animal-welfare');

-- Update the quiz total_questions count
UPDATE quizzes 
SET total_questions = (
    SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = quizzes.id
)
WHERE title = 'Veterinary Ethics and Professional Practice';

-- Create a sample quiz specifically for podcast episodes
INSERT INTO quizzes (title, description, category, difficulty, total_questions, pass_percentage)
VALUES (
    'Companion Animal Healthcare Fundamentals',
    'Essential knowledge for modern veterinary nursing practice based on the latest episodes.',
    'companion-animal-care',
    'medium',
    3,
    60
);

-- Add some additional questions for the podcast quiz
INSERT INTO quiz_questions (
    quiz_id, question_number, title, learning_outcome, question, options, 
    correct_answer_label, correct_answer_text, rationale, category, difficulty
) VALUES
(
    (SELECT id FROM quizzes WHERE title = 'Companion Animal Healthcare Fundamentals' LIMIT 1),
    1,
    'Pain Assessment in Small Animals',
    'Demonstrate understanding of pain assessment techniques in companion animals',
    'Which of the following is the most reliable method for assessing pain in a post-operative cat?',
    '[
        {"label": "A", "text": "Vocalization levels only"},
        {"label": "B", "text": "Heart rate and blood pressure measurements"},
        {"label": "C", "text": "Composite pain scoring systems (e.g., Glasgow CMPS)"},
        {"label": "D", "text": "Owner perception of pain levels"}
    ]',
    'C',
    'Composite pain scoring systems (e.g., Glasgow CMPS)',
    'Composite pain scoring systems like the Glasgow Composite Measure Pain Scale provide the most reliable and validated approach to pain assessment by combining multiple behavioral and physiological indicators.',
    'companion-animal-care',
    'medium'
),
(
    (SELECT id FROM quizzes WHERE title = 'Companion Animal Healthcare Fundamentals' LIMIT 1),
    2,
    'Medication Administration Safety',
    'Apply safe medication administration practices in veterinary nursing',
    'Before administering any medication, what is the most critical safety check to perform?',
    '[
        {"label": "A", "text": "Confirm the medication expires within the next month"},
        {"label": "B", "text": "Verify the 5 rights: right patient, drug, dose, route, and time"},
        {"label": "C", "text": "Check that the medication is the cheapest option available"},
        {"label": "D", "text": "Ensure the medication is stored at room temperature"}
    ]',
    'B',
    'Verify the 5 rights: right patient, drug, dose, route, and time',
    'The 5 rights of medication administration are fundamental safety principles that prevent medication errors and ensure patient safety. This systematic check should be performed before every medication administration.',
    'companion-animal-care',
    'medium'
),
(
    (SELECT id FROM quizzes WHERE title = 'Companion Animal Healthcare Fundamentals' LIMIT 1),
    3,
    'Infection Control Protocols',
    'Implement effective infection control measures in veterinary practice',
    'What is the most effective method for preventing healthcare-associated infections in veterinary practice?',
    '[
        {"label": "A", "text": "Using disposable equipment for all procedures"},
        {"label": "B", "text": "Proper hand hygiene and environmental cleaning protocols"},
        {"label": "C", "text": "Prophylactic antibiotics for all patients"},
        {"label": "D", "text": "Keeping animals separated at all times"}
    ]',
    'B',
    'Proper hand hygiene and environmental cleaning protocols',
    'Hand hygiene and environmental cleaning are the most effective evidence-based methods for preventing healthcare-associated infections. Proper technique and consistent application are more important than disposable equipment or prophylactic antibiotics.',
    'companion-animal-care',
    'medium'
);

-- Update the total questions count for the new quiz
UPDATE quizzes 
SET total_questions = (
    SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = quizzes.id
)
WHERE title = 'Companion Animal Healthcare Fundamentals';

-- Add a comment to document the migration
COMMENT ON TABLE quizzes IS 'Contains quiz definitions that group multiple quiz questions together';
COMMENT ON COLUMN quizzes.podcast_episode_id IS 'Optional link to specific podcast episode';
COMMENT ON COLUMN quizzes.pass_percentage IS 'Minimum percentage score required to pass the quiz';
COMMENT ON TABLE quiz_attempts_summary IS 'Tracks overall quiz completion and scores for users';
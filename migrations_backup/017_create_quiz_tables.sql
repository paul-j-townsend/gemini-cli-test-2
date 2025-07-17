-- Create quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz attempts table for tracking user responses
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Future user system integration
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_answer_label TEXT, -- A, B, C, or D
    selected_answer_text TEXT, -- Full text of selected answer
    is_correct BOOLEAN,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question_id ON quiz_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

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
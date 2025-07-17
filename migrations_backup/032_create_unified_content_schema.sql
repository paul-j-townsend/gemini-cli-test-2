-- Migration: Create unified content management schema
-- Date: 2025-07-12
-- Description: Combine podcast episodes and quizzes into a single unified content table

-- =============================================================================
-- STEP 1: CREATE UNIFIED VSK_CONTENT TABLE
-- =============================================================================

DROP TABLE IF EXISTS vsk_content CASCADE;

CREATE TABLE vsk_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Podcast Episode Fields
    title TEXT NOT NULL,
    description TEXT,
    audio_src TEXT, -- Preview/short version audio URL
    full_audio_src TEXT, -- Full version audio URL
    image_url TEXT,
    thumbnail_path TEXT,
    duration INTEGER, -- Duration in seconds
    episode_number INTEGER NOT NULL DEFAULT 1,
    season INTEGER NOT NULL DEFAULT 1,
    slug TEXT UNIQUE,
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
    
    -- Quiz Fields (embedded)
    quiz_title TEXT, -- Can be different from episode title
    quiz_description TEXT,
    quiz_category TEXT,
    pass_percentage INTEGER DEFAULT 70 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
    total_questions INTEGER DEFAULT 0,
    quiz_is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- STEP 2: CREATE QUIZ QUESTIONS TABLE (references content)
-- =============================================================================

DROP TABLE IF EXISTS vsk_content_questions CASCADE;

CREATE TABLE vsk_content_questions (
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

-- =============================================================================
-- STEP 3: CREATE QUESTION ANSWERS TABLE
-- =============================================================================

DROP TABLE IF EXISTS vsk_content_question_answers CASCADE;

CREATE TABLE vsk_content_question_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES vsk_content_questions(id) ON DELETE CASCADE,
    answer_letter TEXT NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, answer_letter)
);

-- =============================================================================
-- STEP 4: UPDATE COMPLETIONS TABLE TO REFERENCE CONTENT
-- =============================================================================

-- Drop existing quiz completions table
DROP TABLE IF EXISTS vsk_quiz_completions CASCADE;

-- Create new content completions table
CREATE TABLE vsk_content_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES vsk_users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES vsk_content(id) ON DELETE CASCADE,
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
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_vsk_content_episode_number ON vsk_content(episode_number);
CREATE INDEX IF NOT EXISTS idx_vsk_content_season ON vsk_content(season);
CREATE INDEX IF NOT EXISTS idx_vsk_content_published_at ON vsk_content(published_at);
CREATE INDEX IF NOT EXISTS idx_vsk_content_is_published ON vsk_content(is_published);
CREATE INDEX IF NOT EXISTS idx_vsk_content_slug ON vsk_content(slug);
CREATE INDEX IF NOT EXISTS idx_vsk_content_category ON vsk_content(category);
CREATE INDEX IF NOT EXISTS idx_vsk_content_tags ON vsk_content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_vsk_content_featured ON vsk_content(featured);

-- Question indexes
CREATE INDEX IF NOT EXISTS idx_vsk_content_questions_content_id ON vsk_content_questions(content_id);
CREATE INDEX IF NOT EXISTS idx_vsk_content_questions_question_number ON vsk_content_questions(question_number);

-- Answer indexes
CREATE INDEX IF NOT EXISTS idx_vsk_content_question_answers_question_id ON vsk_content_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_vsk_content_question_answers_is_correct ON vsk_content_question_answers(is_correct);

-- Completion indexes
CREATE INDEX IF NOT EXISTS idx_vsk_content_completions_user_id ON vsk_content_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_vsk_content_completions_content_id ON vsk_content_completions(content_id);
CREATE INDEX IF NOT EXISTS idx_vsk_content_completions_passed ON vsk_content_completions(passed);
CREATE INDEX IF NOT EXISTS idx_vsk_content_completions_completed_at ON vsk_content_completions(completed_at);

-- =============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE vsk_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsk_content_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to content" ON vsk_content FOR SELECT USING (true);
CREATE POLICY "Allow all operations on content" ON vsk_content FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to content questions" ON vsk_content_questions FOR SELECT USING (true);
CREATE POLICY "Allow all operations on content questions" ON vsk_content_questions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to content question answers" ON vsk_content_question_answers FOR SELECT USING (true);
CREATE POLICY "Allow all operations on content question answers" ON vsk_content_question_answers FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to content completions" ON vsk_content_completions FOR SELECT USING (true);
CREATE POLICY "Allow all operations on content completions" ON vsk_content_completions FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- STEP 7: INSERT SAMPLE UNIFIED CONTENT
-- =============================================================================

-- Insert sample unified content (podcast episode with embedded quiz)
INSERT INTO vsk_content (
    id, title, description, audio_src, full_audio_src, episode_number, season, slug, 
    is_published, featured, category, published_at,
    quiz_title, quiz_description, quiz_category, pass_percentage, total_questions, quiz_is_active
) VALUES 
    (
        '10000000-0000-0000-0000-000000000001', 
        'Ethics in Veterinary Practice', 
        'An introduction to ethical considerations in veterinary nursing and decision-making frameworks', 
        '/audio/ethics-preview.mp3', 
        '/audio/ethics-full.mp3', 
        1, 1, 
        'ethics-in-veterinary-practice', 
        true, true, 
        'Professional Development', 
        NOW(),
        'Veterinary Ethics Assessment',
        'Test your understanding of ethical principles and their application in veterinary practice',
        'ethics',
        70, 2, true
    ),
    (
        '10000000-0000-0000-0000-000000000002', 
        'Pain Assessment and Management', 
        'Comprehensive guide to recognizing, assessing, and managing pain in veterinary patients', 
        '/audio/pain-preview.mp3', 
        '/audio/pain-full.mp3', 
        2, 1, 
        'pain-assessment-and-management', 
        true, false, 
        'Clinical Practice', 
        NOW(),
        'Pain Management Quiz',
        'Evaluate your knowledge of pain assessment techniques and management strategies',
        'pain-management',
        80, 3, true
    ),
    (
        '10000000-0000-0000-0000-000000000003', 
        'Surgical Nursing Excellence', 
        'Best practices for pre-operative, intra-operative, and post-operative patient care', 
        '/audio/surgical-preview.mp3', 
        '/audio/surgical-full.mp3', 
        3, 1, 
        'surgical-nursing-excellence', 
        true, false, 
        'Surgery', 
        NOW(),
        'Surgical Nursing Assessment',
        'Test your expertise in surgical nursing protocols and patient care',
        'surgical-nursing',
        75, 2, true
    );

-- Insert sample questions for Ethics content
INSERT INTO vsk_content_questions (id, content_id, question_number, question_text, explanation, rationale, learning_outcome)
VALUES 
    (
        '30000000-0000-0000-0000-000000000001', 
        '10000000-0000-0000-0000-000000000001', 
        1, 
        'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
        'This question tests understanding of the four core principles of biomedical ethics and their application in veterinary nursing.',
        'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.',
        'Analyze ethical dilemmas using established ethical frameworks and apply beneficence in clinical decision-making'
    ),
    (
        '30000000-0000-0000-0000-000000000002', 
        '10000000-0000-0000-0000-000000000001', 
        2,
        'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
        'This question tests knowledge of professional boundaries and legal scope of practice for Registered Veterinary Nurses.',
        'Schedule 3 permits RVNs to administer medicines (oral, topical, subcutaneous, intramuscular, intravenous) under veterinary direction, but does not permit independent diagnosis, prescribing, or major surgery.',
        'Demonstrate understanding of professional boundaries and scope of practice within legal frameworks'
    );

-- Insert answers for Ethics Question 1
INSERT INTO vsk_content_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('30000000-0000-0000-0000-000000000001', 'A', 'Autonomy', false),
    ('30000000-0000-0000-0000-000000000001', 'B', 'Beneficence', true),
    ('30000000-0000-0000-0000-000000000001', 'C', 'Non-maleficence', false),
    ('30000000-0000-0000-0000-000000000001', 'D', 'Justice', false);

-- Insert answers for Ethics Question 2
INSERT INTO vsk_content_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('30000000-0000-0000-0000-000000000002', 'A', 'Diagnosing medical conditions independently', false),
    ('30000000-0000-0000-0000-000000000002', 'B', 'Prescribing prescription-only medicines', false),
    ('30000000-0000-0000-0000-000000000002', 'C', 'Administering medicines under veterinary direction', true),
    ('30000000-0000-0000-0000-000000000002', 'D', 'Performing major surgery involving body cavities', false);

-- Insert sample questions for Pain Management content
INSERT INTO vsk_content_questions (id, content_id, question_number, question_text, explanation, rationale, learning_outcome)
VALUES 
    (
        '30000000-0000-0000-0000-000000000003', 
        '10000000-0000-0000-0000-000000000002', 
        1, 
        'Which of the following is the most reliable indicator of pain in a post-operative canine patient?',
        'Pain assessment in veterinary patients requires understanding of species-specific pain behaviors and physiological indicators.',
        'Behavioral changes such as reluctance to move, altered posture, and changes in normal activities are often the most reliable indicators of pain in dogs, as they cannot verbally communicate their discomfort.',
        'Assess pain levels using validated pain assessment tools and behavioral indicators'
    ),
    (
        '30000000-0000-0000-0000-000000000004', 
        '10000000-0000-0000-0000-000000000002', 
        2,
        'What is the primary advantage of multimodal analgesia in veterinary patients?',
        'Multimodal analgesia involves using multiple pain management techniques and medications simultaneously to optimize pain relief.',
        'By targeting different pain pathways simultaneously, multimodal analgesia can provide superior pain relief while allowing for lower doses of individual medications, reducing the risk of adverse effects.',
        'Implement comprehensive pain management protocols using multimodal approaches'
    ),
    (
        '30000000-0000-0000-0000-000000000005', 
        '10000000-0000-0000-0000-000000000002', 
        3,
        'Which of the following medications should be avoided in cats due to their limited ability to metabolize it?',
        'Cats have unique metabolic differences compared to other species that affect their ability to process certain medications safely.',
        'Cats have a deficiency in glucuronyl transferase, making them unable to efficiently metabolize paracetamol (acetaminophen), which can lead to severe toxicity and death.',
        'Recognize species-specific drug contraindications and toxicities to ensure patient safety'
    );

-- Insert answers for Pain Management questions
INSERT INTO vsk_content_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('30000000-0000-0000-0000-000000000003', 'A', 'Elevated heart rate', false),
    ('30000000-0000-0000-0000-000000000003', 'B', 'Behavioral changes', true),
    ('30000000-0000-0000-0000-000000000003', 'C', 'Increased respiratory rate', false),
    ('30000000-0000-0000-0000-000000000003', 'D', 'Elevated temperature', false),
    
    ('30000000-0000-0000-0000-000000000004', 'A', 'Faster onset of action', false),
    ('30000000-0000-0000-0000-000000000004', 'B', 'Lower cost of treatment', false),
    ('30000000-0000-0000-0000-000000000004', 'C', 'Superior pain relief with fewer side effects', true),
    ('30000000-0000-0000-0000-000000000004', 'D', 'Easier administration', false),
    
    ('30000000-0000-0000-0000-000000000005', 'A', 'Morphine', false),
    ('30000000-0000-0000-0000-000000000005', 'B', 'Meloxicam', false),
    ('30000000-0000-0000-0000-000000000005', 'C', 'Paracetamol (Acetaminophen)', true),
    ('30000000-0000-0000-0000-000000000005', 'D', 'Tramadol', false);

-- =============================================================================
-- STEP 8: UPDATE TOTAL_QUESTIONS COUNT
-- =============================================================================

-- Update total_questions count based on actual questions
UPDATE vsk_content 
SET total_questions = (
    SELECT COUNT(*) 
    FROM vsk_content_questions 
    WHERE content_id = vsk_content.id
);

-- =============================================================================
-- STEP 9: ADD TABLE COMMENTS
-- =============================================================================

COMMENT ON TABLE vsk_content IS 'Unified content table combining podcast episodes and quizzes';
COMMENT ON TABLE vsk_content_questions IS 'Quiz questions associated with content';
COMMENT ON TABLE vsk_content_question_answers IS 'Multiple choice answers for quiz questions';
COMMENT ON TABLE vsk_content_completions IS 'User completion tracking for content quizzes';

-- =============================================================================
-- STEP 10: VERIFICATION
-- =============================================================================

DO $$
DECLARE
    content_count INTEGER;
    questions_count INTEGER;
    answers_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO content_count FROM vsk_content;
    SELECT COUNT(*) INTO questions_count FROM vsk_content_questions;
    SELECT COUNT(*) INTO answers_count FROM vsk_content_question_answers;
    
    RAISE NOTICE '=== UNIFIED CONTENT SCHEMA MIGRATION COMPLETE ===';
    RAISE NOTICE 'Total content items: %', content_count;
    RAISE NOTICE 'Total questions: %', questions_count;
    RAISE NOTICE 'Total answers: %', answers_count;
    
    -- Verify each content has correct question count
    FOR content_count IN 
        SELECT id FROM vsk_content 
    LOOP
        SELECT COUNT(*) INTO questions_count 
        FROM vsk_content_questions 
        WHERE content_id = content_count;
        
        RAISE NOTICE 'Content % has % questions', content_count, questions_count;
    END LOOP;
    
    RAISE NOTICE 'SUCCESS: Unified content schema created with sample data';
END $$;
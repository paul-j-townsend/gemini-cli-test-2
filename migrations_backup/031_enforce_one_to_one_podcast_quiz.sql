-- Migration: Enforce one-to-one podcast-quiz relationship
-- Date: 2025-07-11
-- Description: Update schema to enforce strict one-to-one relationship between podcasts and quizzes

-- =============================================================================
-- STEP 1: CLEAN UP EXISTING DATA
-- =============================================================================

-- First, let's clean up any existing data that violates the one-to-one constraint
DO $$
BEGIN
    RAISE NOTICE 'Starting cleanup of existing podcast-quiz relationships...';
    
    -- Log current state
    RAISE NOTICE 'Current podcast episodes: %', (SELECT COUNT(*) FROM vsk_podcast_episodes);
    RAISE NOTICE 'Current quizzes: %', (SELECT COUNT(*) FROM vsk_quizzes);
    RAISE NOTICE 'Episodes without quizzes: %', (SELECT COUNT(*) FROM vsk_podcast_episodes WHERE quiz_id IS NULL);
END $$;

-- =============================================================================
-- STEP 2: UPDATE PODCAST EPISODES TABLE STRUCTURE
-- =============================================================================

-- Drop the existing foreign key constraint
ALTER TABLE vsk_podcast_episodes 
DROP CONSTRAINT IF EXISTS vsk_podcast_episodes_quiz_id_fkey;

-- Make quiz_id NOT NULL (this will fail if there are null values)
-- If this fails, you need to run the migration script to create placeholder quizzes first
ALTER TABLE vsk_podcast_episodes 
ALTER COLUMN quiz_id SET NOT NULL;

-- Add a unique constraint to ensure one-to-one relationship
-- This prevents multiple episodes from sharing the same quiz
ALTER TABLE vsk_podcast_episodes 
ADD CONSTRAINT vsk_podcast_episodes_quiz_id_unique UNIQUE (quiz_id);

-- Add the foreign key constraint back with CASCADE DELETE
-- When a quiz is deleted, the associated podcast episode is also deleted
ALTER TABLE vsk_podcast_episodes 
ADD CONSTRAINT vsk_podcast_episodes_quiz_id_fkey 
FOREIGN KEY (quiz_id) 
REFERENCES vsk_quizzes(id) 
ON DELETE CASCADE;

-- =============================================================================
-- STEP 3: REMOVE REDUNDANT PODCAST_ID FROM QUIZ COMPLETIONS
-- =============================================================================

-- The podcast_id in quiz_completions is now redundant since we can get it via quiz_id
-- But we'll keep it for now to maintain compatibility during transition
-- We can remove it later once all application code is updated

-- =============================================================================
-- STEP 4: ADD HELPFUL INDEXES
-- =============================================================================

-- Since we now have a unique constraint on quiz_id, this will help with lookups
CREATE INDEX IF NOT EXISTS idx_vsk_podcast_episodes_quiz_id_unique ON vsk_podcast_episodes(quiz_id);

-- =============================================================================
-- STEP 5: UPDATE SAMPLE DATA TO MATCH NEW SCHEMA
-- =============================================================================

-- Clear existing sample data to avoid conflicts
DELETE FROM vsk_quiz_completions;
DELETE FROM vsk_user_progress;
DELETE FROM vsk_podcast_episodes;
DELETE FROM vsk_question_answers;
DELETE FROM vsk_quiz_questions;
DELETE FROM vsk_quizzes;
DELETE FROM vsk_articles;
DELETE FROM vsk_valid_keywords;

-- Insert fresh sample data with proper one-to-one relationships

-- Sample quizzes (these will be created FIRST)
INSERT INTO vsk_quizzes (id, title, description, category, pass_percentage, total_questions, is_active) 
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'Veterinary Ethics Quiz', 'Test your knowledge of veterinary ethics and professional practice', 'ethics', 70, 2, true),
    ('10000000-0000-0000-0000-000000000002', 'Pain Management Quiz', 'Understanding pain assessment and management in veterinary patients', 'pain-management', 80, 3, true),
    ('10000000-0000-0000-0000-000000000003', 'Surgical Nursing Quiz', 'Pre and post-operative care for surgical patients', 'surgical-nursing', 75, 2, true),
    ('10000000-0000-0000-0000-000000000004', 'Emergency Medicine Quiz', 'Critical care and emergency protocols', 'emergency', 85, 4, true),
    ('10000000-0000-0000-0000-000000000005', 'Pharmacology Quiz', 'Drug administration and medication safety', 'pharmacology', 80, 3, true);

-- Sample podcast episodes (each linked to exactly one quiz)
INSERT INTO vsk_podcast_episodes (id, title, description, audio_src, full_audio_src, episode_number, quiz_id, is_published, slug)
VALUES 
    ('20000000-0000-0000-0000-000000000001', 'Ethics in Veterinary Practice', 'An introduction to ethical considerations in veterinary nursing', 
     '/audio/ethics-preview.mp3', '/audio/ethics-full.mp3', 1, '10000000-0000-0000-0000-000000000001', true, 'ethics-in-veterinary-practice'),
    ('20000000-0000-0000-0000-000000000002', 'Pain Assessment and Management', 'Comprehensive guide to recognizing and managing pain in animals', 
     '/audio/pain-preview.mp3', '/audio/pain-full.mp3', 2, '10000000-0000-0000-0000-000000000002', true, 'pain-assessment-and-management'),
    ('20000000-0000-0000-0000-000000000003', 'Surgical Nursing Excellence', 'Best practices for pre and post-operative patient care', 
     '/audio/surgical-preview.mp3', '/audio/surgical-full.mp3', 3, '10000000-0000-0000-0000-000000000003', true, 'surgical-nursing-excellence'),
    ('20000000-0000-0000-0000-000000000004', 'Emergency Medicine Protocols', 'Critical care procedures and emergency response', 
     '/audio/emergency-preview.mp3', '/audio/emergency-full.mp3', 4, '10000000-0000-0000-0000-000000000004', true, 'emergency-medicine-protocols'),
    ('20000000-0000-0000-0000-000000000005', 'Safe Medication Practices', 'Pharmacology and medication administration safety', 
     '/audio/pharm-preview.mp3', '/audio/pharm-full.mp3', 5, '10000000-0000-0000-0000-000000000005', true, 'safe-medication-practices');

-- Sample quiz questions for Ethics Quiz
INSERT INTO vsk_quiz_questions (id, quiz_id, question_number, question_text, explanation, rationale, learning_outcome)
VALUES 
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 
     'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
     'This question tests understanding of the four core principles of biomedical ethics.',
     'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.',
     'Analyze ethical dilemmas using established ethical frameworks'),
    ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2,
     'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
     'This question tests knowledge of professional boundaries and legal scope of practice.',
     'Schedule 3 permits RVNs to administer medicines (oral, topical, subcutaneous, intramuscular, intravenous) under veterinary direction, but does not permit independent diagnosis, prescribing, or major surgery.',
     'Demonstrate understanding of professional boundaries and scope of practice');

-- Sample answers for Ethics Quiz - Question 1
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('30000000-0000-0000-0000-000000000001', 'A', 'Autonomy', false),
    ('30000000-0000-0000-0000-000000000001', 'B', 'Beneficence', true),
    ('30000000-0000-0000-0000-000000000001', 'C', 'Non-maleficence', false),
    ('30000000-0000-0000-0000-000000000001', 'D', 'Justice', false);

-- Sample answers for Ethics Quiz - Question 2
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('30000000-0000-0000-0000-000000000002', 'A', 'Diagnosing medical conditions independently', false),
    ('30000000-0000-0000-0000-000000000002', 'B', 'Prescribing prescription-only medicines', false),
    ('30000000-0000-0000-0000-000000000002', 'C', 'Administering medicines under veterinary direction', true),
    ('30000000-0000-0000-0000-000000000002', 'D', 'Performing major surgery involving body cavities', false);

-- Sample quiz questions for Pain Management Quiz
INSERT INTO vsk_quiz_questions (id, quiz_id, question_number, question_text, explanation, rationale, learning_outcome)
VALUES 
    ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 1, 
     'Which of the following is the most reliable indicator of pain in a post-operative canine patient?',
     'Pain assessment in veterinary patients requires understanding of species-specific pain behaviors.',
     'Behavioral changes such as reluctance to move, altered posture, and changes in normal activities are often the most reliable indicators of pain in dogs, as they cannot verbally communicate their discomfort.',
     'Assess pain levels using validated pain assessment tools'),
    ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 2,
     'What is the primary advantage of multimodal analgesia in veterinary patients?',
     'Multimodal analgesia involves using multiple pain management techniques simultaneously.',
     'By targeting different pain pathways simultaneously, multimodal analgesia can provide superior pain relief while allowing for lower doses of individual medications, reducing the risk of adverse effects.',
     'Implement comprehensive pain management protocols'),
    ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 3,
     'Which of the following medications should be avoided in cats due to their limited ability to metabolize it?',
     'Cats have unique metabolic differences that affect drug processing.',
     'Cats have a deficiency in glucuronyl transferase, making them unable to efficiently metabolize paracetamol (acetaminophen), which can lead to severe toxicity and death.',
     'Recognize species-specific drug contraindications and toxicities');

-- Sample answers for Pain Management Quiz - Question 1
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('30000000-0000-0000-0000-000000000003', 'A', 'Elevated heart rate', false),
    ('30000000-0000-0000-0000-000000000003', 'B', 'Behavioral changes', true),
    ('30000000-0000-0000-0000-000000000003', 'C', 'Increased respiratory rate', false),
    ('30000000-0000-0000-0000-000000000003', 'D', 'Elevated temperature', false);

-- Sample answers for Pain Management Quiz - Question 2
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('30000000-0000-0000-0000-000000000004', 'A', 'Faster onset of action', false),
    ('30000000-0000-0000-0000-000000000004', 'B', 'Lower cost of treatment', false),
    ('30000000-0000-0000-0000-000000000004', 'C', 'Superior pain relief with fewer side effects', true),
    ('30000000-0000-0000-0000-000000000004', 'D', 'Easier administration', false);

-- Sample answers for Pain Management Quiz - Question 3
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct)
VALUES 
    ('30000000-0000-0000-0000-000000000005', 'A', 'Morphine', false),
    ('30000000-0000-0000-0000-000000000005', 'B', 'Meloxicam', false),
    ('30000000-0000-0000-0000-000000000005', 'C', 'Paracetamol (Acetaminophen)', true),
    ('30000000-0000-0000-0000-000000000005', 'D', 'Tramadol', false);

-- Sample articles
INSERT INTO vsk_articles (id, title, slug, content, excerpt, author, category, status, published_at)
VALUES 
    ('40000000-0000-0000-0000-000000000001', 'Introduction to Veterinary Ethics', 'intro-veterinary-ethics',
     'Veterinary ethics forms the foundation of professional practice. This comprehensive guide covers the four pillars of biomedical ethics: autonomy, beneficence, non-maleficence, and justice, and their application in veterinary settings.',
     'Learn the fundamental principles of veterinary ethics and their practical applications in daily practice.',
     'Dr. Sarah Johnson', 'ethics', 'published', NOW()),
    ('40000000-0000-0000-0000-000000000002', 'Pain Management in Veterinary Medicine', 'pain-management-veterinary',
     'Understanding pain assessment and management is crucial for veterinary professionals. This article covers species-specific pain behaviors, assessment tools, and evidence-based treatment protocols.',
     'Comprehensive guide to recognizing, assessing, and managing pain in veterinary patients.',
     'Dr. Michael Chen', 'pain-management', 'published', NOW());

-- Sample valid keywords
INSERT INTO vsk_valid_keywords (keyword, description, category)
VALUES 
    ('ethics', 'Professional ethics and moral considerations', 'professional'),
    ('pain-management', 'Pain assessment and treatment protocols', 'clinical'),
    ('surgical-nursing', 'Perioperative care and surgical procedures', 'clinical'),
    ('emergency-medicine', 'Critical care and emergency protocols', 'clinical'),
    ('pharmacology', 'Drug administration and medication safety', 'clinical'),
    ('veterinary-nursing', 'Core nursing skills and practices', 'professional'),
    ('professional-practice', 'Standards and guidelines for professional conduct', 'professional'),
    ('legislation', 'Laws and regulations governing veterinary practice', 'legal'),
    ('continuing-education', 'Ongoing professional development', 'education'),
    ('evidence-based-practice', 'Research-informed clinical decision making', 'professional');

-- =============================================================================
-- STEP 6: VERIFICATION AND REPORTING
-- =============================================================================

DO $$
DECLARE
    podcast_count INTEGER;
    quiz_count INTEGER;
    episodes_without_quizzes INTEGER;
    duplicate_quizzes INTEGER;
BEGIN
    -- Count current state
    SELECT COUNT(*) INTO podcast_count FROM vsk_podcast_episodes;
    SELECT COUNT(*) INTO quiz_count FROM vsk_quizzes;
    SELECT COUNT(*) INTO episodes_without_quizzes FROM vsk_podcast_episodes WHERE quiz_id IS NULL;
    
    -- Check for duplicate quiz assignments (should be 0 with unique constraint)
    SELECT COUNT(*) INTO duplicate_quizzes FROM (
        SELECT quiz_id, COUNT(*)
        FROM vsk_podcast_episodes
        GROUP BY quiz_id
        HAVING COUNT(*) > 1
    ) AS duplicates;
    
    -- Report results
    RAISE NOTICE '=== MIGRATION COMPLETE ===';
    RAISE NOTICE 'Total podcast episodes: %', podcast_count;
    RAISE NOTICE 'Total quizzes: %', quiz_count;
    RAISE NOTICE 'Episodes without quizzes: %', episodes_without_quizzes;
    RAISE NOTICE 'Duplicate quiz assignments: %', duplicate_quizzes;
    
    -- Verify constraints
    IF episodes_without_quizzes > 0 THEN
        RAISE EXCEPTION 'ERROR: % episodes still have NULL quiz_id after migration', episodes_without_quizzes;
    END IF;
    
    IF duplicate_quizzes > 0 THEN
        RAISE EXCEPTION 'ERROR: % duplicate quiz assignments found', duplicate_quizzes;
    END IF;
    
    RAISE NOTICE 'SUCCESS: One-to-one podcast-quiz relationship enforced';
    RAISE NOTICE 'Schema constraints: quiz_id NOT NULL, quiz_id UNIQUE, CASCADE DELETE';
END $$;

-- =============================================================================
-- STEP 7: UPDATE TABLE COMMENTS
-- =============================================================================

COMMENT ON TABLE vsk_podcast_episodes IS 'Podcast episodes with mandatory one-to-one quiz relationship';
COMMENT ON COLUMN vsk_podcast_episodes.quiz_id IS 'Required reference to associated quiz (one-to-one relationship enforced)';
COMMENT ON CONSTRAINT vsk_podcast_episodes_quiz_id_unique ON vsk_podcast_episodes IS 'Ensures one-to-one relationship between podcast episodes and quizzes';
COMMENT ON CONSTRAINT vsk_podcast_episodes_quiz_id_fkey ON vsk_podcast_episodes IS 'Foreign key with CASCADE DELETE - deleting quiz deletes associated podcast episode';
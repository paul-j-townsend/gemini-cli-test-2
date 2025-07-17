-- =============================================================================
-- NUCLEAR OPTION: Complete Database Reset & Clean Rebuild
-- Date: July 6, 2025
-- Description: Complete data wipe and clean rebuild with snake_case consistency
-- =============================================================================

-- =============================================================================
-- PHASE 1: COMPLETE DATA WIPE
-- =============================================================================

-- Disable all foreign key constraints temporarily
SET session_replication_role = replica;

-- Clear all data from all tables (preserving structure)
TRUNCATE TABLE vsk_quiz_completions CASCADE;
TRUNCATE TABLE vsk_user_progress CASCADE;
TRUNCATE TABLE vsk_question_answers CASCADE;
TRUNCATE TABLE vsk_quiz_questions CASCADE;
TRUNCATE TABLE vsk_quizzes CASCADE;
TRUNCATE TABLE vsk_podcast_episodes CASCADE;
TRUNCATE TABLE vsk_articles CASCADE;
TRUNCATE TABLE vsk_valid_keywords CASCADE;
TRUNCATE TABLE vsk_users CASCADE;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- =============================================================================
-- PHASE 2: FRESH SAMPLE DATA INSERTION
-- =============================================================================

-- Insert clean sample users with proper UUIDs
INSERT INTO vsk_users (id, email, name, role, status, email_verified, last_login_at, created_at) 
VALUES 
    ('fed2a63e-196d-43ff-9ebc-674db34e72a7', 'admin@vetsidekick.com', 'Super Admin', 'super_admin', 'active', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440099', 'editor@vetsidekick.com', 'Content Editor', 'editor', 'active', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440098', 'user@vetsidekick.com', 'Test User', 'user', 'active', true, NOW(), NOW());

-- Insert clean sample quizzes
INSERT INTO vsk_quizzes (id, title, description, category, pass_percentage, total_questions, is_active, created_at, updated_at) 
VALUES 
    ('fed2a63e-196d-43ff-9ebc-674db34e72a7', 'Animal Anatomy & Physiology', 'Understanding animal body systems and their functions', 'anatomy', 70, 5, true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Veterinary Fundamentals', 'Basic principles of veterinary medicine and practice', 'fundamentals', 70, 5, true, NOW(), NOW());

-- Insert quiz questions for Animal Anatomy & Physiology
INSERT INTO vsk_quiz_questions (id, quiz_id, question_number, question_text, explanation, rationale, learning_outcome, created_at, updated_at)
VALUES 
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'fed2a63e-196d-43ff-9ebc-674db34e72a7', 1, 
     'Which chamber of the heart receives deoxygenated blood from the body?',
     'Understanding cardiac anatomy is fundamental to veterinary practice.',
     'The right atrium receives deoxygenated blood returning from systemic circulation through the vena cavae.',
     'Identify basic anatomical structures and their functions', NOW(), NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111113', 'fed2a63e-196d-43ff-9ebc-674db34e72a7', 2,
     'What is the primary function of the small intestine?',
     'Digestive system knowledge is essential for understanding nutrition and disease.',
     'The small intestine is the primary site for nutrient absorption due to its extensive surface area created by villi and microvilli.',
     'Explain physiological processes in body systems', NOW(), NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111115', 'fed2a63e-196d-43ff-9ebc-674db34e72a7', 3,
     'Which type of muscle tissue is found in the heart?',
     'Different muscle types have distinct properties and functions.',
     'Cardiac muscle is specialized striated muscle that contracts involuntarily and rhythmically.',
     'Classify tissue types and their characteristics', NOW(), NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111117', 'fed2a63e-196d-43ff-9ebc-674db34e72a7', 4,
     'What is the normal respiratory rate range for an adult dog at rest?',
     'Vital signs assessment is crucial for patient monitoring.',
     'Normal respiratory rate helps assess respiratory function and overall health status.',
     'Apply clinical assessment techniques', NOW(), NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111119', 'fed2a63e-196d-43ff-9ebc-674db34e72a7', 5,
     'Which organ produces insulin in mammals?',
     'Endocrine system understanding is vital for managing metabolic conditions.',
     'The pancreas contains beta cells in the islets of Langerhans that produce insulin.',
     'Understand endocrine system function', NOW(), NOW());

-- Insert answers for Animal Anatomy & Physiology questions
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct, created_at)
VALUES 
    -- Question 1 answers
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'A', 'Left atrium', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'B', 'Right atrium', true, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'C', 'Left ventricle', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'D', 'Right ventricle', false, NOW()),
    
    -- Question 2 answers
    ('a1b2c3d4-e5f6-7890-abcd-111111111113', 'A', 'Protein synthesis', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111113', 'B', 'Nutrient absorption', true, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111113', 'C', 'Waste elimination', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111113', 'D', 'Blood filtration', false, NOW()),
    
    -- Question 3 answers
    ('a1b2c3d4-e5f6-7890-abcd-111111111115', 'A', 'Skeletal muscle', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111115', 'B', 'Smooth muscle', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111115', 'C', 'Cardiac muscle', true, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111115', 'D', 'Nervous tissue', false, NOW()),
    
    -- Question 4 answers
    ('a1b2c3d4-e5f6-7890-abcd-111111111117', 'A', '5-10 breaths per minute', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111117', 'B', '10-30 breaths per minute', true, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111117', 'C', '30-50 breaths per minute', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111117', 'D', '50-80 breaths per minute', false, NOW()),
    
    -- Question 5 answers
    ('a1b2c3d4-e5f6-7890-abcd-111111111119', 'A', 'Liver', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111119', 'B', 'Kidney', false, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111119', 'C', 'Pancreas', true, NOW()),
    ('a1b2c3d4-e5f6-7890-abcd-111111111119', 'D', 'Spleen', false, NOW());

-- Insert quiz questions for Veterinary Fundamentals
INSERT INTO vsk_quiz_questions (id, quiz_id, question_number, question_text, explanation, rationale, learning_outcome, created_at, updated_at)
VALUES 
    ('b1c2d3e4-f5g6-7890-bcde-222222222221', '550e8400-e29b-41d4-a716-446655440000', 1,
     'What is the first step in any emergency veterinary situation?',
     'Emergency protocols ensure safety and effective treatment.',
     'Ensuring safety prevents additional injuries and allows for proper assessment and treatment.',
     'Apply emergency response protocols', NOW(), NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222223', '550e8400-e29b-41d4-a716-446655440000', 2,
     'Which of the following is NOT a vital sign typically assessed in veterinary patients?',
     'Vital signs provide essential information about patient status.',
     'Blood pressure is important but not always routinely assessed like temperature, pulse, and respiration.',
     'Perform clinical assessments', NOW(), NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222225', '550e8400-e29b-41d4-a716-446655440000', 3,
     'What does the term "zoonotic" mean in veterinary medicine?',
     'Understanding zoonoses is crucial for public health and safety.',
     'Zoonotic diseases can transmit between animals and humans, requiring specific precautions.',
     'Identify public health considerations', NOW(), NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222227', '550e8400-e29b-41d4-a716-446655440000', 4,
     'Which method is most appropriate for restraining a fractious cat?',
     'Proper restraint ensures safety while minimizing stress.',
     'Towel wrapping provides secure restraint while reducing stress and injury risk.',
     'Demonstrate safe animal handling techniques', NOW(), NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222229', '550e8400-e29b-41d4-a716-446655440000', 5,
     'What is the primary purpose of veterinary medical records?',
     'Medical records are essential for continuity of care and legal protection.',
     'Accurate records ensure proper treatment continuity and provide legal documentation.',
     'Maintain professional documentation standards', NOW(), NOW());

-- Insert answers for Veterinary Fundamentals questions
INSERT INTO vsk_question_answers (question_id, answer_letter, answer_text, is_correct, created_at)
VALUES 
    -- Question 1 answers
    ('b1c2d3e4-f5g6-7890-bcde-222222222221', 'A', 'Administer first aid', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222221', 'B', 'Ensure safety', true, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222221', 'C', 'Contact the veterinarian', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222221', 'D', 'Prepare medications', false, NOW()),
    
    -- Question 2 answers
    ('b1c2d3e4-f5g6-7890-bcde-222222222223', 'A', 'Temperature', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222223', 'B', 'Pulse rate', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222223', 'C', 'Respiratory rate', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222223', 'D', 'Blood pressure', true, NOW()),
    
    -- Question 3 answers
    ('b1c2d3e4-f5g6-7890-bcde-222222222225', 'A', 'Diseases affecting only animals', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222225', 'B', 'Diseases transmissible between animals and humans', true, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222225', 'C', 'Genetic disorders in animals', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222225', 'D', 'Nutritional deficiencies', false, NOW()),
    
    -- Question 4 answers
    ('b1c2d3e4-f5g6-7890-bcde-222222222227', 'A', 'Scruffing by the neck', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222227', 'B', 'Towel wrapping', true, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222227', 'C', 'Holding by the limbs', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222227', 'D', 'Using a muzzle', false, NOW()),
    
    -- Question 5 answers
    ('b1c2d3e4-f5g6-7890-bcde-222222222229', 'A', 'Meeting legal requirements only', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222229', 'B', 'Billing purposes', false, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222229', 'C', 'Continuity of care and legal documentation', true, NOW()),
    ('b1c2d3e4-f5g6-7890-bcde-222222222229', 'D', 'Research data collection', false, NOW());

-- Insert sample podcast episodes linked to quizzes
INSERT INTO vsk_podcast_episodes (id, title, description, audio_src, full_audio_src, episode_number, season, quiz_id, is_published, published_at, created_at, updated_at)
VALUES 
    ('e1f2g3h4-i5j6-7890-efgh-333333333331', 'Understanding Animal Anatomy', 'Deep dive into cardiovascular and digestive systems', 
     '/audio/anatomy-preview.mp3', '/audio/anatomy-full.mp3', 1, 1, 'fed2a63e-196d-43ff-9ebc-674db34e72a7', true, NOW(), NOW(), NOW()),
    ('e1f2g3h4-i5j6-7890-efgh-333333333332', 'Veterinary Practice Fundamentals', 'Essential skills and knowledge for veterinary professionals', 
     '/audio/fundamentals-preview.mp3', '/audio/fundamentals-full.mp3', 2, 1, '550e8400-e29b-41d4-a716-446655440000', true, NOW(), NOW(), NOW());

-- Insert sample articles
INSERT INTO vsk_articles (id, title, slug, content, excerpt, author, category, status, published_at, created_at, updated_at)
VALUES 
    ('f1g2h3i4-j5k6-7890-fghi-444444444441', 'Cardiac Anatomy in Small Animals', 'cardiac-anatomy-small-animals',
     'The cardiovascular system is fundamental to understanding veterinary medicine. This article explores the structure and function of the heart in dogs and cats...',
     'Comprehensive guide to understanding cardiac anatomy in veterinary practice.',
     'Dr. Sarah Johnson', 'anatomy', 'published', NOW(), NOW(), NOW()),
    ('f1g2h3i4-j5k6-7890-fghi-444444444442', 'Emergency Protocols in Veterinary Practice', 'emergency-protocols-veterinary',
     'Emergency situations require immediate, systematic responses. This guide outlines essential protocols for veterinary emergencies...',
     'Essential emergency response protocols for veterinary professionals.',
     'Dr. Michael Chen', 'emergency', 'published', NOW(), NOW(), NOW());

-- Insert valid keywords
INSERT INTO vsk_valid_keywords (keyword, description, category, created_at)
VALUES 
    ('anatomy', 'Animal anatomy and structure', 'medical', NOW()),
    ('physiology', 'Body function and processes', 'medical', NOW()),
    ('fundamentals', 'Basic veterinary principles', 'education', NOW()),
    ('emergency', 'Emergency and critical care', 'clinical', NOW()),
    ('cardiovascular', 'Heart and blood vessel related', 'medical', NOW()),
    ('digestive', 'Digestive system related', 'medical', NOW()),
    ('assessment', 'Clinical assessment and examination', 'clinical', NOW()),
    ('safety', 'Safety protocols and procedures', 'professional', NOW()),
    ('restraint', 'Animal restraint techniques', 'clinical', NOW()),
    ('documentation', 'Medical record keeping', 'professional', NOW());

-- =============================================================================
-- PHASE 3: VERIFICATION AND TESTING
-- =============================================================================

-- Verify data insertion
DO $$
DECLARE
    user_count INTEGER;
    quiz_count INTEGER;
    question_count INTEGER;
    answer_count INTEGER;
    episode_count INTEGER;
    article_count INTEGER;
    keyword_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM vsk_users;
    SELECT COUNT(*) INTO quiz_count FROM vsk_quizzes;
    SELECT COUNT(*) INTO question_count FROM vsk_quiz_questions;
    SELECT COUNT(*) INTO answer_count FROM vsk_question_answers;
    SELECT COUNT(*) INTO episode_count FROM vsk_podcast_episodes;
    SELECT COUNT(*) INTO article_count FROM vsk_articles;
    SELECT COUNT(*) INTO keyword_count FROM vsk_valid_keywords;
    
    RAISE NOTICE '=== NUCLEAR RESET COMPLETE ===';
    RAISE NOTICE 'Users inserted: %', user_count;
    RAISE NOTICE 'Quizzes inserted: %', quiz_count;
    RAISE NOTICE 'Questions inserted: %', question_count;
    RAISE NOTICE 'Answers inserted: %', answer_count;
    RAISE NOTICE 'Podcast episodes inserted: %', episode_count;
    RAISE NOTICE 'Articles inserted: %', article_count;
    RAISE NOTICE 'Keywords inserted: %', keyword_count;
    
    IF user_count = 0 OR quiz_count = 0 OR question_count = 0 OR answer_count = 0 THEN
        RAISE EXCEPTION 'ERROR: Critical data missing after nuclear reset';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Nuclear reset completed successfully with clean sample data';
END $$;

-- =============================================================================
-- FINAL COMMENTS
-- =============================================================================
COMMENT ON TABLE vsk_users IS 'Clean user accounts - nuclear reset complete';
COMMENT ON TABLE vsk_quizzes IS 'Clean quiz definitions - nuclear reset complete';
COMMENT ON TABLE vsk_quiz_questions IS 'Clean quiz questions - nuclear reset complete';
COMMENT ON TABLE vsk_question_answers IS 'Clean answer options - nuclear reset complete';
COMMENT ON TABLE vsk_quiz_completions IS 'Clean completion tracking - ready for new data';
COMMENT ON TABLE vsk_user_progress IS 'Clean progress tracking - ready for new data';
COMMENT ON TABLE vsk_podcast_episodes IS 'Clean podcast episodes - nuclear reset complete';
COMMENT ON TABLE vsk_articles IS 'Clean articles - nuclear reset complete';
COMMENT ON TABLE vsk_valid_keywords IS 'Clean keywords - nuclear reset complete';
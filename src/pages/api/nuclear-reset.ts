import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add some basic protection
  const { confirmation } = req.body;
  if (confirmation !== 'NUCLEAR_RESET_CONFIRMED') {
    return res.status(400).json({ error: 'Invalid confirmation code' });
  }

  try {
    console.log('Starting nuclear database reset...');

    // Phase 1: Clear all data
    console.log('Phase 1: Clearing all existing data...');
    
    // Delete all data in dependency order
    await supabaseAdmin.from('vsk_quiz_completions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_user_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_question_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_quiz_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_podcast_episodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_valid_keywords').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('vsk_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Phase 1 complete: All data cleared');

    // Phase 2: Insert fresh sample data
    console.log('Phase 2: Inserting fresh sample data...');

    // Insert users
    const { error: usersError } = await supabaseAdmin
      .from('vsk_users')
      .upsert([
        {
          id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
          email: 'admin@vetsidekick.com',
          name: 'Super Admin',
          role: 'super_admin',
          status: 'active',
          email_verified: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440099',
          email: 'editor@vetsidekick.com',
          name: 'Content Editor',
          role: 'editor',
          status: 'active',
          email_verified: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440098',
          email: 'user@vetsidekick.com',
          name: 'Test User',
          role: 'user',
          status: 'active',
          email_verified: true
        }
      ]);

    if (usersError) throw usersError;

    // Insert quizzes
    const { error: quizzesError } = await supabaseAdmin
      .from('vsk_quizzes')
      .upsert([
        {
          id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
          title: 'Animal Anatomy & Physiology',
          description: 'Understanding animal body systems and their functions',
          category: 'anatomy',
          pass_percentage: 70,
          total_questions: 5,
          is_active: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Veterinary Fundamentals',
          description: 'Basic principles of veterinary medicine and practice',
          category: 'fundamentals',
          pass_percentage: 70,
          total_questions: 5,
          is_active: true
        }
      ]);

    if (quizzesError) throw quizzesError;

    // Insert quiz questions for Animal Anatomy
    const { error: questionsError1 } = await supabaseAdmin
      .from('vsk_quiz_questions')
      .upsert([
        {
          id: 'a1b2c3d4-e5f6-1890-abcd-111111111111',
          quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
          question_number: 1,
          question_text: 'Which chamber of the heart receives deoxygenated blood from the body?',
          explanation: 'Understanding cardiac anatomy is fundamental to veterinary practice.',
          rationale: 'The right atrium receives deoxygenated blood returning from systemic circulation through the vena cavae.',
          learning_outcome: 'Identify basic anatomical structures and their functions'
        },
        {
          id: 'a1b2c3d4-e5f6-1890-abcd-111111111113',
          quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
          question_number: 2,
          question_text: 'What is the primary function of the small intestine?',
          explanation: 'Digestive system knowledge is essential for understanding nutrition and disease.',
          rationale: 'The small intestine is the primary site for nutrient absorption due to its extensive surface area created by villi and microvilli.',
          learning_outcome: 'Explain physiological processes in body systems'
        },
        {
          id: 'a1b2c3d4-e5f6-1890-abcd-111111111115',
          quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
          question_number: 3,
          question_text: 'Which type of muscle tissue is found in the heart?',
          explanation: 'Different muscle types have distinct properties and functions.',
          rationale: 'Cardiac muscle is specialized striated muscle that contracts involuntarily and rhythmically.',
          learning_outcome: 'Classify tissue types and their characteristics'
        },
        {
          id: 'a1b2c3d4-e5f6-1890-abcd-111111111117',
          quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
          question_number: 4,
          question_text: 'What is the normal respiratory rate range for an adult dog at rest?',
          explanation: 'Vital signs assessment is crucial for patient monitoring.',
          rationale: 'Normal respiratory rate helps assess respiratory function and overall health status.',
          learning_outcome: 'Apply clinical assessment techniques'
        },
        {
          id: 'a1b2c3d4-e5f6-1890-abcd-111111111119',
          quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
          question_number: 5,
          question_text: 'Which organ produces insulin in mammals?',
          explanation: 'Endocrine system understanding is vital for managing metabolic conditions.',
          rationale: 'The pancreas contains beta cells in the islets of Langerhans that produce insulin.',
          learning_outcome: 'Understand endocrine system function'
        }
      ], { 
        onConflict: 'quiz_id,question_number' 
      });

    if (questionsError1) throw questionsError1;

    // Insert quiz questions for Veterinary Fundamentals
    const { error: questionsError2 } = await supabaseAdmin
      .from('vsk_quiz_questions')
      .upsert([
        {
          id: 'b1c2d3e4-f5g6-1890-bcde-222222222221',
          quiz_id: '550e8400-e29b-41d4-a716-446655440000',
          question_number: 1,
          question_text: 'What is the first step in any emergency veterinary situation?',
          explanation: 'Emergency protocols ensure safety and effective treatment.',
          rationale: 'Ensuring safety prevents additional injuries and allows for proper assessment and treatment.',
          learning_outcome: 'Apply emergency response protocols'
        },
        {
          id: 'b1c2d3e4-f5g6-1890-bcde-222222222223',
          quiz_id: '550e8400-e29b-41d4-a716-446655440000',
          question_number: 2,
          question_text: 'Which of the following is NOT a vital sign typically assessed in veterinary patients?',
          explanation: 'Vital signs provide essential information about patient status.',
          rationale: 'Blood pressure is important but not always routinely assessed like temperature, pulse, and respiration.',
          learning_outcome: 'Perform clinical assessments'
        },
        {
          id: 'b1c2d3e4-f5g6-1890-bcde-222222222225',
          quiz_id: '550e8400-e29b-41d4-a716-446655440000',
          question_number: 3,
          question_text: 'What does the term "zoonotic" mean in veterinary medicine?',
          explanation: 'Understanding zoonoses is crucial for public health and safety.',
          rationale: 'Zoonotic diseases can transmit between animals and humans, requiring specific precautions.',
          learning_outcome: 'Identify public health considerations'
        },
        {
          id: 'b1c2d3e4-f5g6-1890-bcde-222222222227',
          quiz_id: '550e8400-e29b-41d4-a716-446655440000',
          question_number: 4,
          question_text: 'Which method is most appropriate for restraining a fractious cat?',
          explanation: 'Proper restraint ensures safety while minimizing stress.',
          rationale: 'Towel wrapping provides secure restraint while reducing stress and injury risk.',
          learning_outcome: 'Demonstrate safe animal handling techniques'
        },
        {
          id: 'b1c2d3e4-f5g6-1890-bcde-222222222229',
          quiz_id: '550e8400-e29b-41d4-a716-446655440000',
          question_number: 5,
          question_text: 'What is the primary purpose of veterinary medical records?',
          explanation: 'Medical records are essential for continuity of care and legal protection.',
          rationale: 'Accurate records ensure proper treatment continuity and provide legal documentation.',
          learning_outcome: 'Maintain professional documentation standards'
        }
      ], { 
        onConflict: 'quiz_id,question_number' 
      });

    if (questionsError2) throw questionsError2;

    console.log('Phase 2 complete: Fresh sample data inserted');

    // Phase 3: Verification
    console.log('Phase 3: Verifying data insertion...');
    
    const { count: userCount } = await supabaseAdmin
      .from('vsk_users')
      .select('*', { count: 'exact', head: true });
    
    const { count: quizCount } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*', { count: 'exact', head: true });
    
    const { count: questionCount } = await supabaseAdmin
      .from('vsk_quiz_questions')
      .select('*', { count: 'exact', head: true });

    console.log(`Users: ${userCount}, Quizzes: ${quizCount}, Questions: ${questionCount}`);

    return res.status(200).json({
      success: true,
      message: 'Nuclear database reset completed successfully',
      stats: {
        users: userCount,
        quizzes: quizCount,
        questions: questionCount
      }
    });

  } catch (error) {
    console.error('Nuclear reset failed:', error);
    return res.status(500).json({
      error: 'Nuclear reset failed',
      details: error
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const log: string[] = [];

    // First, let's check what we have
    let existingData = [];
    try {
      const { data } = await supabaseAdmin.from('quiz_questions').select('*');
      existingData = data || [];
      log.push(`Found ${existingData.length} existing quiz questions`);
    } catch (err) {
      log.push(`No existing quiz_questions found: ${err}`);
    }

    // For now, let's just create some sample data using the existing table structure
    // Since the tables exist but are empty, we can work with what we have

    // First try to create a quiz in the quizzes table
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .insert([{
        title: 'Veterinary Ethics Quiz',
        description: 'Test your knowledge of veterinary ethics and professional practice'
      }])
      .select()
      .single();

    if (quizError) {
      log.push(`Error creating quiz: ${quizError.message}`);
      
      // If that fails, let's just work with quiz_questions directly
      // Insert standalone questions that can work with the existing podcast system
      const standaloneQuestions = [
        {
          title: 'Veterinary Ethics Question 1',
          question: 'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
          options: [
            {"label": "A", "text": "Autonomy"},
            {"label": "B", "text": "Beneficence"},
            {"label": "C", "text": "Non-maleficence"},
            {"label": "D", "text": "Justice"}
          ],
          correct_answer_label: 'B',
          correct_answer_text: 'Beneficence',
          learning_outcome: 'Analyze ethical dilemmas using established ethical frameworks',
          rationale: 'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.'
        },
        {
          title: 'Professional Practice Question 1',
          question: 'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
          options: [
            {"label": "A", "text": "Diagnosing medical conditions independently"},
            {"label": "B", "text": "Prescribing prescription-only medicines"},
            {"label": "C", "text": "Administering medicines under veterinary direction"},
            {"label": "D", "text": "Performing major surgery involving body cavities"}
          ],
          correct_answer_label: 'C',
          correct_answer_text: 'Administering medicines under veterinary direction',
          learning_outcome: 'Demonstrate understanding of professional boundaries and scope of practice',
          rationale: 'Schedule 3 permits RVNs to administer medicines (oral, topical, subcutaneous, intramuscular, intravenous) under veterinary direction, but does not permit independent diagnosis, prescribing, or major surgery.'
        }
      ];

      const { data: insertedQuestions, error: questionsError } = await supabaseAdmin
        .from('quiz_questions')
        .insert(standaloneQuestions)
        .select();

      if (questionsError) {
        log.push(`Error inserting standalone questions: ${questionsError.message}`);
        return res.status(500).json({ message: 'Failed to insert questions', log });
      } else {
        log.push(`Successfully inserted ${insertedQuestions?.length || 0} standalone questions`);
        
        // Update a podcast episode to use the first question as quiz
        if (insertedQuestions && insertedQuestions.length > 0) {
          const { error: podcastUpdateError } = await supabaseAdmin
            .from('vsk_podcast_episodes')
            .update({ quiz_id: insertedQuestions[0].id })
            .eq('id', (await supabaseAdmin.from('vsk_podcast_episodes').select('id').limit(1).single())?.data?.id);
          
          if (!podcastUpdateError) {
            log.push('Updated podcast episode with quiz reference');
          }
        }
      }
    } else {
      log.push(`Created quiz: ${quiz.id}`);
      
      // Insert questions linked to the quiz
      const questions = [
        {
          quiz_id: quiz.id,
          question_number: 1,
          title: 'Ethical Framework Application',
          learning_outcome: 'Analyze ethical dilemmas using established ethical frameworks',
          question: 'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
          options: [
            {"label": "A", "text": "Autonomy"},
            {"label": "B", "text": "Beneficence"},
            {"label": "C", "text": "Non-maleficence"},
            {"label": "D", "text": "Justice"}
          ],
          correct_answer_label: 'B',
          correct_answer_text: 'Beneficence',
          rationale: 'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.'
        }
      ];

      const { error: questionsInsertError } = await supabaseAdmin
        .from('quiz_questions')
        .insert(questions);

      if (questionsInsertError) {
        log.push(`Error inserting questions: ${questionsInsertError.message}`);
      } else {
        log.push('Successfully inserted quiz questions');
      }
    }

    return res.status(200).json({
      message: 'Schema setup completed',
      log
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ 
      message: 'Failed to setup schema',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
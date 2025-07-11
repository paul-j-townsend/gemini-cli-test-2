import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting to add quiz questions...');

    // Define questions for each quiz
    const quizQuestions = [
      // Ethics Quiz Questions
      {
        quizId: '10000000-0000-0000-0000-000000000001',
        questions: [
          {
            question_number: 1,
            question_text: 'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
            explanation: 'This question tests understanding of the four core principles of biomedical ethics.',
            rationale: 'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.',
            learning_outcome: 'Analyze ethical dilemmas using established ethical frameworks',
            answers: [
              { answer_letter: 'A', answer_text: 'Autonomy', is_correct: false },
              { answer_letter: 'B', answer_text: 'Beneficence', is_correct: true },
              { answer_letter: 'C', answer_text: 'Non-maleficence', is_correct: false },
              { answer_letter: 'D', answer_text: 'Justice', is_correct: false }
            ]
          },
          {
            question_number: 2,
            question_text: 'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
            explanation: 'This question tests knowledge of professional boundaries and legal scope of practice.',
            rationale: 'Schedule 3 permits RVNs to administer medicines (oral, topical, subcutaneous, intramuscular, intravenous) under veterinary direction, but does not permit independent diagnosis, prescribing, or major surgery.',
            learning_outcome: 'Demonstrate understanding of professional boundaries and scope of practice',
            answers: [
              { answer_letter: 'A', answer_text: 'Diagnosing medical conditions independently', is_correct: false },
              { answer_letter: 'B', answer_text: 'Prescribing prescription-only medicines', is_correct: false },
              { answer_letter: 'C', answer_text: 'Administering medicines under veterinary direction', is_correct: true },
              { answer_letter: 'D', answer_text: 'Performing major surgery involving body cavities', is_correct: false }
            ]
          }
        ]
      },
      // Pain Management Quiz Questions
      {
        quizId: '10000000-0000-0000-0000-000000000002',
        questions: [
          {
            question_number: 1,
            question_text: 'Which of the following is the most reliable indicator of pain in a post-operative canine patient?',
            explanation: 'Pain assessment in veterinary patients requires understanding of species-specific pain behaviors.',
            rationale: 'Behavioral changes such as reluctance to move, altered posture, and changes in normal activities are often the most reliable indicators of pain in dogs, as they cannot verbally communicate their discomfort.',
            learning_outcome: 'Assess pain levels using validated pain assessment tools',
            answers: [
              { answer_letter: 'A', answer_text: 'Elevated heart rate', is_correct: false },
              { answer_letter: 'B', answer_text: 'Behavioral changes', is_correct: true },
              { answer_letter: 'C', answer_text: 'Increased respiratory rate', is_correct: false },
              { answer_letter: 'D', answer_text: 'Elevated temperature', is_correct: false }
            ]
          },
          {
            question_number: 2,
            question_text: 'What is the primary advantage of multimodal analgesia in veterinary patients?',
            explanation: 'Multimodal analgesia involves using multiple pain management techniques simultaneously.',
            rationale: 'By targeting different pain pathways simultaneously, multimodal analgesia can provide superior pain relief while allowing for lower doses of individual medications, reducing the risk of adverse effects.',
            learning_outcome: 'Implement comprehensive pain management protocols',
            answers: [
              { answer_letter: 'A', answer_text: 'Faster onset of action', is_correct: false },
              { answer_letter: 'B', answer_text: 'Lower cost of treatment', is_correct: false },
              { answer_letter: 'C', answer_text: 'Superior pain relief with fewer side effects', is_correct: true },
              { answer_letter: 'D', answer_text: 'Easier administration', is_correct: false }
            ]
          },
          {
            question_number: 3,
            question_text: 'Which of the following medications should be avoided in cats due to their limited ability to metabolize it?',
            explanation: 'Cats have unique metabolic differences that affect drug processing.',
            rationale: 'Cats have a deficiency in glucuronyl transferase, making them unable to efficiently metabolize paracetamol (acetaminophen), which can lead to severe toxicity and death.',
            learning_outcome: 'Recognize species-specific drug contraindications and toxicities',
            answers: [
              { answer_letter: 'A', answer_text: 'Morphine', is_correct: false },
              { answer_letter: 'B', answer_text: 'Meloxicam', is_correct: false },
              { answer_letter: 'C', answer_text: 'Paracetamol (Acetaminophen)', is_correct: true },
              { answer_letter: 'D', answer_text: 'Tramadol', is_correct: false }
            ]
          }
        ]
      },
      // Surgical Nursing Quiz Questions
      {
        quizId: '10000000-0000-0000-0000-000000000003',
        questions: [
          {
            question_number: 1,
            question_text: 'What is the most critical factor in preventing surgical site infections?',
            explanation: 'Surgical site infections are a major concern in veterinary surgery.',
            rationale: 'Proper aseptic technique, including sterile preparation of the surgical site, surgical instruments, and maintaining sterility throughout the procedure, is the most effective way to prevent surgical site infections.',
            learning_outcome: 'Apply principles of aseptic technique in surgical settings',
            answers: [
              { answer_letter: 'A', answer_text: 'Post-operative antibiotic therapy', is_correct: false },
              { answer_letter: 'B', answer_text: 'Proper aseptic technique', is_correct: true },
              { answer_letter: 'C', answer_text: 'Fast surgical completion', is_correct: false },
              { answer_letter: 'D', answer_text: 'Patient isolation', is_correct: false }
            ]
          },
          {
            question_number: 2,
            question_text: 'During the post-operative period, which vital sign requires the most frequent monitoring in the immediate recovery phase?',
            explanation: 'Post-operative monitoring is crucial for patient safety.',
            rationale: 'Body temperature is critical to monitor as hypothermia is common after anesthesia and surgery, and can lead to delayed recovery, increased infection risk, and other complications.',
            learning_outcome: 'Implement effective post-operative monitoring protocols',
            answers: [
              { answer_letter: 'A', answer_text: 'Blood pressure', is_correct: false },
              { answer_letter: 'B', answer_text: 'Heart rate', is_correct: false },
              { answer_letter: 'C', answer_text: 'Body temperature', is_correct: true },
              { answer_letter: 'D', answer_text: 'Respiratory rate', is_correct: false }
            ]
          }
        ]
      }
    ];

    const results = [];

    // Process each quiz
    for (const quizData of quizQuestions) {
      console.log(`Processing quiz ${quizData.quizId}...`);
      
      const quizResult = {
        quizId: quizData.quizId,
        questionsCreated: 0,
        answersCreated: 0,
        errors: []
      };

      // Add questions for this quiz
      for (const questionData of quizData.questions) {
        try {
          // Insert the question
          const { data: question, error: questionError } = await supabaseAdmin
            .from('vsk_quiz_questions')
            .insert({
              quiz_id: quizData.quizId,
              question_number: questionData.question_number,
              question_text: questionData.question_text,
              explanation: questionData.explanation,
              rationale: questionData.rationale,
              learning_outcome: questionData.learning_outcome
            })
            .select()
            .single();

          if (questionError) {
            console.error(`Error creating question ${questionData.question_number}:`, questionError);
            quizResult.errors.push(`Question ${questionData.question_number}: ${questionError.message}`);
            continue;
          }

          quizResult.questionsCreated++;

          // Insert answers for this question
          const answers = questionData.answers.map(answer => ({
            question_id: question.id,
            answer_letter: answer.answer_letter,
            answer_text: answer.answer_text,
            is_correct: answer.is_correct
          }));

          const { error: answersError } = await supabaseAdmin
            .from('vsk_question_answers')
            .insert(answers);

          if (answersError) {
            console.error(`Error creating answers for question ${questionData.question_number}:`, answersError);
            quizResult.errors.push(`Answers for question ${questionData.question_number}: ${answersError.message}`);
          } else {
            quizResult.answersCreated += answers.length;
          }

        } catch (error) {
          console.error(`Exception processing question ${questionData.question_number}:`, error);
          quizResult.errors.push(`Question ${questionData.question_number}: ${error}`);
        }
      }

      // Update the quiz's total_questions count
      if (quizResult.questionsCreated > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('vsk_quizzes')
          .update({ total_questions: quizResult.questionsCreated })
          .eq('id', quizData.quizId);

        if (updateError) {
          console.error(`Error updating quiz total_questions:`, updateError);
          quizResult.errors.push(`Update total_questions: ${updateError.message}`);
        }
      }

      results.push(quizResult);
    }

    const totalQuestions = results.reduce((sum, r) => sum + r.questionsCreated, 0);
    const totalAnswers = results.reduce((sum, r) => sum + r.answersCreated, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    return res.status(200).json({
      success: totalErrors === 0,
      message: `Added ${totalQuestions} questions and ${totalAnswers} answers to quizzes`,
      data: {
        summary: {
          quizzesProcessed: results.length,
          totalQuestions,
          totalAnswers,
          totalErrors
        },
        results
      }
    });

  } catch (error) {
    console.error('Error adding quiz questions:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
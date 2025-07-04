import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const quizId = '550e8400-e29b-41d4-a716-446655440002';
    const log: string[] = [];

    // First, get all questions for this quiz
    const { data: allQuestions, error: fetchError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, question_text, question_number')
      .eq('quiz_id', quizId)
      .order('question_number');

    if (fetchError) {
      return res.status(500).json({ message: 'Failed to fetch questions', error: fetchError });
    }

    log.push(`Found ${allQuestions?.length || 0} questions`);

    // Delete all existing questions first
    const { error: deleteAllError } = await supabaseAdmin
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId);

    if (deleteAllError) {
      return res.status(500).json({ message: 'Failed to delete questions', error: deleteAllError });
    }

    log.push('Deleted all existing questions');

    // Create the two proper questions
    const questionsToCreate = [
      {
        quiz_id: quizId,
        question_number: 1,
        question_text: 'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
        explanation: 'Beneficence is the principle that requires healthcare professionals to act in the best interests of their patients.',
        points: 1
      },
      {
        quiz_id: quizId,
        question_number: 2,
        question_text: 'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
        explanation: 'RVNs can legally administer prescription-only medicines under Schedule 3 of the Veterinary Surgeons Act 1966.',
        points: 1
      }
    ];

    // Insert the clean questions
    const { data: newQuestions, error: insertError } = await supabaseAdmin
      .from('quiz_questions')
      .insert(questionsToCreate)
      .select('id, question_text, question_number');

    if (insertError) {
      return res.status(500).json({ message: 'Failed to create questions', error: insertError });
    }

    log.push(`Created ${newQuestions?.length || 0} new questions`);

    // Now add the answer options for each question
    if (newQuestions && newQuestions.length === 2) {
      // Question 1 answers
      const question1Answers = [
        { question_id: newQuestions[0].id, answer_letter: 'A', answer_text: 'Autonomy', is_correct: false },
        { question_id: newQuestions[0].id, answer_letter: 'B', answer_text: 'Beneficence', is_correct: true },
        { question_id: newQuestions[0].id, answer_letter: 'C', answer_text: 'Non-maleficence', is_correct: false },
        { question_id: newQuestions[0].id, answer_letter: 'D', answer_text: 'Justice', is_correct: false }
      ];

      // Question 2 answers
      const question2Answers = [
        { question_id: newQuestions[1].id, answer_letter: 'A', answer_text: 'Surgical procedures under general anaesthesia', is_correct: false },
        { question_id: newQuestions[1].id, answer_letter: 'B', answer_text: 'Administering prescription-only medicines', is_correct: true },
        { question_id: newQuestions[1].id, answer_letter: 'C', answer_text: 'Performing euthanasia', is_correct: false },
        { question_id: newQuestions[1].id, answer_letter: 'D', answer_text: 'Diagnosing diseases', is_correct: false }
      ];

      // Insert all answers
      const allAnswers = [...question1Answers, ...question2Answers];
      const { data: insertedAnswers, error: answersError } = await supabaseAdmin
        .from('question_answers')
        .insert(allAnswers);

      if (answersError) {
        log.push(`Error inserting answers: ${answersError.message}`);
      } else {
        log.push(`Added ${allAnswers.length} answer options`);
      }
    }

    // Update the quiz total_questions
    const { error: updateQuizError } = await supabaseAdmin
      .from('quizzes')
      .update({ total_questions: 2 })
      .eq('id', quizId);

    if (updateQuizError) {
      log.push(`Warning: Could not update quiz total_questions: ${updateQuizError.message}`);
    } else {
      log.push('Updated quiz total_questions to 2');
    }

    // Verify the final state
    const { data: finalQuiz, error: verifyError } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id,
        title,
        total_questions,
        quiz_questions (
          id,
          question_text,
          question_number,
          question_answers (
            id,
            answer_letter,
            answer_text,
            is_correct
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (verifyError) {
      log.push(`Error verifying: ${verifyError.message}`);
    } else {
      log.push(`✅ Final verification: ${finalQuiz?.quiz_questions?.length || 0} questions with answers`);
    }

    return res.status(200).json({
      message: 'Quiz data cleaned successfully',
      log,
      quiz: finalQuiz,
      success: true
    });

  } catch (error) {
    console.error('Clean quiz data error:', error);
    return res.status(500).json({ 
      message: 'Failed to clean quiz data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
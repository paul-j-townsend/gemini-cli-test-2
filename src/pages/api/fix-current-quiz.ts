import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const currentQuizId = 'fae950b8-46e3-4863-98b9-d79e861b5243';
    const log: string[] = [];

    // Update the quiz metadata
    const { data: updatedQuiz, error: updateError } = await supabaseAdmin
      .from('quizzes')
      .update({
        title: 'Veterinary Ethics Fundamentals',
        description: 'Test your knowledge of core ethical principles in veterinary practice',
        category: 'Ethics',
        pass_percentage: 75,
        total_questions: 2
      })
      .eq('id', currentQuizId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'Failed to update quiz', error: updateError });
    }

    log.push('✅ Updated quiz metadata');

    // Delete all existing questions and answers
    const { error: deleteError } = await supabaseAdmin
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', currentQuizId);

    if (deleteError) {
      return res.status(500).json({ message: 'Failed to delete questions', error: deleteError });
    }

    log.push('✅ Deleted existing questions');

    // Create the proper ethics questions
    const questionsToCreate = [
      {
        quiz_id: currentQuizId,
        question_number: 1,
        question_text: 'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
        explanation: 'Beneficence is the principle that requires healthcare professionals to act in the best interests of their patients.',
        points: 1
      },
      {
        quiz_id: currentQuizId,
        question_number: 2,
        question_text: 'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
        explanation: 'RVNs can legally administer prescription-only medicines under Schedule 3 of the Veterinary Surgeons Act 1966.',
        points: 1
      }
    ];

    // Insert the new questions
    const { data: newQuestions, error: insertError } = await supabaseAdmin
      .from('quiz_questions')
      .insert(questionsToCreate)
      .select('id, question_text, question_number');

    if (insertError) {
      return res.status(500).json({ message: 'Failed to create questions', error: insertError });
    }

    log.push(`✅ Created ${newQuestions?.length || 0} new questions`);

    // Add answer options for each question
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
        log.push(`❌ Error inserting answers: ${answersError.message}`);
      } else {
        log.push(`✅ Added ${allAnswers.length} answer options`);
      }
    }

    // Verify the final result
    const { data: finalQuiz, error: verifyError } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id,
        title,
        description,
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
      .eq('id', currentQuizId)
      .single();

    if (verifyError) {
      log.push(`❌ Error verifying: ${verifyError.message}`);
    } else {
      log.push(`✅ Final verification: ${finalQuiz?.quiz_questions?.length || 0} questions with answers`);
    }

    return res.status(200).json({
      message: 'Quiz fixed successfully',
      log,
      quiz: finalQuiz,
      success: true
    });

  } catch (error) {
    console.error('Fix current quiz error:', error);
    return res.status(500).json({ 
      message: 'Failed to fix quiz',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
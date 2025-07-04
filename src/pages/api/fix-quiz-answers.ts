import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const log: string[] = [];
    
    // Get the current quiz questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, question_text, question_number')
      .eq('quiz_id', '550e8400-e29b-41d4-a716-446655440002')
      .order('question_number');

    if (questionsError) {
      return res.status(500).json({ message: 'Failed to fetch questions', error: questionsError });
    }

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found' });
    }

    log.push(`Found ${questions.length} questions`);

    // Add answer options for each question
    for (const question of questions) {
      log.push(`Processing question ${question.question_number}: ${question.question_text}`);
      
      // First, delete any existing answers for this question
      const { error: deleteError } = await supabaseAdmin
        .from('question_answers')
        .delete()
        .eq('question_id', question.id);

      if (deleteError) {
        log.push(`Warning: Could not delete existing answers: ${deleteError.message}`);
      }

      // Define answers based on the question
      let answers: Array<{letter: string, text: string, correct: boolean}> = [];
      
      if (question.question_text.includes('biomedical ethics')) {
        // Question 1: Ethics question
        answers = [
          { letter: 'A', text: 'Autonomy', correct: false },
          { letter: 'B', text: 'Beneficence', correct: true },
          { letter: 'C', text: 'Non-maleficence', correct: false },
          { letter: 'D', text: 'Justice', correct: false }
        ];
      } else if (question.question_text.includes('Schedule 3')) {
        // Question 2: Legal question
        answers = [
          { letter: 'A', text: 'Surgical procedures under general anaesthesia', correct: false },
          { letter: 'B', text: 'Administering prescription-only medicines', correct: true },
          { letter: 'C', text: 'Performing euthanasia', correct: false },
          { letter: 'D', text: 'Diagnosing diseases', correct: false }
        ];
      } else {
        // Generic answers for other questions
        answers = [
          { letter: 'A', text: 'Option A', correct: true },
          { letter: 'B', text: 'Option B', correct: false },
          { letter: 'C', text: 'Option C', correct: false },
          { letter: 'D', text: 'Option D', correct: false }
        ];
      }

      // Insert the answers
      for (const answer of answers) {
        const { error: insertError } = await supabaseAdmin
          .from('question_answers')
          .insert({
            question_id: question.id,
            answer_letter: answer.letter,
            answer_text: answer.text,
            is_correct: answer.correct
          });

        if (insertError) {
          log.push(`❌ Error inserting answer ${answer.letter} for question ${question.question_number}: ${insertError.message}`);
        } else {
          log.push(`✅ Added answer ${answer.letter}: ${answer.text} ${answer.correct ? '(correct)' : ''}`);
        }
      }
    }

    // Verify the answers were added
    const { data: verifyAnswers, error: verifyError } = await supabaseAdmin
      .from('question_answers')
      .select('question_id, answer_letter, answer_text, is_correct')
      .in('question_id', questions.map(q => q.id));

    if (verifyError) {
      log.push(`Error verifying answers: ${verifyError.message}`);
    } else {
      log.push(`✅ Verification: ${verifyAnswers?.length || 0} answers total`);
    }

    return res.status(200).json({
      message: 'Quiz answers fixed successfully',
      log,
      questionsProcessed: questions.length,
      answersAdded: verifyAnswers?.length || 0,
      success: true
    });

  } catch (error) {
    console.error('Fix quiz answers error:', error);
    return res.status(500).json({ 
      message: 'Failed to fix quiz answers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const log: string[] = [];
    
    // First, check if question_answers table exists
    try {
      const { data: testTable, error: tableError } = await supabaseAdmin
        .from('question_answers')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.message.includes('does not exist')) {
        // Create the table
        log.push('Creating question_answers table...');
        
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS question_answers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
            answer_letter CHAR(1) NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
            answer_text TEXT NOT NULL,
            is_correct BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(question_id, answer_letter)
          );
          
          CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id);
          CREATE INDEX IF NOT EXISTS idx_question_answers_correct ON question_answers(question_id, is_correct);
          
          -- Enable RLS
          ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
          
          -- Public read access for answers of active quiz questions
          CREATE POLICY "Public can view answers of active quiz questions" ON question_answers
            FOR SELECT USING (
              question_id IN (
                SELECT qq.id FROM quiz_questions qq
                JOIN quizzes q ON qq.quiz_id = q.id
                WHERE q.is_active = true
              )
            );
        `;
        
        // Execute the SQL to create the table
        const { error: createError } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL });
        
        if (createError) {
          log.push(`Error creating table: ${createError.message}`);
          return res.status(500).json({ message: 'Failed to create table', log, error: createError });
        }
        
        log.push('✅ question_answers table created successfully');
      } else {
        log.push('✅ question_answers table already exists');
      }
    } catch (err) {
      log.push(`Error checking table: ${err}`);
    }

    // Get the current quiz questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, question_text, question_number')
      .eq('quiz_id', '550e8400-e29b-41d4-a716-446655440002')
      .order('question_number');

    if (questionsError) {
      log.push(`Error fetching questions: ${questionsError.message}`);
      return res.status(500).json({ message: 'Failed to fetch questions', log, error: questionsError });
    }

    if (!questions || questions.length === 0) {
      log.push('No questions found');
      return res.status(404).json({ message: 'No questions found', log });
    }

    log.push(`Found ${questions.length} questions`);

    // Add answer options for each question
    for (const question of questions) {
      log.push(`Processing question ${question.question_number}: ${question.question_text}`);
      
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
      message: 'Quiz answers added successfully',
      log,
      questionsProcessed: questions.length,
      answersAdded: verifyAnswers?.length || 0,
      success: true
    });

  } catch (error) {
    console.error('Add quiz answers error:', error);
    return res.status(500).json({ 
      message: 'Failed to add quiz answers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
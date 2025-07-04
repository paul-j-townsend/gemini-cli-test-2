import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const log: string[] = [];

    // Step 1: Drop existing tables manually
    const dropCommands = [
      'DROP TABLE IF EXISTS question_attempts CASCADE',
      'DROP TABLE IF EXISTS quiz_attempts CASCADE', 
      'DROP TABLE IF EXISTS mcq_answers CASCADE',
      'DROP TABLE IF EXISTS quiz_questions CASCADE',
      'DROP TABLE IF EXISTS questions CASCADE',
      'DROP TABLE IF EXISTS quizzes CASCADE'
    ];

    for (const command of dropCommands) {
      try {
        const { error } = await supabaseAdmin.sql(command);
        if (error) {
          log.push(`Warning dropping table: ${error.message}`);
        } else {
          log.push(`Executed: ${command}`);
        }
      } catch (err) {
        log.push(`Error with ${command}: ${err}`);
      }
    }

    // Step 2: Create tables
    const createQuizzesTable = `
      CREATE TABLE quizzes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT,
          difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
          total_questions INTEGER DEFAULT 0,
          pass_percentage INTEGER DEFAULT 70,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    const { error: quizzesError } = await supabaseAdmin.sql(createQuizzesTable);
    if (quizzesError) {
      log.push(`Error creating quizzes table: ${quizzesError.message}`);
      return res.status(500).json({ message: 'Failed to create quizzes table', log });
    }
    log.push('Created quizzes table');

    const createQuestionsTable = `
      CREATE TABLE quiz_questions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
          question_number INTEGER,
          title TEXT,
          learning_outcome TEXT,
          question TEXT NOT NULL,
          options JSONB NOT NULL,
          correct_answer_label TEXT NOT NULL,
          correct_answer_text TEXT NOT NULL,
          rationale TEXT,
          category TEXT,
          difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    const { error: questionsError } = await supabaseAdmin.sql(createQuestionsTable);
    if (questionsError) {
      log.push(`Error creating quiz_questions table: ${questionsError.message}`);
      return res.status(500).json({ message: 'Failed to create quiz_questions table', log });
    }
    log.push('Created quiz_questions table');

    // Step 3: Create RLS policies
    const rlsCommands = [
      'ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY',
      `CREATE POLICY "Allow read access to quizzes" ON quizzes FOR SELECT USING (true)`,
      `CREATE POLICY "Allow read access to quiz questions" ON quiz_questions FOR SELECT USING (true)`,
      `CREATE POLICY "Allow admin to manage quizzes" ON quizzes FOR ALL USING (auth.role() = 'authenticated')`,
      `CREATE POLICY "Allow admin to manage quiz questions" ON quiz_questions FOR ALL USING (auth.role() = 'authenticated')`
    ];

    for (const command of rlsCommands) {
      try {
        const { error } = await supabaseAdmin.sql(command);
        if (error) {
          log.push(`Warning with RLS: ${error.message}`);
        } else {
          log.push(`RLS: ${command.substring(0, 50)}...`);
        }
      } catch (err) {
        log.push(`RLS Error: ${err}`);
      }
    }

    // Step 4: Insert sample data
    const { data: quiz, error: insertQuizError } = await supabaseAdmin
      .from('quizzes')
      .insert([{
        title: 'Veterinary Ethics Quiz',
        description: 'Test your knowledge of veterinary ethics and professional practice',
        category: 'ethics',
        difficulty: 'medium',
        total_questions: 2,
        pass_percentage: 70
      }])
      .select()
      .single();

    if (insertQuizError) {
      log.push(`Error inserting quiz: ${insertQuizError.message}`);
    } else {
      log.push(`Created quiz: ${quiz.id}`);

      // Insert questions
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
          rationale: 'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.',
          category: 'ethics',
          difficulty: 'medium'
        },
        {
          quiz_id: quiz.id,
          question_number: 2,
          title: 'Professional Boundaries',
          learning_outcome: 'Demonstrate understanding of professional boundaries and scope of practice',
          question: 'Under Schedule 3 of the Veterinary Surgeons Act 1966, which of the following procedures may an RVN legally perform?',
          options: [
            {"label": "A", "text": "Diagnosing medical conditions independently"},
            {"label": "B", "text": "Prescribing prescription-only medicines"},
            {"label": "C", "text": "Administering medicines under veterinary direction"},
            {"label": "D", "text": "Performing major surgery involving body cavities"}
          ],
          correct_answer_label: 'C',
          correct_answer_text: 'Administering medicines under veterinary direction',
          rationale: 'Schedule 3 permits RVNs to administer medicines (oral, topical, subcutaneous, intramuscular, intravenous) under veterinary direction, but does not permit independent diagnosis, prescribing, or major surgery.',
          category: 'professional-practice',
          difficulty: 'medium'
        }
      ];

      const { error: questionsInsertError } = await supabaseAdmin
        .from('quiz_questions')
        .insert(questions);

      if (questionsInsertError) {
        log.push(`Error inserting questions: ${questionsInsertError.message}`);
      } else {
        log.push('Successfully inserted sample questions');
      }
    }

    return res.status(200).json({
      message: 'Clean quiz schema applied successfully',
      log
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ 
      message: 'Failed to apply migration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
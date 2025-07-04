import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const log: string[] = [];

    // Drop all existing quiz tables to start fresh
    const tablesToDrop = ['quiz_attempts', 'mcq_answers', 'questions', 'quizzes', 'quiz_questions'];
    
    for (const table of tablesToDrop) {
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', {
          sql: `DROP TABLE IF EXISTS ${table} CASCADE;`
        });
        
        if (error) {
          log.push(`Error dropping ${table}: ${error.message}`);
        } else {
          log.push(`Dropped table: ${table}`);
        }
      } catch (err) {
        log.push(`Error dropping ${table}: ${err}`);
      }
    }

    // Create new clean quiz schema
    const createTablesSQL = `
      -- Main quizzes table
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
      );

      -- Quiz questions table
      CREATE TABLE quiz_questions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        question_number INTEGER,
        title TEXT,
        learning_outcome TEXT,
        question TEXT NOT NULL,
        options JSONB NOT NULL, -- [{"label": "A", "text": "Answer text"}, ...]
        correct_answer_label TEXT NOT NULL,
        correct_answer_text TEXT NOT NULL,
        rationale TEXT,
        category TEXT,
        difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Quiz attempts table
      CREATE TABLE quiz_attempts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id UUID,
        score INTEGER,
        total_questions INTEGER,
        passed BOOLEAN,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Question attempts table  
      CREATE TABLE question_attempts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
        selected_answer_label TEXT,
        selected_answer_text TEXT,
        is_correct BOOLEAN,
        answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Indexes
      CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
      CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);
      CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
      CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
      CREATE INDEX idx_question_attempts_quiz_attempt_id ON question_attempts(quiz_attempt_id);

      -- RLS Policies
      ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

      -- Allow read access to quizzes and questions
      CREATE POLICY "Allow read access to quizzes" ON quizzes FOR SELECT USING (true);
      CREATE POLICY "Allow read access to quiz questions" ON quiz_questions FOR SELECT USING (true);

      -- Allow admin to manage quizzes and questions
      CREATE POLICY "Allow admin to manage quizzes" ON quizzes FOR ALL USING (auth.role() = 'authenticated');
      CREATE POLICY "Allow admin to manage quiz questions" ON quiz_questions FOR ALL USING (auth.role() = 'authenticated');

      -- Users can manage their own attempts
      CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can view their own question attempts" ON question_attempts FOR SELECT USING (auth.uid() = (SELECT user_id FROM quiz_attempts WHERE id = quiz_attempt_id));
      CREATE POLICY "Users can insert their own question attempts" ON question_attempts FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM quiz_attempts WHERE id = quiz_attempt_id));
    `;

    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTablesSQL
    });

    if (createError) {
      log.push(`Error creating tables: ${createError.message}`);
      return res.status(500).json({ message: 'Failed to create tables', log });
    } else {
      log.push('Successfully created new quiz schema');
    }

    // Insert sample quiz data
    const { data: quiz, error: quizError } = await supabaseAdmin
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

    if (quizError) {
      log.push(`Error creating sample quiz: ${quizError.message}`);
    } else {
      log.push(`Created sample quiz: ${quiz.id}`);

      // Insert sample questions
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

      const { error: questionsError } = await supabaseAdmin
        .from('quiz_questions')
        .insert(questions);

      if (questionsError) {
        log.push(`Error creating sample questions: ${questionsError.message}`);
      } else {
        log.push('Created sample questions successfully');
      }
    }

    return res.status(200).json({
      message: 'Quiz schema cleaned and recreated successfully',
      log
    });

  } catch (error) {
    console.error('Clean schema error:', error);
    return res.status(500).json({ 
      message: 'Failed to clean quiz schema',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
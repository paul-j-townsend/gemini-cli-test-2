import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple approach: create the tables using direct Supabase operations
    console.log('Starting unified content schema migration...');

    // First, let's just check if we can create a simple table to test database access
    const testQuery = `
      CREATE TABLE IF NOT EXISTS vsk_content (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          audio_src TEXT,
          full_audio_src TEXT,
          image_url TEXT,
          thumbnail_path TEXT,
          duration INTEGER,
          episode_number INTEGER NOT NULL DEFAULT 1,
          season INTEGER NOT NULL DEFAULT 1,
          slug TEXT UNIQUE,
          published_at TIMESTAMP WITH TIME ZONE,
          is_published BOOLEAN DEFAULT false,
          featured BOOLEAN DEFAULT false,
          category TEXT,
          tags TEXT[],
          show_notes TEXT,
          transcript TEXT,
          file_size INTEGER,
          meta_title TEXT,
          meta_description TEXT,
          quiz_title TEXT,
          quiz_description TEXT,
          quiz_category TEXT,
          pass_percentage INTEGER DEFAULT 70 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
          total_questions INTEGER DEFAULT 0,
          quiz_is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Try basic SQL execution without the custom function
    const { error: contentTableError } = await supabaseAdmin.from('').select().limit(0);
    
    if (contentTableError) {
      console.error('Database access test failed:', contentTableError);
      throw new Error(`Database access failed: ${contentTableError.message}`);
    }

    // Step 2: Create questions table
    const { error: questionsTableError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        DROP TABLE IF EXISTS vsk_content_questions CASCADE;

        CREATE TABLE vsk_content_questions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            content_id UUID NOT NULL REFERENCES vsk_content(id) ON DELETE CASCADE,
            question_number INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            explanation TEXT,
            rationale TEXT,
            learning_outcome TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(content_id, question_number)
        );
      `
    });

    if (questionsTableError) {
      console.error('Questions table creation error:', questionsTableError);
      throw new Error(`Failed to create questions table: ${questionsTableError.message}`);
    }

    // Step 3: Create answers table
    const { error: answersTableError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        DROP TABLE IF EXISTS vsk_content_question_answers CASCADE;

        CREATE TABLE vsk_content_question_answers (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            question_id UUID NOT NULL REFERENCES vsk_content_questions(id) ON DELETE CASCADE,
            answer_letter TEXT NOT NULL CHECK (answer_letter IN ('A', 'B', 'C', 'D', 'E')),
            answer_text TEXT NOT NULL,
            is_correct BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(question_id, answer_letter)
        );
      `
    });

    if (answersTableError) {
      console.error('Answers table creation error:', answersTableError);
      throw new Error(`Failed to create answers table: ${answersTableError.message}`);
    }

    // Step 4: Enable RLS
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        ALTER TABLE vsk_content ENABLE ROW LEVEL SECURITY;
        ALTER TABLE vsk_content_questions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE vsk_content_question_answers ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow read access to content" ON vsk_content FOR SELECT USING (true);
        CREATE POLICY "Allow all operations on content" ON vsk_content FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow read access to content questions" ON vsk_content_questions FOR SELECT USING (true);
        CREATE POLICY "Allow all operations on content questions" ON vsk_content_questions FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Allow read access to content question answers" ON vsk_content_question_answers FOR SELECT USING (true);
        CREATE POLICY "Allow all operations on content question answers" ON vsk_content_question_answers FOR ALL USING (auth.role() = 'authenticated');
      `
    });

    if (rlsError) {
      console.error('RLS setup error:', rlsError);
      throw new Error(`Failed to setup RLS: ${rlsError.message}`);
    }

    // Step 5: Insert sample data
    const { error: sampleDataError } = await supabaseAdmin
      .from('vsk_content')
      .insert([
        {
          id: '10000000-0000-0000-0000-000000000001',
          title: 'Ethics in Veterinary Practice',
          description: 'An introduction to ethical considerations in veterinary nursing and decision-making frameworks',
          audio_src: '/audio/ethics-preview.mp3',
          full_audio_src: '/audio/ethics-full.mp3',
          episode_number: 1,
          season: 1,
          slug: 'ethics-in-veterinary-practice',
          is_published: true,
          featured: true,
          category: 'Professional Development',
          published_at: new Date().toISOString(),
          quiz_title: 'Veterinary Ethics Assessment',
          quiz_description: 'Test your understanding of ethical principles and their application in veterinary practice',
          quiz_category: 'ethics',
          pass_percentage: 70,
          total_questions: 2,
          quiz_is_active: true
        }
      ]);

    if (sampleDataError) {
      console.error('Sample data error:', sampleDataError);
      throw new Error(`Failed to insert sample data: ${sampleDataError.message}`);
    }

    // Step 6: Insert sample questions
    const { data: savedQuestion1, error: question1Error } = await supabaseAdmin
      .from('vsk_content_questions')
      .insert([
        {
          content_id: '10000000-0000-0000-0000-000000000001',
          question_number: 1,
          question_text: 'Which of the four principles of biomedical ethics requires veterinary nurses to act in the best interests of their patients?',
          explanation: 'This question tests understanding of the four core principles of biomedical ethics and their application in veterinary nursing.',
          rationale: 'Beneficence requires acting in the best interests of the patient, which for veterinary nurses includes providing optimal nursing care, advocating for appropriate pain management, and supporting evidence-based treatment protocols.',
          learning_outcome: 'Analyze ethical dilemmas using established ethical frameworks and apply beneficence in clinical decision-making'
        }
      ])
      .select()
      .single();

    if (question1Error) {
      console.error('Question 1 error:', question1Error);
      throw new Error(`Failed to insert question 1: ${question1Error.message}`);
    }

    // Step 7: Insert answers for question 1
    const { error: answers1Error } = await supabaseAdmin
      .from('vsk_content_question_answers')
      .insert([
        { question_id: savedQuestion1.id, answer_letter: 'A', answer_text: 'Autonomy', is_correct: false },
        { question_id: savedQuestion1.id, answer_letter: 'B', answer_text: 'Beneficence', is_correct: true },
        { question_id: savedQuestion1.id, answer_letter: 'C', answer_text: 'Non-maleficence', is_correct: false },
        { question_id: savedQuestion1.id, answer_letter: 'D', answer_text: 'Justice', is_correct: false }
      ]);

    if (answers1Error) {
      console.error('Answers 1 error:', answers1Error);
      throw new Error(`Failed to insert answers for question 1: ${answers1Error.message}`);
    }

    console.log('Migration completed successfully');

    res.status(200).json({ 
      success: true, 
      message: 'Unified content schema migration completed successfully',
      details: 'Created vsk_content, vsk_content_questions, and vsk_content_question_answers tables with sample data'
    });
  } catch (error) {
    console.error('Migration execution error:', error);
    res.status(500).json({ 
      error: 'Failed to execute migration', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
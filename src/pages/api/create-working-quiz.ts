import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const log: string[] = [];

    // Step 1: Get the existing quiz
    const { data: existingQuiz, error: quizFetchError } = await supabaseAdmin
      .from('quizzes')
      .select('*')
      .limit(1)
      .single();

    if (quizFetchError || !existingQuiz) {
      return res.status(500).json({ 
        message: 'No quiz found to work with',
        error: quizFetchError?.message 
      });
    }

    log.push(`Using existing quiz: ${existingQuiz.id}`);

    // Step 2: Find out what columns quiz_questions actually has by attempting a minimal insert
    // Let's try the columns we expect based on the working quiz API
    const testQuestion = {
      quiz_id: existingQuiz.id,
      title: 'Test Ethics Question',
      question: 'Which principle requires acting in the patient\'s best interests?',
      options: [
        {"label": "A", "text": "Autonomy"},
        {"label": "B", "text": "Beneficence"},
        {"label": "C", "text": "Non-maleficence"},
        {"label": "D", "text": "Justice"}
      ],
      correct_answer_label: 'B',
      correct_answer_text: 'Beneficence',
      learning_outcome: 'Apply ethical principles in veterinary practice',
      rationale: 'Beneficence requires veterinary professionals to act in the best interests of their patients',
      category: 'ethics',
      difficulty: 'medium',
      question_number: 1
    };

    const { data: createdQuestion, error: questionError } = await supabaseAdmin
      .from('quiz_questions')
      .insert([testQuestion])
      .select();

    if (questionError) {
      log.push(`Error creating question: ${questionError.message}`);
      
      // Try with fewer fields
      const minimalQuestion = {
        quiz_id: existingQuiz.id,
        title: 'Test Question',
        question: 'Which principle requires acting in the patient\'s best interests?',
        options: [
          {"label": "A", "text": "Autonomy"},
          {"label": "B", "text": "Beneficence"}
        ],
        correct_answer_label: 'B',
        correct_answer_text: 'Beneficence'
      };

      const { data: minimalCreated, error: minimalError } = await supabaseAdmin
        .from('quiz_questions')
        .insert([minimalQuestion])
        .select();

      if (minimalError) {
        log.push(`Minimal question also failed: ${minimalError.message}`);
        return res.status(500).json({ message: 'Could not create question', log });
      } else {
        log.push('Minimal question created successfully');
        log.push(`Created question: ${JSON.stringify(minimalCreated)}`);
      }
    } else {
      log.push('Full question created successfully');
      log.push(`Created question: ${JSON.stringify(createdQuestion)}`);
    }

    // Step 3: Test the relationship query
    const { data: quizWithQuestions, error: relationshipError } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        quiz_questions (
          id,
          title,
          question,
          options,
          correct_answer_label,
          correct_answer_text
        )
      `)
      .eq('id', existingQuiz.id)
      .single();

    if (relationshipError) {
      log.push(`Relationship query failed: ${relationshipError.message}`);
    } else {
      log.push('Relationship query works!');
      log.push(`Quiz with questions: ${JSON.stringify(quizWithQuestions, null, 2)}`);
    }

    // Step 4: Update podcast to reference this quiz
    const { error: podcastUpdateError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .update({ quiz_id: existingQuiz.id })
      .eq('id', (await supabaseAdmin.from('vsk_podcast_episodes').select('id').limit(1).single())?.data?.id);

    if (!podcastUpdateError) {
      log.push('Updated podcast episode to reference quiz');
    }

    return res.status(200).json({
      message: 'Working quiz creation complete',
      log,
      success: true
    });

  } catch (error) {
    console.error('Quiz creation error:', error);
    return res.status(500).json({ 
      message: 'Failed to create working quiz',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create the two specific quizzes that the app references
    const quizzes = [
      {
        id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
        title: 'Animal Anatomy & Physiology',
        description: 'Understanding animal body systems and their functions',
        category: 'anatomy',
        pass_percentage: 70,
        total_questions: 5,
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Veterinary Fundamentals',
        description: 'Basic principles of veterinary medicine and practice',
        category: 'fundamentals',
        pass_percentage: 70,
        total_questions: 5,
        is_active: true
      }
    ];

    const results = [];

    for (const quiz of quizzes) {
      // First check if quiz already exists
      const { data: existingQuiz } = await supabaseAdmin
        .from('vsk_quizzes')
        .select('id')
        .eq('id', quiz.id)
        .single();

      if (existingQuiz) {
        // Check if the quiz has questions
        const { data: existingQuestions } = await supabaseAdmin
          .from('vsk_quiz_questions')
          .select('id')
          .eq('quiz_id', quiz.id);

        if (existingQuestions && existingQuestions.length > 0) {
          results.push({ 
            quiz_id: quiz.id, 
            status: 'already_exists', 
            title: quiz.title,
            questions_count: existingQuestions.length
          });
          continue;
        }
        
        // Quiz exists but has no questions - create them
        results.push({ 
          quiz_id: quiz.id, 
          status: 'adding_questions', 
          title: quiz.title 
        });
      } else {
        // Create the quiz
        const { data: createdQuiz, error: quizError } = await supabaseAdmin
          .from('vsk_quizzes')
          .insert([quiz])
          .select()
          .single();

        if (quizError) {
          results.push({ 
            quiz_id: quiz.id, 
            status: 'error', 
            error: quizError,
            title: quiz.title 
          });
          continue;
        }

        results.push({ 
          quiz_id: quiz.id, 
          status: 'created', 
          title: quiz.title 
        });
      }

      // Create sample questions for each quiz
      const questions = quiz.id === 'fed2a63e-196d-43ff-9ebc-674db34e72a7' 
        ? getAnatomyQuestions(quiz.id)
        : getFundamentalsQuestions(quiz.id);

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        // Insert question
        const { data: createdQuestion, error: questionError } = await supabaseAdmin
          .from('vsk_quiz_questions')
          .insert([question])
          .select()
          .single();

        if (questionError) {
          console.error(`Error creating question ${i + 1} for quiz ${quiz.id}:`, questionError);
          continue;
        }

        // Insert answers for this question
        let answers;
        if (quiz.id === 'fed2a63e-196d-43ff-9ebc-674db34e72a7') {
          // Anatomy quiz
          answers = i === 0 ? getAnatomyQ1Answers(createdQuestion.id) : getAnatomyQ2Answers(createdQuestion.id);
        } else {
          // Fundamentals quiz  
          answers = i === 0 ? getFundamentalsQ1Answers(createdQuestion.id) : getFundamentalsQ2Answers(createdQuestion.id);
        }

        const { error: answersError } = await supabaseAdmin
          .from('vsk_question_answers')
          .insert(answers);

        if (answersError) {
          console.error(`Error creating answers for question ${createdQuestion.id}:`, answersError);
        }
      }

      // Update the result to show questions were added
      const lastResult = results[results.length - 1];
      if (lastResult && lastResult.quiz_id === quiz.id) {
        lastResult.questions_count = questions.length;
        if (lastResult.status === 'adding_questions') {
          lastResult.status = 'questions_added';
        }
      }
    }

    return res.status(200).json({
      message: 'Sample quizzes creation completed',
      results
    });

  } catch (error) {
    console.error('Error creating sample quizzes:', error);
    return res.status(500).json({
      message: 'Failed to create sample quizzes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getAnatomyQuestions(quizId: string) {
  return [
    {
      quiz_id: quizId,
      question_number: 1,
      question_text: 'Which organ system is primarily responsible for oxygen transport in mammals?',
      explanation: 'The cardiovascular system, including the heart and blood vessels, is responsible for transporting oxygen throughout the body.',
      rationale: 'Understanding basic physiology is fundamental to veterinary care.',
      learning_outcome: 'Identify major organ systems and their functions'
    },
    {
      quiz_id: quizId,
      question_number: 2,
      question_text: 'What is the primary function of the small intestine?',
      explanation: 'The small intestine is the main site of nutrient absorption in the digestive system.',
      rationale: 'Digestive anatomy is crucial for understanding animal nutrition and health.',
      learning_outcome: 'Understand digestive system anatomy and function'
    }
  ];
}

function getFundamentalsQuestions(quizId: string) {
  return [
    {
      quiz_id: quizId,
      question_number: 1,
      question_text: 'What is the normal temperature range for dogs?',
      explanation: 'Normal canine body temperature ranges from 101-102.5°F (38.3-39.2°C).',
      rationale: 'Vital signs are essential for assessing animal health.',
      learning_outcome: 'Know normal vital signs for common domestic animals'
    },
    {
      quiz_id: quizId,
      question_number: 2,
      question_text: 'Which vaccination is typically required by law for dogs?',
      explanation: 'Rabies vaccination is legally required for dogs in most jurisdictions.',
      rationale: 'Understanding vaccination requirements is crucial for veterinary practice.',
      learning_outcome: 'Understand vaccination protocols and legal requirements'
    }
  ];
}

function getAnatomyQ1Answers(questionId: string) {
  return [
    { question_id: questionId, answer_letter: 'A', answer_text: 'Respiratory system', is_correct: false },
    { question_id: questionId, answer_letter: 'B', answer_text: 'Cardiovascular system', is_correct: true },
    { question_id: questionId, answer_letter: 'C', answer_text: 'Nervous system', is_correct: false },
    { question_id: questionId, answer_letter: 'D', answer_text: 'Digestive system', is_correct: false }
  ];
}

function getAnatomyQ2Answers(questionId: string) {
  return [
    { question_id: questionId, answer_letter: 'A', answer_text: 'Nutrient absorption', is_correct: true },
    { question_id: questionId, answer_letter: 'B', answer_text: 'Waste elimination', is_correct: false },
    { question_id: questionId, answer_letter: 'C', answer_text: 'Food storage', is_correct: false },
    { question_id: questionId, answer_letter: 'D', answer_text: 'Enzyme production', is_correct: false }
  ];
}

function getFundamentalsQ1Answers(questionId: string) {
  return [
    { question_id: questionId, answer_letter: 'A', answer_text: '98-100°F', is_correct: false },
    { question_id: questionId, answer_letter: 'B', answer_text: '101-102.5°F', is_correct: true },
    { question_id: questionId, answer_letter: 'C', answer_text: '103-104°F', is_correct: false },
    { question_id: questionId, answer_letter: 'D', answer_text: '105-106°F', is_correct: false }
  ];
}

function getFundamentalsQ2Answers(questionId: string) {
  return [
    { question_id: questionId, answer_letter: 'A', answer_text: 'Rabies', is_correct: true },
    { question_id: questionId, answer_letter: 'B', answer_text: 'Distemper', is_correct: false },
    { question_id: questionId, answer_letter: 'C', answer_text: 'Parvovirus', is_correct: false },
    { question_id: questionId, answer_letter: 'D', answer_text: 'Heartworm', is_correct: false }
  ];
}
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await createQuizAttemptSummary(req, res);
      case 'GET':
        return await getQuizAttempts(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function createQuizAttemptSummary(req: NextApiRequest, res: NextApiResponse) {
  const { 
    quiz_id, 
    score, 
    total_questions, 
    individual_answers,
    started_at,
    time_taken_minutes 
  } = req.body;

  if (!quiz_id || score === undefined || !total_questions) {
    return res.status(400).json({ 
      message: 'Quiz ID, score, and total questions are required' 
    });
  }

  // Calculate percentage and pass status
  const percentage = (score / total_questions) * 100;
  
  // Get the quiz to check pass percentage
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('pass_percentage')
    .eq('id', quiz_id)
    .single();

  if (quizError) {
    console.error('Error fetching quiz:', quizError);
    return res.status(500).json({ message: 'Failed to fetch quiz information' });
  }

  const passed = percentage >= (quiz.pass_percentage || 70);

  // Create the quiz attempt summary
  const { data: summary, error: summaryError } = await supabase
    .from('quiz_attempts_summary')
    .insert([
      {
        user_id: null, // Will be set when user system is implemented
        quiz_id,
        score,
        total_questions,
        percentage: parseFloat(percentage.toFixed(2)),
        passed,
        started_at: started_at || new Date().toISOString(),
        completed_at: new Date().toISOString(),
        time_taken_minutes
      },
    ])
    .select()
    .single();

  if (summaryError) {
    console.error('Error creating quiz attempt summary:', summaryError);
    return res.status(500).json({ message: 'Failed to record quiz attempt' });
  }

  // Also record individual question attempts if provided
  if (individual_answers && Array.isArray(individual_answers)) {
    const individualAttempts = individual_answers.map(answer => ({
      user_id: null, // Will be set when user system is implemented
      question_id: answer.question_id,
      selected_answer_label: answer.selected_answer_label,
      selected_answer_text: answer.selected_answer_text,
      is_correct: answer.is_correct,
      completed_at: new Date().toISOString()
    }));

    const { error: attemptsError } = await supabase
      .from('quiz_attempts')
      .insert(individualAttempts);

    if (attemptsError) {
      console.error('Error creating individual quiz attempts:', attemptsError);
      // Don't fail the whole request if individual attempts fail
    }
  }

  return res.status(201).json({
    ...summary,
    message: passed ? 'Congratulations! You passed the quiz!' : 'Keep learning! You can retake the quiz to improve your score.'
  });
}

async function getQuizAttempts(req: NextApiRequest, res: NextApiResponse) {
  const { quiz_id, user_id } = req.query;

  let query = supabase
    .from('quiz_attempts_summary')
    .select(`
      *,
      quizzes (
        title,
        description,
        category,
        difficulty,
        total_questions,
        pass_percentage
      )
    `)
    .order('completed_at', { ascending: false });

  if (quiz_id) {
    query = query.eq('quiz_id', quiz_id);
  }

  if (user_id) {
    query = query.eq('user_id', user_id);
  }

  const { data: attempts, error } = await query;

  if (error) {
    console.error('Error fetching quiz attempts:', error);
    return res.status(500).json({ message: 'Failed to fetch quiz attempts' });
  }

  return res.status(200).json(attempts || []);
} 
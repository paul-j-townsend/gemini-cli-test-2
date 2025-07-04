import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getQuizzes(req, res);
  } else if (req.method === 'POST') {
    return await createQuiz(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getQuizzes(req: NextApiRequest, res: NextApiResponse) {
  const { id, withQuestions = 'false' } = req.query;

  try {
    if (id) {
      // Get specific quiz with all questions and answers
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          category,
          difficulty,
          time_limit_minutes,
          pass_percentage,
          total_questions,
          is_active,
          podcast_episode_id,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (quizError) {
        console.error('Error fetching quiz:', quizError);
        return res.status(500).json({ message: 'Failed to fetch quiz', error: quizError });
      }

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Get questions with answers
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          question_number,
          question_text,
          explanation,
          points,
          question_answers (
            id,
            answer_letter,
            answer_text,
            is_correct
          )
        `)
        .eq('quiz_id', id)
        .order('question_number', { ascending: true });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        return res.status(500).json({ message: 'Failed to fetch questions', error: questionsError });
      }

      // Format the response
      const formattedQuiz = {
        ...quiz,
        questions: (questions || []).map(q => ({
          id: q.id,
          questionNumber: q.question_number,
          questionText: q.question_text,
          explanation: q.explanation,
          points: q.points,
          answers: (q.question_answers || [])
            .sort((a, b) => a.answer_letter.localeCompare(b.answer_letter))
            .map(a => ({
              id: a.id,
              letter: a.answer_letter,
              text: a.answer_text,
              isCorrect: a.is_correct
            }))
        }))
      };

      return res.status(200).json(formattedQuiz);
    } else {
      // Get all quizzes (optionally with basic question info)
      let query = supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          category,
          difficulty,
          time_limit_minutes,
          pass_percentage,
          total_questions,
          is_active,
          podcast_episode_id,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data: quizzes, error } = await query;

      if (error) {
        console.error('Error fetching quizzes:', error);
        return res.status(500).json({ message: 'Failed to fetch quizzes', error });
      }

      // If withQuestions is true, also fetch question counts
      if (withQuestions === 'true' && quizzes) {
        const quizzesWithQuestionCounts = await Promise.all(
          quizzes.map(async (quiz) => {
            const { data: questionCount } = await supabase
              .from('quiz_questions')
              .select('id', { count: 'exact' })
              .eq('quiz_id', quiz.id);

            return {
              ...quiz,
              actualQuestionCount: questionCount?.length || 0
            };
          })
        );

        return res.status(200).json(quizzesWithQuestionCounts);
      }

      return res.status(200).json(quizzes || []);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function createQuiz(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, category, difficulty, timeLimit, passPercentage, podcastEpisodeId } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert([{
        title,
        description,
        category,
        difficulty: difficulty || 'beginner',
        time_limit_minutes: timeLimit || 30,
        pass_percentage: passPercentage || 70,
        podcast_episode_id: podcastEpisodeId,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      return res.status(500).json({ message: 'Failed to create quiz', error });
    }

    return res.status(201).json(quiz);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 
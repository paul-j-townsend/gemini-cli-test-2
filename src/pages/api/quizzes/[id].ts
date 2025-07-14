import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Valid quiz ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getQuiz(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getQuiz(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Get content with questions from unified content system
    const { data: content, error } = await supabaseAdmin
      .from('vsk_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Content not found', details: error.message });
    }

    // Get questions for this content
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('vsk_content_questions')
      .select('*')
      .eq('content_id', id)
      .order('question_number');

    if (questionsError) {
      console.error('Questions fetch error:', questionsError);
      return res.status(500).json({ error: 'Failed to fetch questions', details: questionsError.message });
    }

    // Get answers for all questions
    const questionIds = questions?.map(q => q.id) || [];
    let answers = [];
    if (questionIds.length > 0) {
      const { data: answersData, error: answersError } = await supabaseAdmin
        .from('vsk_content_question_answers')
        .select('*')
        .in('question_id', questionIds);

      if (answersError) {
        console.error('Answers fetch error:', answersError);
        return res.status(500).json({ error: 'Failed to fetch answers', details: answersError.message });
      }
      answers = answersData || [];
    }

    // Transform to quiz format expected by frontend
    const quiz = {
      id: content.id,
      title: content.quiz_title || content.title,
      description: content.quiz_description || content.description,
      category: content.quiz_category || content.category,
      pass_percentage: content.pass_percentage || 70,
      total_questions: content.total_questions || questions?.length || 0,
      is_active: content.quiz_is_active,
      questions: questions?.map((q: any) => ({
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        explanation: q.explanation,
        rationale: q.rationale,
        learning_outcome: q.learning_outcome,
        mcq_answers: answers.filter(a => a.question_id === q.id).map(a => ({
          id: a.id,
          answer_letter: a.answer_letter,
          answer_text: a.answer_text,
          is_correct: a.is_correct
        }))
      })) || []
    };

    return res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Since we can't create tables through the API, let's just work with what we have
    // Let's try to manually create quiz groupings using existing data
    
    // First, check what questions we have
    const { data: existingQuestions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, title, category')
      .limit(10);

    if (questionsError) {
      return res.status(500).json({ 
        message: 'Failed to fetch questions',
        error: questionsError
      });
    }

    // Create a virtual quiz structure by updating podcast episodes
    // to point to the first question ID as the "quiz ID" representing the whole quiz
    const ethicsQuestionId = existingQuestions?.find(q => q.category === 'ethics')?.id;
    
    if (ethicsQuestionId) {
      // Update podcast episodes to use this question ID as quiz ID
      const { data: episodes, error: episodesFetchError } = await supabaseAdmin
        .from('vsk_podcast_episodes')
        .select('id, quiz_id')
        .limit(5);

      if (!episodesFetchError && episodes) {
        // Update episodes to point to the ethics question as the quiz starter
        const { error: updateError } = await supabaseAdmin
          .from('vsk_podcast_episodes')
          .update({ quiz_id: ethicsQuestionId })
          .eq('id', episodes[0]?.id);

        return res.status(200).json({
          message: 'Temporary quiz setup completed',
          ethicsQuestionId,
          episodeUpdated: episodes[0]?.id,
          updateError
        });
      }
    }

    return res.status(200).json({
      message: 'Setup completed',
      existingQuestions: existingQuestions?.length || 0,
      firstQuestion: existingQuestions?.[0]
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ 
      message: 'Failed to setup quiz structure',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
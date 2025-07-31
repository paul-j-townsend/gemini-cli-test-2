import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      case 'PATCH':
        await handleRestore(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Content API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id, include_deleted } = req.query;
  
  console.log('Content API GET request - ID:', id, 'Query:', req.query);

  if (id) {
    // Get single content item
    let query = supabaseAdmin
      .from('vsk_content')
      .select('*')
      .eq('id', id);

    // By default, exclude soft-deleted content unless explicitly requested
    if (include_deleted !== 'true') {
      query = query.is('deleted_at', null);
    }

    const { data: content, error } = await query.single();

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
    }

    // Get answers for all questions
    const questionIds = questions?.map(q => q.id) || [];
    let answers: any[] = [];
    if (questionIds.length > 0) {
      const { data: answersData, error: answersError } = await supabaseAdmin
        .from('vsk_content_question_answers')
        .select('*')
        .in('question_id', questionIds);

      if (answersError) {
        console.error('Answers fetch error:', answersError);
      } else {
        answers = answersData || [];
      }
    }

    // Transform the data to match the expected content format
    const transformedContent = {
      ...content,
      vsk_content_questions: questions?.map((q: any) => ({
        ...q,
        answers: answers?.filter(a => a.question_id === q.id) || []
      })) || []
    };

    return res.status(200).json(transformedContent);
  } else {
    // Get all content from vsk_content table with series data
    const { published_only, include_deleted } = req.query;
    
    let query = supabaseAdmin
      .from('vsk_content')
      .select(`
        *,
        series:vsk_series(
          id,
          name,
          slug,
          description,
          thumbnail_path,
          display_order
        )
      `)
      .order('episode_number', { ascending: true });

    // By default, exclude soft-deleted content unless explicitly requested
    if (include_deleted !== 'true') {
      query = query.is('deleted_at', null);
    }

    if (published_only === 'true') {
      query = query.eq('is_published', true);
    }

    const { data: content, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch content', details: error.message });
    }

    // For listing, we'll just return content without questions to keep it fast
    // Questions are loaded individually when editing
    return res.status(200).json(content || []);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const contentData = req.body;

  // Extract questions from the content data
  const { questions: inputQuestions, ...mainContentData } = contentData;

  // Process datetime fields - convert empty strings to null
  const processedContentData = {
    ...mainContentData,
    published_at: mainContentData.published_at || null,
    special_offer_start_date: mainContentData.special_offer_start_date || null,
    special_offer_end_date: mainContentData.special_offer_end_date || null,
    total_questions: inputQuestions?.length || 0
  };

  // Insert the main content record
  const { data: newContent, error: contentError } = await supabaseAdmin
    .from('vsk_content')
    .insert([processedContentData])
    .select()
    .single();

  if (contentError) {
    return res.status(500).json({ error: 'Failed to create content', details: contentError.message });
  }

  // Insert questions if provided
  if (inputQuestions && inputQuestions.length > 0) {
    for (const question of inputQuestions) {
      const { answers, ...questionData } = question;

      // Insert question
      const { data: savedQuestion, error: questionError } = await supabaseAdmin
        .from('vsk_content_questions')
        .insert([{
          ...questionData,
          content_id: newContent.id
        }])
        .select()
        .single();

      if (questionError) {
        // Cleanup: delete the content record if question insertion fails
        await supabaseAdmin.from('vsk_content').delete().eq('id', newContent.id);
        return res.status(500).json({ error: 'Failed to create questions', details: questionError.message });
      }

      // Insert answers for this question
      if (answers && answers.length > 0) {
        const answersToInsert = answers.map((answer: any) => ({
          question_id: savedQuestion.id,
          answer_letter: answer.answer_letter,
          answer_text: answer.answer_text,
          is_correct: answer.is_correct
        }));

        const { error: answersError } = await supabaseAdmin
          .from('vsk_content_question_answers')
          .insert(answersToInsert);

        if (answersError) {
          // Cleanup: delete the content record if answer insertion fails
          await supabaseAdmin.from('vsk_content').delete().eq('id', newContent.id);
          return res.status(500).json({ error: 'Failed to create answers', details: answersError.message });
        }
      }
    }
  }

  // Fetch the complete content using separate queries
  const { data: createdContent, error: fetchError } = await supabaseAdmin
    .from('vsk_content')
    .select('*')
    .eq('id', newContent.id)
    .single();

  if (fetchError) {
    return res.status(500).json({ error: 'Content created but failed to fetch', details: fetchError.message });
  }

  // Get questions for this content
  const { data: questions } = await supabaseAdmin
    .from('vsk_content_questions')
    .select('*')
    .eq('content_id', newContent.id)
    .order('question_number');

  // Get answers for all questions
  const questionIds = questions?.map(q => q.id) || [];
  const { data: answers } = await supabaseAdmin
    .from('vsk_content_question_answers')
    .select('*')
    .in('question_id', questionIds);

  // Transform the data
  const completeContent = {
    ...createdContent,
    vsk_content_questions: questions?.map((q: any) => ({
      ...q,
      answers: answers?.filter(a => a.question_id === q.id) || []
    })) || []
  };

  return res.status(201).json(completeContent);
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const contentData = req.body;

  console.log('PUT request - ID:', id);
  console.log('PUT request - Data keys:', Object.keys(contentData));
  console.log('PUT request - Questions:', contentData.questions?.length || 0);

  if (!id) {
    return res.status(400).json({ error: 'Content ID is required' });
  }

  // Extract questions from the content data
  const { questions: inputQuestions, ...mainContentData } = contentData;

  // Clean up the data - remove undefined values and convert empty strings to null
  const cleanedData = Object.fromEntries(
    Object.entries(mainContentData)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => [key, value === '' ? null : value])
  );

  console.log('Cleaned data keys:', Object.keys(cleanedData));

  // Update the main content record
  try {
    const updateData = {
      ...cleanedData,
      total_questions: inputQuestions?.length || 0,
      updated_at: new Date().toISOString()
    };

    console.log('Updating content with data:', updateData);

    const { data: updatedContent, error: contentError } = await supabaseAdmin
      .from('vsk_content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (contentError) {
      console.error('Content update error:', contentError);
      return res.status(500).json({ error: 'Failed to update content', details: contentError.message });
    }
  } catch (err) {
    console.error('Content update exception:', err);
    return res.status(500).json({ error: 'Failed to update content', details: err instanceof Error ? err.message : 'Unknown error' });
  }

  // Delete existing questions and answers
  const { error: deleteQuestionsError } = await supabaseAdmin
    .from('vsk_content_questions')
    .delete()
    .eq('content_id', id);

  if (deleteQuestionsError) {
    return res.status(500).json({ error: 'Failed to delete existing questions', details: deleteQuestionsError.message });
  }

  // Insert new questions if provided
  if (inputQuestions && inputQuestions.length > 0) {
    for (const question of inputQuestions) {
      const { answers, ...questionData } = question;

      // Insert question
      const { data: savedQuestion, error: questionError } = await supabaseAdmin
        .from('vsk_content_questions')
        .insert([{
          ...questionData,
          content_id: id
        }])
        .select()
        .single();

      if (questionError) {
        return res.status(500).json({ error: 'Failed to create questions', details: questionError.message });
      }

      // Insert answers for this question
      if (answers && answers.length > 0) {
        const answersToInsert = answers.map((answer: any) => ({
          question_id: savedQuestion.id,
          answer_letter: answer.answer_letter,
          answer_text: answer.answer_text,
          is_correct: answer.is_correct
        }));

        const { error: answersError } = await supabaseAdmin
          .from('vsk_content_question_answers')
          .insert(answersToInsert);

        if (answersError) {
          return res.status(500).json({ error: 'Failed to create answers', details: answersError.message });
        }
      }
    }
  }

  // Fetch the complete updated content using separate queries
  const { data: updatedContent, error: fetchError } = await supabaseAdmin
    .from('vsk_content')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    return res.status(500).json({ error: 'Content updated but failed to fetch', details: fetchError.message });
  }

  // Get questions for this content
  const { data: questions, error: questionsError } = await supabaseAdmin
    .from('vsk_content_questions')
    .select('*')
    .eq('content_id', id)
    .order('question_number');

  // Get answers for all questions
  const questionIds = questions?.map(q => q.id) || [];
  const { data: answers } = await supabaseAdmin
    .from('vsk_content_question_answers')
    .select('*')
    .in('question_id', questionIds);

  // Transform the data
  const completeContent = {
    ...updatedContent,
    vsk_content_questions: questions?.map((q: any) => ({
      ...q,
      answers: answers?.filter(a => a.question_id === q.id) || []
    })) || []
  };

  return res.status(200).json(completeContent);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { permanent, reason } = req.body || {};

  if (!id) {
    return res.status(400).json({ error: 'Content ID is required' });
  }

  // First, get the current content to preserve title/description
  const { data: currentContent, error: fetchError } = await supabaseAdmin
    .from('vsk_content')
    .select('title, description, deleted_at')
    .eq('id', id)
    .single();

  if (fetchError) {
    return res.status(404).json({ error: 'Content not found', details: fetchError.message });
  }

  if (permanent === true) {
    // Hard delete - only for admin cleanup, removes everything including user progress
    // First delete user progress records
    const { error: progressError } = await supabaseAdmin
      .from('vsk_user_content_progress')
      .delete()
      .eq('content_id', id);

    if (progressError) {
      return res.status(500).json({ error: 'Failed to delete user progress', details: progressError.message });
    }

    // Then delete the content
    const { error } = await supabaseAdmin
      .from('vsk_content')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to permanently delete content', details: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Content permanently deleted (including all user progress)' 
    });
  } else {
    // Check if already soft deleted
    if (currentContent.deleted_at) {
      return res.status(400).json({ error: 'Content is already deleted' });
    }
    
    // Soft delete - preserve user progress and historical data
    const { error } = await supabaseAdmin
      .from('vsk_content')
      .update({
        deleted_at: new Date().toISOString(),
        deletion_reason: reason || null,
        archived_title: currentContent.title,
        archived_description: currentContent.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete content', details: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Content deleted successfully (user progress preserved)' 
    });
  }
}

async function handleRestore(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Content ID is required' });
  }

  // Check if content exists and is deleted
  const { data: content, error: fetchError } = await supabaseAdmin
    .from('vsk_content')
    .select('id, title, deleted_at')
    .eq('id', id)
    .single();

  if (fetchError) {
    return res.status(404).json({ error: 'Content not found', details: fetchError.message });
  }

  if (!content.deleted_at) {
    return res.status(400).json({ error: 'Content is not deleted' });
  }

  // Restore content by clearing deletion fields
  const { error } = await supabaseAdmin
    .from('vsk_content')
    .update({
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: 'Failed to restore content', details: error.message });
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Content restored successfully' 
  });
}
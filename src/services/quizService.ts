import { supabaseAdmin } from '@/lib/supabase-admin';
import { 
  transformToQuizPodcastEntity, 
  QUIZ_PODCAST_QUERY_FRAGMENT,
  UnifiedQuizPodcastEntity
} from '@/utils/podcastQuizTransforms';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  pass_percentage: number;
  total_questions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions: {
    id: string;
    question_number: number;
    question_text: string;
    explanation: string;
    rationale: string;
    learning_outcome: string;
    answers: {
      id: string;
      answer_letter: string;
      answer_text: string;
      is_correct: boolean;
    }[];
  }[];
  podcast_episode?: {
    id: string;
    title: string;
    description: string;
    audio_src: string;
    full_audio_src: string;
    published_at: string;
    is_published: boolean;
    episode_number?: number;
    season?: number;
    duration?: number;
    slug?: string;
    image_url?: string;
    thumbnail_path?: string;
  };
}

class QuizService {
  async getQuizById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quizzes')
      .select(QUIZ_PODCAST_QUERY_FRAGMENT)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching quiz by ID:', error);
      throw new Error('Failed to fetch quiz');
    }
    
    if (!data) return null;
    
    return transformToQuizPodcastEntity(data) as Quiz;
  }

  async getQuizTitle(id: string): Promise<string> {
    const quiz = await this.getQuizById(id);
    return quiz?.title || `Quiz #${id.slice(0, 8)}...`;
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quizzes')
      .select(QUIZ_PODCAST_QUERY_FRAGMENT);

    if (error) {
      console.error('Error fetching all quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
    
    return (data || []).map(quiz => transformToQuizPodcastEntity(quiz) as Quiz);
  }


  async createQuizForPodcast(podcastId: string, quiz: {
    title: string;
    description: string;
    category: string;
    pass_percentage?: number;
    questions: {
      question_number: number;
      question_text: string;
      explanation: string;
      rationale: string;
      learning_outcome: string;
      answers: {
        answer_letter: string;
        answer_text: string;
        is_correct: boolean;
      }[];
    }[];
  }): Promise<Quiz> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quizzes')
      .insert({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        pass_percentage: quiz.pass_percentage || 70,
        total_questions: quiz.questions.length,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Failed to create quiz');
    }

    // Update podcast episode to reference this quiz
    const { error: podcastError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .update({ quiz_id: data.id })
      .eq('id', podcastId);

    if (podcastError) {
      console.error('Error linking quiz to podcast:', podcastError);
      // Rollback quiz creation
      await supabaseAdmin.from('vsk_quizzes').delete().eq('id', data.id);
      throw new Error('Failed to link quiz to podcast');
    }

    // Create questions and answers
    for (const question of quiz.questions) {
      const { data: questionData, error: questionError } = await supabaseAdmin
        .from('vsk_quiz_questions')
        .insert({
          quiz_id: data.id,
          question_number: question.question_number,
          question_text: question.question_text,
          explanation: question.explanation,
          rationale: question.rationale,
          learning_outcome: question.learning_outcome,
        })
        .select()
        .single();

      if (questionError) {
        console.error('Error creating question:', questionError);
        throw new Error('Failed to create question');
      }

      const { error: answersError } = await supabaseAdmin
        .from('vsk_question_answers')
        .insert(
          question.answers.map(answer => ({
            question_id: questionData.id,
            answer_letter: answer.answer_letter,
            answer_text: answer.answer_text,
            is_correct: answer.is_correct,
          }))
        );

      if (answersError) {
        console.error('Error creating answers:', answersError);
        throw new Error('Failed to create answers');
      }
    }

    // Return the complete quiz with unified entity data
    return await this.getQuizById(data.id) as Quiz;
  }

  async updateQuiz(id: string, updates: {
    title?: string;
    description?: string;
    category?: string;
    pass_percentage?: number;
    is_active?: boolean;
  }): Promise<Quiz | null> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating quiz:', error);
      throw new Error('Failed to update quiz');
    }
    
    if (!data) return null;
    
    return await this.getQuizById(data.id);
  }

  async deleteQuiz(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('vsk_quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quiz:', error);
      return false;
    }
    return true;
  }
}

export const quizService = new QuizService();
export default quizService;
export type { Quiz };
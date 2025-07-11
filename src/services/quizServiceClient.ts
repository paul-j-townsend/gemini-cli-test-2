import { supabase } from '@/lib/supabase';
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

class QuizServiceClient {
  async getQuizByPodcastId(podcastId: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('vsk_podcast_episodes')
      .select(QUIZ_PODCAST_QUERY_FRAGMENT.replace('vsk_podcast_episodes!vsk_podcast_episodes_quiz_id_fkey', 'vsk_quizzes!vsk_podcast_episodes_quiz_id_fkey'))
      .eq('id', podcastId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching quiz by podcast ID (client):', error);
      throw new Error('Failed to fetch quiz');
    }
    
    if (!data || !data.quiz_id) return null;
    
    return await this.getQuizById(data.quiz_id);
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('vsk_quizzes')
      .select(QUIZ_PODCAST_QUERY_FRAGMENT)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching quiz by ID (client):', error);
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
    const { data, error } = await supabase
      .from('vsk_quizzes')
      .select(QUIZ_PODCAST_QUERY_FRAGMENT);

    if (error) {
      console.error('Error fetching all quizzes (client):', error);
      throw new Error('Failed to fetch quizzes');
    }
    
    return (data || []).map(quiz => transformToQuizPodcastEntity(quiz) as Quiz);
  }

}

export const quizServiceClient = new QuizServiceClient();
export default quizServiceClient;
export type { Quiz };
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
    // Service deprecated due to unified content system
    // Use /api/admin/content?id=xxx instead
    console.warn('getQuizByPodcastId deprecated - use unified content API');
    return null;
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    // Service deprecated due to unified content system
    console.warn('getQuizById deprecated - use unified content API');
    return null;
  }

  async getQuizTitle(id: string): Promise<string> {
    // Service deprecated due to unified content system
    console.warn('getQuizTitle deprecated - use unified content API');
    if (!id) return 'Unknown Quiz';
    return `Quiz #${id.slice(0, 8)}...`;
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    // Service deprecated due to unified content system
    console.warn('getAllQuizzes deprecated - use unified content API');
    return [];
  }

}

export const quizServiceClient = new QuizServiceClient();
export default quizServiceClient;
export type { Quiz };
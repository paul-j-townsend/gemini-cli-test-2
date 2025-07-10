import { supabase } from '@/lib/supabase';

interface Quiz {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  podcast_id?: string;
}

class QuizServiceClient {
  async getQuizById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('vsk_quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching quiz by ID (client):', error);
      throw new Error('Failed to fetch quiz');
    }
    return data as Quiz | null;
  }

  async getQuizTitle(id: string): Promise<string> {
    const quiz = await this.getQuizById(id);
    return quiz?.title || `Quiz #${id.slice(0, 8)}...`;
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('vsk_quizzes')
      .select('*');

    if (error) {
      console.error('Error fetching all quizzes (client):', error);
      throw new Error('Failed to fetch quizzes');
    }
    return data as Quiz[];
  }

  async getQuizzesByPodcastId(podcast_id: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('vsk_quizzes')
      .select('*')
      .eq('podcast_id', podcast_id);

    if (error) {
      console.error('Error fetching quizzes by podcast ID (client):', error);
      throw new Error('Failed to fetch quizzes by podcast ID');
    }
    return data as Quiz[];
  }
}

export const quizServiceClient = new QuizServiceClient();
export default quizServiceClient;
export type { Quiz };
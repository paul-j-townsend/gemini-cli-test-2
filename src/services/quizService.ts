import { supabaseAdmin } from '@/lib/supabase-admin';

interface Quiz {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  podcast_id?: string;
}

class QuizService {
  async getQuizById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching quiz by ID:', error);
      throw new Error('Failed to fetch quiz');
    }
    return data as Quiz | null;
  }

  async getQuizTitle(id: string): Promise<string> {
    const quiz = await this.getQuizById(id);
    return quiz?.title || `Quiz #${id.slice(0, 8)}...`;
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*');

    if (error) {
      console.error('Error fetching all quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
    return data as Quiz[];
  }

  async getQuizzesByPodcastId(podcast_id: string): Promise<Quiz[]> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*')
      .eq('podcast_id', podcast_id);

    if (error) {
      console.error('Error fetching quizzes by podcast ID:', error);
      throw new Error('Failed to fetch quizzes by podcast ID');
    }
    return data as Quiz[];
  }

  async createQuiz(quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
    const { data, error } = await supabaseAdmin
      .from('vsk_quizzes')
      .insert({
        title: quiz.title,
        description: quiz.description,
        total_questions: quiz.total_questions,
        podcast_id: quiz.podcast_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Failed to create quiz');
    }
    return data as Quiz;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | null> {
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
    return data as Quiz | null;
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
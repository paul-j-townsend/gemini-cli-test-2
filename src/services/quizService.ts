interface Quiz {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  podcastId?: string;
}

// Mock quiz database
class QuizService {
  private quizzes: Quiz[] = [
    {
      id: 'quiz-1',
      title: 'Veterinary Fundamentals',
      description: 'Basic principles of veterinary medicine',
      totalQuestions: 5,
      podcastId: 'podcast-1'
    },
    {
      id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
      title: 'Animal Anatomy & Physiology',
      description: 'Understanding animal body systems',
      totalQuestions: 10,
      podcastId: 'podcast-2'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Clinical Diagnosis Techniques',
      description: 'Modern diagnostic methods in veterinary practice',
      totalQuestions: 8,
      podcastId: 'podcast-3'
    },
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      title: 'Surgical Procedures',
      description: 'Common surgical techniques and protocols',
      totalQuestions: 12,
      podcastId: 'podcast-4'
    },
    {
      id: 'b2c3d4e5-f6g7-8901-2345-678901bcdefg',
      title: 'Pharmacology Basics',
      description: 'Drug interactions and dosing guidelines',
      totalQuestions: 15,
      podcastId: 'podcast-5'
    }
  ];

  async getQuizById(id: string): Promise<Quiz | null> {
    await this.simulateDelay();
    return this.quizzes.find(quiz => quiz.id === id) || null;
  }

  async getQuizTitle(id: string): Promise<string> {
    const quiz = await this.getQuizById(id);
    return quiz?.title || `Quiz #${id.slice(0, 8)}...`;
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    await this.simulateDelay();
    return [...this.quizzes];
  }

  async getQuizzesByPodcastId(podcastId: string): Promise<Quiz[]> {
    await this.simulateDelay();
    return this.quizzes.filter(quiz => quiz.podcastId === podcastId);
  }

  async createQuiz(quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
    await this.simulateDelay();
    const newQuiz: Quiz = {
      ...quiz,
      id: this.generateId()
    };
    this.quizzes.push(newQuiz);
    return newQuiz;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | null> {
    await this.simulateDelay();
    const index = this.quizzes.findIndex(quiz => quiz.id === id);
    if (index === -1) return null;
    
    this.quizzes[index] = { ...this.quizzes[index], ...updates };
    return this.quizzes[index];
  }

  async deleteQuiz(id: string): Promise<boolean> {
    await this.simulateDelay();
    const index = this.quizzes.findIndex(quiz => quiz.id === id);
    if (index === -1) return false;
    
    this.quizzes.splice(index, 1);
    return true;
  }

  private generateId(): string {
    return 'quiz-' + Math.random().toString(36).substr(2, 9);
  }

  private async simulateDelay(ms: number = 50): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const quizService = new QuizService();
export default quizService;
export type { Quiz };
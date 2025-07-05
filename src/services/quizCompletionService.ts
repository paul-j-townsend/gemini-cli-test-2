import { QuizCompletion, QuizAnswer, UserProgress, Badge } from '../types/database';

// Mock database for quiz completions
class QuizCompletionService {
  private completions: QuizCompletion[] = [
    {
      id: '1',
      userId: '1',
      quizId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
      podcastId: 'podcast-1',
      score: 100,
      maxScore: 100,
      percentage: 100,
      timeSpent: 10*60, // 10 minutes
      completedAt: '2025-07-05T10:30:00Z',
      answers: [
        { questionId: 'q1', selectedAnswers: ['option1'], isCorrect: true, points: 20 },
        { questionId: 'q2', selectedAnswers: ['option2'], isCorrect: true, points: 20 },
        { questionId: 'q3', selectedAnswers: ['option1'], isCorrect: true, points: 20 },
        { questionId: 'q4', selectedAnswers: ['option3'], isCorrect: true, points: 20 },
        { questionId: 'q5', selectedAnswers: ['option2'], isCorrect: true, points: 20 }
      ],
      passed: true,
      attempts: 1
    },
    {
      id: '2',
      userId: '1',
      quizId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
      podcastId: 'podcast-1',
      score: 67,
      maxScore: 100,
      percentage: 67,
      timeSpent: 12*60, // 12 minutes
      completedAt: '2025-07-05T14:20:00Z',
      answers: [
        { questionId: 'q1', selectedAnswers: ['option2'], isCorrect: false, points: 0 },
        { questionId: 'q2', selectedAnswers: ['option2'], isCorrect: true, points: 20 },
        { questionId: 'q3', selectedAnswers: ['option1'], isCorrect: false, points: 0 },
        { questionId: 'q4', selectedAnswers: ['option3'], isCorrect: true, points: 20 },
        { questionId: 'q5', selectedAnswers: ['option2'], isCorrect: true, points: 20 },
        { questionId: 'q6', selectedAnswers: ['option1'], isCorrect: true, points: 7 }
      ],
      passed: true,
      attempts: 2
    },
    {
      id: '3',
      userId: '1',
      quizId: 'quiz-1',
      podcastId: 'podcast-2',
      score: 85,
      maxScore: 100,
      percentage: 85,
      timeSpent: 4*60, // 4 minutes
      completedAt: '2024-01-15T09:00:00Z',
      answers: [
        { questionId: 'q1', selectedAnswers: ['option1'], isCorrect: true, points: 20 },
        { questionId: 'q2', selectedAnswers: ['option2'], isCorrect: true, points: 25 },
        { questionId: 'q3', selectedAnswers: ['option1'], isCorrect: false, points: 0 },
        { questionId: 'q4', selectedAnswers: ['option3'], isCorrect: true, points: 20 },
        { questionId: 'q5', selectedAnswers: ['option2'], isCorrect: true, points: 20 }
      ],
      passed: true,
      attempts: 1
    }
  ];

  private userProgress: UserProgress[] = [
    {
      userId: '1',
      totalQuizzesCompleted: 3,
      totalQuizzesPassed: 3,
      totalScore: 252,
      totalMaxScore: 300,
      averageScore: 84,
      totalTimeSpent: 26*60, // 26 minutes
      completionRate: 67,
      lastActivityAt: '2025-07-05T14:20:00Z',
      streakDays: 1,
      badges: [
        {
          id: 'first-steps',
          name: 'First Steps',
          description: 'Completed your first quiz',
          icon: '🎯',
          earnedAt: '2024-01-15T09:00:00Z',
          category: 'completion'
        },
        {
          id: 'perfectionist',
          name: 'Perfectionist',
          description: 'Scored 100% on a quiz',
          icon: '💎',
          earnedAt: '2025-07-05T10:30:00Z',
          category: 'score'
        },
        {
          id: 'high-achiever',
          name: 'High Achiever',
          description: 'Maintained 80%+ average score',
          icon: '🏆',
          earnedAt: '2025-07-05T14:20:00Z',
          category: 'score'
        }
      ]
    },
    {
      userId: '2',
      totalQuizzesCompleted: 3,
      totalQuizzesPassed: 1,
      totalScore: 180,
      totalMaxScore: 300,
      averageScore: 60,
      totalTimeSpent: 540,
      completionRate: 33,
      lastActivityAt: '2024-01-14T14:20:00Z',
      streakDays: 2,
      badges: [
        {
          id: 'first-quiz',
          name: 'First Quiz',
          description: 'Completed your first quiz',
          icon: '🎯',
          earnedAt: '2024-01-12T11:00:00Z',
          category: 'completion'
        }
      ]
    }
  ];

  // Quiz completion operations
  async createCompletion(completion: Omit<QuizCompletion, 'id'>): Promise<QuizCompletion> {
    await this.simulateDelay();
    const newCompletion: QuizCompletion = {
      ...completion,
      id: (this.completions.length + 1).toString()
    };
    this.completions.push(newCompletion);
    
    // Update user progress
    await this.updateUserProgress(completion.userId, newCompletion);
    
    return newCompletion;
  }

  async findCompletionById(id: string): Promise<QuizCompletion | null> {
    await this.simulateDelay();
    return this.completions.find(c => c.id === id) || null;
  }

  async findCompletionsByUserId(userId: string): Promise<QuizCompletion[]> {
    await this.simulateDelay();
    return this.completions.filter(c => c.userId === userId);
  }

  async findCompletionsByQuizId(quizId: string): Promise<QuizCompletion[]> {
    await this.simulateDelay();
    return this.completions.filter(c => c.quizId === quizId);
  }

  async findCompletionsByPodcastId(podcastId: string): Promise<QuizCompletion[]> {
    await this.simulateDelay();
    return this.completions.filter(c => c.podcastId === podcastId);
  }

  async hasUserCompletedQuiz(userId: string, quizId: string): Promise<boolean> {
    await this.simulateDelay();
    return this.completions.some(c => c.userId === userId && c.quizId === quizId);
  }

  async hasUserPassedQuiz(userId: string, quizId: string): Promise<boolean> {
    await this.simulateDelay();
    return this.completions.some(c => c.userId === userId && c.quizId === quizId && c.passed);
  }

  async getUserQuizAttempts(userId: string, quizId: string): Promise<number> {
    await this.simulateDelay();
    const userCompletions = this.completions.filter(c => c.userId === userId && c.quizId === quizId);
    return Math.max(...userCompletions.map(c => c.attempts), 0);
  }

  async getUserBestScore(userId: string, quizId: string): Promise<QuizCompletion | null> {
    await this.simulateDelay();
    const userCompletions = this.completions.filter(c => c.userId === userId && c.quizId === quizId);
    if (userCompletions.length === 0) return null;
    
    return userCompletions.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  async getRecentCompletions(limit: number = 10): Promise<QuizCompletion[]> {
    await this.simulateDelay();
    return this.completions
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, limit);
  }

  async getUserRecentCompletions(userId: string, limit: number = 10): Promise<QuizCompletion[]> {
    await this.simulateDelay();
    return this.completions
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, limit);
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    await this.simulateDelay();
    return this.userProgress.find(p => p.userId === userId) || null;
  }

  async updateUserProgress(userId: string, completion: QuizCompletion): Promise<UserProgress> {
    await this.simulateDelay();
    
    let progress = this.userProgress.find(p => p.userId === userId);
    if (!progress) {
      progress = {
        userId,
        totalQuizzesCompleted: 0,
        totalQuizzesPassed: 0,
        totalScore: 0,
        totalMaxScore: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        completionRate: 0,
        lastActivityAt: completion.completedAt,
        streakDays: 0,
        badges: []
      };
      this.userProgress.push(progress);
    }

    // Update progress stats
    progress.totalQuizzesCompleted += 1;
    if (completion.passed) {
      progress.totalQuizzesPassed += 1;
    }
    progress.totalScore += completion.score;
    progress.totalMaxScore += completion.maxScore;
    progress.averageScore = Math.round((progress.totalScore / progress.totalMaxScore) * 100);
    progress.totalTimeSpent += completion.timeSpent;
    progress.completionRate = Math.round((progress.totalQuizzesPassed / progress.totalQuizzesCompleted) * 100);
    progress.lastActivityAt = completion.completedAt;

    // Award badges
    await this.checkAndAwardBadges(userId, progress, completion);

    return progress;
  }

  private async checkAndAwardBadges(userId: string, progress: UserProgress, completion: QuizCompletion): Promise<void> {
    const newBadges: Badge[] = [];

    // First quiz badge
    if (progress.totalQuizzesCompleted === 1 && !progress.badges.some(b => b.id === 'first-quiz')) {
      newBadges.push({
        id: 'first-quiz',
        name: 'First Quiz',
        description: 'Completed your first quiz',
        icon: '🎯',
        earnedAt: completion.completedAt,
        category: 'completion'
      });
    }

    // High scorer badge
    if (progress.averageScore >= 80 && progress.totalQuizzesCompleted >= 5 && !progress.badges.some(b => b.id === 'high-scorer')) {
      newBadges.push({
        id: 'high-scorer',
        name: 'High Scorer',
        description: 'Scored 80% or higher on 5 quizzes',
        icon: '🏆',
        earnedAt: completion.completedAt,
        category: 'score'
      });
    }

    // Perfect score badge
    if (completion.percentage === 100 && !progress.badges.some(b => b.id === 'perfect-score')) {
      newBadges.push({
        id: 'perfect-score',
        name: 'Perfect Score',
        description: 'Scored 100% on a quiz',
        icon: '⭐',
        earnedAt: completion.completedAt,
        category: 'score'
      });
    }

    // Quiz master badge
    if (progress.totalQuizzesCompleted >= 10 && !progress.badges.some(b => b.id === 'quiz-master')) {
      newBadges.push({
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Completed 10 quizzes',
        icon: '🎓',
        earnedAt: completion.completedAt,
        category: 'completion'
      });
    }

    progress.badges.push(...newBadges);
  }

  async getLeaderboard(limit: number = 10): Promise<UserProgress[]> {
    await this.simulateDelay();
    return this.userProgress
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limit);
  }

  async getQuizStats(quizId: string): Promise<{
    totalAttempts: number;
    totalPassed: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
  }> {
    await this.simulateDelay();
    const quizCompletions = this.completions.filter(c => c.quizId === quizId);
    
    if (quizCompletions.length === 0) {
      return {
        totalAttempts: 0,
        totalPassed: 0,
        averageScore: 0,
        passRate: 0,
        averageTimeSpent: 0
      };
    }

    const totalPassed = quizCompletions.filter(c => c.passed).length;
    const totalScore = quizCompletions.reduce((sum, c) => sum + c.score, 0);
    const totalMaxScore = quizCompletions.reduce((sum, c) => sum + c.maxScore, 0);
    const totalTimeSpent = quizCompletions.reduce((sum, c) => sum + c.timeSpent, 0);

    return {
      totalAttempts: quizCompletions.length,
      totalPassed,
      averageScore: Math.round((totalScore / totalMaxScore) * 100),
      passRate: Math.round((totalPassed / quizCompletions.length) * 100),
      averageTimeSpent: Math.round(totalTimeSpent / quizCompletions.length)
    };
  }

  // Utility methods
  private async simulateDelay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async reset(): Promise<void> {
    this.completions = [];
    this.userProgress = [];
  }
}

export const quizCompletionService = new QuizCompletionService();
export default quizCompletionService;
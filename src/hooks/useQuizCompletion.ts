import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { quizCompletionService } from '../services/quizCompletionService';
import { QuizCompletion, QuizAnswer, UserProgress } from '../types/database';

export const useQuizCompletion = (quizId?: string) => {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<QuizCompletion[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's quiz completions
  useEffect(() => {
    if (user?.id) {
      loadUserCompletions();
      loadUserProgress();
    }
  }, [user?.id]);

  const loadUserCompletions = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const userCompletions = await quizCompletionService.findCompletionsByUserId(user.id);
      setCompletions(userCompletions);
    } catch (err) {
      setError('Failed to load quiz completions');
      console.error('Error loading completions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    try {
      const progress = await quizCompletionService.getUserProgress(user.id);
      setUserProgress(progress);
    } catch (err) {
      console.error('Error loading user progress:', err);
    }
  };

  // Submit a quiz completion
  const submitQuizCompletion = async (
    quizId: string,
    answers: QuizAnswer[],
    score: number,
    maxScore: number,
    timeSpent: number,
    podcastId?: string
  ): Promise<QuizCompletion | null> => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const attempts = await quizCompletionService.getUserQuizAttempts(user.id, quizId);
      const percentage = Math.round((score / maxScore) * 100);
      const passed = percentage >= 70; // 70% passing threshold

      const completionData = {
        userId: user.id,
        quizId,
        podcastId,
        score,
        maxScore,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        answers,
        passed,
        attempts: attempts + 1
      };

      const completion = await quizCompletionService.createCompletion(completionData);
      
      // Refresh data
      await loadUserCompletions();
      await loadUserProgress();
      
      return completion;
    } catch (err) {
      setError('Failed to submit quiz completion');
      console.error('Error submitting completion:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has completed a quiz
  const hasCompletedQuiz = async (quizId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      return await quizCompletionService.hasUserCompletedQuiz(user.id, quizId);
    } catch (err) {
      console.error('Error checking quiz completion:', err);
      return false;
    }
  };

  // Check if user has passed a quiz
  const hasPassedQuiz = async (quizId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      return await quizCompletionService.hasUserPassedQuiz(user.id, quizId);
    } catch (err) {
      console.error('Error checking quiz pass:', err);
      return false;
    }
  };

  // Get user's best score for a quiz
  const getBestScore = async (quizId: string): Promise<QuizCompletion | null> => {
    if (!user?.id) return null;
    
    try {
      return await quizCompletionService.getUserBestScore(user.id, quizId);
    } catch (err) {
      console.error('Error getting best score:', err);
      return null;
    }
  };

  // Get quiz attempts count
  const getQuizAttempts = async (quizId: string): Promise<number> => {
    if (!user?.id) return 0;
    
    try {
      return await quizCompletionService.getUserQuizAttempts(user.id, quizId);
    } catch (err) {
      console.error('Error getting quiz attempts:', err);
      return 0;
    }
  };

  // Get recent completions
  const getRecentCompletions = async (limit: number = 5): Promise<QuizCompletion[]> => {
    if (!user?.id) return [];
    
    try {
      return await quizCompletionService.getUserRecentCompletions(user.id, limit);
    } catch (err) {
      console.error('Error getting recent completions:', err);
      return [];
    }
  };

  // Filter completions for specific quiz
  const getQuizCompletions = (targetQuizId: string): QuizCompletion[] => {
    return completions.filter(c => c.quizId === targetQuizId);
  };

  // Get completions for a specific podcast
  const getPodcastCompletions = (podcastId: string): QuizCompletion[] => {
    return completions.filter(c => c.podcastId === podcastId);
  };

  // Calculate statistics
  const getStats = () => {
    if (!userProgress) return null;

    return {
      totalCompleted: userProgress.totalQuizzesCompleted,
      totalPassed: userProgress.totalQuizzesPassed,
      averageScore: userProgress.averageScore,
      completionRate: userProgress.completionRate,
      totalTimeSpent: userProgress.totalTimeSpent,
      streakDays: userProgress.streakDays,
      badges: userProgress.badges,
      lastActivity: userProgress.lastActivityAt
    };
  };

  return {
    // Data
    completions,
    userProgress,
    isLoading,
    error,
    
    // Actions
    submitQuizCompletion,
    loadUserCompletions,
    loadUserProgress,
    
    // Queries
    hasCompletedQuiz,
    hasPassedQuiz,
    getBestScore,
    getQuizAttempts,
    getRecentCompletions,
    getQuizCompletions,
    getPodcastCompletions,
    getStats,
    
    // Computed values
    totalCompleted: userProgress?.totalQuizzesCompleted || 0,
    totalPassed: userProgress?.totalQuizzesPassed || 0,
    averageScore: userProgress?.averageScore || 0,
    badges: userProgress?.badges || [],
    
    // Helper functions
    isQuizCompleted: (quizId: string) => completions.some(c => c.quizId === quizId),
    isQuizPassed: (quizId: string) => completions.some(c => c.quizId === quizId && c.passed),
    getQuizScore: (quizId: string) => {
      const completion = completions.find(c => c.quizId === quizId);
      return completion ? completion.score : 0;
    },
    getQuizPercentage: (quizId: string) => {
      const completion = completions.find(c => c.quizId === quizId);
      return completion ? completion.percentage : 0;
    }
  };
};

export default useQuizCompletion;
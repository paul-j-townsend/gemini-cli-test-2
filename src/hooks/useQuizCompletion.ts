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
      const response = await fetch(`/api/quiz-completion-service?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch completions');
      }
      const userCompletions = await response.json();
      setCompletions(userCompletions);
    } catch (err) {
      console.error('Error loading completions:', err);
      
      // Fallback to mock data for development when database fails
      if (user.id === 'fed2a63e-196d-43ff-9ebc-674db34e72a7') {
        console.log('Database failed, using mock quiz completion data');
        const mockCompletions = [
          {
            id: '1',
            user_id: user.id,
            quiz_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
            podcast_id: 'podcast-1',
            score: 100,
            max_score: 100,
            percentage: 100,
            time_spent: 600,
            completed_at: '2025-07-05T10:30:00Z',
            answers: [
              { questionId: 'q1', selectedAnswers: ['option1'], isCorrect: true, points: 20 }
            ],
            passed: true,
            attempts: 1
          }
        ];
        setCompletions(mockCompletions);
      } else {
        setError('Failed to load quiz completions');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/user-progress?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }
      const progress = await response.json();
      setUserProgress(progress);
    } catch (err) {
      console.error('Error loading user progress:', err);
      
      // Fallback to mock data for development when database fails
      if (user.id === 'fed2a63e-196d-43ff-9ebc-674db34e72a7') {
        console.log('Database failed, using mock user progress data');
        const mockProgress = {
          user_id: user.id,
          total_quizzes_completed: 1,
          total_quizzes_passed: 1,
          total_score: 100,
          total_max_score: 100,
          average_score: 100,
          total_time_spent: 600,
          completion_rate: 100,
          last_activity_at: '2025-07-05T10:30:00Z',
          streak_days: 1,
          badges: [
            {
              id: 'first-quiz',
              name: 'First Steps',
              description: 'Completed your first quiz',
              icon: '🎯',
              earned_at: '2025-07-05T10:30:00Z',
              category: 'completion' as const
            }
          ]
        };
        setUserProgress(mockProgress);
      }
    }
  };

  // Submit a quiz completion
  const submitQuizCompletion = async (
    quizId: string,
    answers: QuizAnswer[],
    score: number,
    maxScore: number,
    timeSpent: number,
    podcastId?: string,
    passPercentage?: number
  ): Promise<QuizCompletion | null> => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate attempts from existing completions
      const attempts = completions.filter(c => c.quiz_id === quizId).length;
      const percentage = Math.round((score / maxScore) * 100);
      const passed = percentage >= (passPercentage || 70); // Use quiz-specific pass percentage or default to 70%

      const completionData = {
        user_id: user.id,
        quiz_id: quizId,
        podcast_id: podcastId,
        score,
        max_score: maxScore,
        percentage,
        time_spent: timeSpent,
        completed_at: new Date().toISOString(),
        answers,
        passed,
        attempts: attempts + 1
      };

      const response = await fetch('/api/quiz-completion-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create completion');
      }

      const completion = await response.json();
      
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
  const hasCompletedQuiz = async (quiz_id: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      return await quizCompletionService.hasUserCompletedQuiz(user.id, quiz_id);
    } catch (err) {
      console.error('Error checking quiz completion:', err);
      return false;
    }
  };

  // Check if user has passed a quiz
  const hasPassedQuiz = async (quiz_id: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      return await quizCompletionService.hasUserPassedQuiz(user.id, quiz_id);
    } catch (err) {
      console.error('Error checking quiz pass:', err);
      return false;
    }
  };

  // Get user's best score for a quiz
  const getBestScore = async (quiz_id: string): Promise<QuizCompletion | null> => {
    if (!user?.id) return null;
    
    try {
      return await quizCompletionService.getUserBestScore(user.id, quiz_id);
    } catch (err) {
      console.error('Error getting best score:', err);
      return null;
    }
  };

  // Get quiz attempts count
  const getQuizAttempts = async (quiz_id: string): Promise<number> => {
    if (!user?.id) return 0;
    
    try {
      return await quizCompletionService.getUserQuizAttempts(user.id, quiz_id);
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

  // Delete a quiz completion
  const deleteCompletion = async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.log('deleteCompletion: User not authenticated.');
      return false;
    }
    
    console.log('deleteCompletion: Attempting to delete completion with ID:', id);
    try {
      const response = await fetch(`/api/quiz-completion-service?id=${id}`, {
        method: 'DELETE',
      });
      
      const success = response.ok;
      console.log('deleteCompletion: API returned status:', response.status);
      
      if (success) {
        console.log('deleteCompletion: Deletion successful from API, refreshing data...');
        await loadUserCompletions();
        await loadUserProgress();
        console.log('deleteCompletion: Data refresh initiated.');
      } else {
        console.log('deleteCompletion: Deletion failed in API.');
      }
      return success;
    } catch (err) {
      console.error('deleteCompletion: Error deleting completion:', err);
      return false;
    }
  };

  // Filter completions for specific quiz
  const getQuizCompletions = (target_quiz_id: string): QuizCompletion[] => {
    return completions.filter(c => c.quiz_id === target_quiz_id);
  };

  // Get completions for a specific podcast
  const getPodcastCompletions = (podcast_id: string): QuizCompletion[] => {
    return completions.filter(c => c.podcast_id === podcast_id);
  };

  // Calculate statistics
  const getStats = () => {
    if (!userProgress) return null;

    return {
      total_completed: userProgress.total_quizzes_completed,
      total_passed: userProgress.total_quizzes_passed,
      average_score: userProgress.average_score,
      completion_rate: userProgress.completion_rate,
      total_time_spent: userProgress.total_time_spent,
      streak_days: userProgress.streak_days,
      badges: userProgress.badges,
      last_activity: userProgress.last_activity_at
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
    deleteCompletion,
    loadUserCompletions,
    loadUserProgress,
    refreshData: async () => {
      await loadUserCompletions();
      await loadUserProgress();
    },
    
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
    total_completed: userProgress?.total_quizzes_completed || 0,
    total_passed: userProgress?.total_quizzes_passed || 0,
    average_score: userProgress?.average_score || 0,
    badges: userProgress?.badges || [],
    
    // Helper functions
    isQuizCompleted: (quiz_id: string) => completions.some(c => c.quiz_id === quiz_id),
    isQuizPassed: (quiz_id: string) => {
      // More robust checking: validate both stored pass status AND actual percentage
      // This handles cases where stale data might have passed=true but percentage=0
      const completion = completions.find(c => c.quiz_id === quiz_id);
      if (!completion) return false;
      return completion.passed && completion.percentage >= 70; // Default 70% threshold
    },
    getQuizScore: (quiz_id: string) => {
      const completion = completions.find(c => c.quiz_id === quiz_id);
      return completion ? completion.score : 0;
    },
    getQuizPercentage: (quiz_id: string) => {
      const completion = completions.find(c => c.quiz_id === quiz_id);
      return completion ? completion.percentage : 0;
    },
    // New function to check if quiz is passed with custom pass percentage
    isQuizPassedWithThreshold: (quiz_id: string, passPercentage: number = 70) => {
      const completion = completions.find(c => c.quiz_id === quiz_id);
      if (!completion) return false;
      return completion.percentage >= passPercentage;
    }
  };
};

export default useQuizCompletion;
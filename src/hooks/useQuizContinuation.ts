import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { QuizContinuationStatus } from '../types/database';

export const useQuizContinuation = (quizId?: string) => {
  const { user } = useAuth();
  const [continuationStatus, setContinuationStatus] = useState<QuizContinuationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && quizId) {
      checkAttemptStatus();
    }
  }, [user?.id, quizId]);

  const checkAttemptStatus = async () => {
    if (!user?.id || !quizId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quiz-continuation?userId=${user.id}&quizId=${quizId}&action=status`);
      
      if (!response.ok) {
        throw new Error('Failed to check attempt status');
      }

      const status: QuizContinuationStatus = await response.json();
      setContinuationStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getRemainingAttempts = async (): Promise<number> => {
    if (!user?.id || !quizId) return 0;

    try {
      const response = await fetch(`/api/quiz-continuation?userId=${user.id}&quizId=${quizId}&action=remaining`);
      
      if (!response.ok) {
        throw new Error('Failed to get remaining attempts');
      }

      const data = await response.json();
      return data.attemptsRemaining;
    } catch (err) {
      console.error('Error getting remaining attempts:', err);
      return 0;
    }
  };

  const getNextAttemptTime = async (): Promise<Date | null> => {
    if (!user?.id || !quizId) return null;

    try {
      const response = await fetch(`/api/quiz-continuation?userId=${user.id}&quizId=${quizId}&action=next-attempt`);
      
      if (!response.ok) {
        throw new Error('Failed to get next attempt time');
      }

      const data = await response.json();
      return data.nextAttemptAvailableAt ? new Date(data.nextAttemptAvailableAt) : null;
    } catch (err) {
      console.error('Error getting next attempt time:', err);
      return null;
    }
  };

  const resetAttempts = async (): Promise<boolean> => {
    if (!user?.id || !quizId) return false;

    try {
      const response = await fetch(`/api/quiz-continuation?action=reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, quizId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset attempts');
      }

      // Refresh status after reset
      await checkAttemptStatus();
      return true;
    } catch (err) {
      console.error('Error resetting attempts:', err);
      return false;
    }
  };

  const recordAttempt = async (passed: boolean = false): Promise<boolean> => {
    if (!user?.id || !quizId) return false;

    try {
      const response = await fetch(`/api/quiz-continuation?action=record-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, quizId, passed }),
      });

      if (!response.ok) {
        throw new Error('Failed to record attempt');
      }

      // Refresh status after recording attempt
      await checkAttemptStatus();
      return true;
    } catch (err) {
      console.error('Error recording attempt:', err);
      return false;
    }
  };

  const formatTimeRemaining = (dateStr: string): string => {
    const targetDate = new Date(dateStr);
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) return 'Available now';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return {
    // State
    continuationStatus,
    loading,
    error,
    
    // Actions
    checkAttemptStatus,
    getRemainingAttempts,
    getNextAttemptTime,
    resetAttempts,
    recordAttempt,
    
    // Computed values
    canAttempt: continuationStatus?.canAttempt || false,
    attemptsRemaining: continuationStatus?.attemptsRemaining || 0,
    totalAttempts: continuationStatus?.totalAttempts || 0,
    attemptsUsed: continuationStatus?.attemptsUsed || 0,
    nextAttemptAvailableAt: continuationStatus?.nextAttemptAvailableAt || null,
    resetAt: continuationStatus?.resetAt || null,
    blockedUntil: continuationStatus?.blockedUntil || null,
    message: continuationStatus?.message || '',
    
    // Utilities
    formatTimeRemaining,
    isBlocked: continuationStatus ? !continuationStatus.canAttempt : false,
    timeUntilNextAttempt: continuationStatus?.nextAttemptAvailableAt 
      ? formatTimeRemaining(continuationStatus.nextAttemptAvailableAt)
      : null,
    timeUntilReset: continuationStatus?.resetAt
      ? formatTimeRemaining(continuationStatus.resetAt)
      : null,
  };
};
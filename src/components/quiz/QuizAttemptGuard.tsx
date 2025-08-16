import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { QuizContinuationStatus } from '../../types/database';
import { LoadingState } from '../ui/LoadingState';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface QuizAttemptGuardProps {
  quizId: string;
  onAttemptAllowed: () => void;
  onAttemptBlocked: (status: QuizContinuationStatus) => void;
}

const QuizAttemptGuard: React.FC<QuizAttemptGuardProps> = ({
  quizId,
  onAttemptAllowed,
  onAttemptBlocked
}) => {
  const { user } = useAuth();
  const [continuationStatus, setContinuationStatus] = useState<QuizContinuationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && quizId) {
      checkAttemptStatus();
    }
  }, [user?.id, quizId]);

  const checkAttemptStatus = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quiz-continuation?userId=${user.id}&quizId=${quizId}&action=status`);
      
      if (!response.ok) {
        throw new Error('Failed to check attempt status');
      }

      const status: QuizContinuationStatus = await response.json();
      setContinuationStatus(status);

      if (status.canAttempt) {
        onAttemptAllowed();
      } else {
        onAttemptBlocked(status);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
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

  if (loading) {
    return <LoadingState message="Checking attempt status..." />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={checkAttemptStatus}
      />
    );
  }

  if (!continuationStatus) {
    return (
      <div className="text-center py-8">
        <p className="text-emerald-600">Unable to check attempt status</p>
      </div>
    );
  }

  // If user can attempt, don't show the guard
  if (continuationStatus.canAttempt) {
    return null;
  }

  return (
    <Card className="p-6 text-center">
      <div className="mb-4">
        <svg 
          className="w-16 h-16 mx-auto text-amber-500 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L4.064 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">
          Quiz Attempt Limited
        </h2>
        <p className="text-emerald-700 mb-4">
          {continuationStatus.message}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 p-4 rounded-lg">
          <h3 className="font-semibold text-emerald-800 mb-2">Attempts</h3>
          <div className="text-2xl font-bold text-emerald-600">
            {continuationStatus.attemptsUsed} / {continuationStatus.totalAttempts}
          </div>
          <p className="text-sm text-emerald-600">
            {continuationStatus.attemptsRemaining} remaining
          </p>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg">
          <h3 className="font-semibold text-emerald-800 mb-2">
            {continuationStatus.nextAttemptAvailableAt ? 'Next Attempt' : 'Reset Date'}
          </h3>
          <div className="text-lg font-bold text-emerald-700">
            {continuationStatus.nextAttemptAvailableAt 
              ? formatTimeRemaining(continuationStatus.nextAttemptAvailableAt)
              : new Date(continuationStatus.resetAt).toLocaleDateString()
            }
          </div>
          <p className="text-sm text-emerald-600">
            {continuationStatus.nextAttemptAvailableAt ? 'Available in' : 'Attempts reset on'}
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-emerald-800 mb-3">
          What can you do now?
        </h3>
        <div className="text-left space-y-2">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-emerald-700">Review the related podcast or materials</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-emerald-700">Try other available quizzes</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-emerald-700">
              {continuationStatus.nextAttemptAvailableAt 
                ? 'Wait for the cooldown period to end'
                : 'Wait for the next reset period'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
        <Button 
          onClick={checkAttemptStatus}
          variant="primary"
        >
          Check Again
        </Button>
      </div>
    </Card>
  );
};

export default QuizAttemptGuard;
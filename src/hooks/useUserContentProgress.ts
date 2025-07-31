import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserContentProgress } from '@/services/userContentProgressService';

export const useUserContentProgress = (contentId?: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserContentProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging removed

  // Load progress when user or contentId changes
  useEffect(() => {
    if (user?.id && contentId) {
      loadProgress();
    }
  }, [user?.id, contentId]);

  const loadProgress = async () => {
    if (!user?.id || !contentId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/user-content-progress?userId=${user.id}&contentId=${contentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setProgress(data);
      setError(null);
    } catch (err) {
      console.error('Error loading user content progress:', err);
      setError('Failed to load progress');
      // Set default progress on error
      setProgress({
        user_id: user.id,
        content_id: contentId,
        has_listened: false,
        listen_progress_percentage: 0,
        quiz_completed: false,
        report_downloaded: false,
        certificate_downloaded: false
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (action: string, data?: any) => {
    if (!user?.id || !contentId) {
      console.error('Missing user ID or content ID:', { userId: user?.id, contentId });
      return false;
    }

    console.log('Updating progress:', { userId: user.id, contentId, action, data });

    try {
      const response = await fetch('/api/user-content-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          contentId,
          action,
          data
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not ok:', response.status, errorText);
        throw new Error('Failed to update progress');
      }

      const updatedProgress = await response.json();
      setProgress(updatedProgress);
      return true;
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress');
      return false;
    }
  };

  const updateListenProgress = useCallback(async (progressPercentage: number, hasListened: boolean = false) => {
    return await updateProgress('listen_progress', { progressPercentage, hasListened });
  }, [updateProgress]);

  const markQuizCompleted = useCallback(async () => {
    return await updateProgress('quiz_completed');
  }, [updateProgress]);

  const markReportDownloaded = useCallback(async () => {
    return await updateProgress('report_downloaded');
  }, [updateProgress]);

  const markCertificateDownloaded = useCallback(async () => {
    return await updateProgress('certificate_downloaded');
  }, [updateProgress]);

  return {
    // Data
    progress,
    loading,
    error,

    // Actions
    loadProgress,
    updateListenProgress,
    markQuizCompleted,
    markReportDownloaded,
    markCertificateDownloaded,

    // Computed values
    hasListened: progress?.has_listened || false,
    quizCompleted: progress?.quiz_completed || false,
    reportDownloaded: progress?.report_downloaded || false,
    certificateDownloaded: progress?.certificate_downloaded || false,
    listenProgress: progress?.listen_progress_percentage || 0,
  };
};
import React, { useState, useEffect } from 'react';
import { useQuizCompletion } from '../hooks/useQuizCompletion';
import { useAuth } from '../hooks/useAuth';
import { calculateUserProgress, formatDuration, calculateUserLevel } from '../utils/progressUtils';
import { quizService } from '../services/quizService';
import type { ProgressSummary, Achievement } from '../utils/progressUtils';

export const UserProgressDashboard: React.FC = () => {
  const { user } = useAuth();
  const { completions, userProgress, isLoading, deleteCompletion } = useQuizCompletion();
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [quizTitles, setQuizTitles] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Completions updated in UserProgressDashboard:', completions);
    if (completions.length > 0) {
      const summary = calculateUserProgress(completions);
      setProgressSummary(summary);
      console.log('Progress summary updated:', summary);
    } else {
      setProgressSummary(null);
      console.log('No completions, progress summary reset.');
    }
  }, [completions]);

  // Load quiz titles for all completions
  useEffect(() => {
    const loadQuizTitles = async () => {
      if (completions.length > 0) {
        const titles: Record<string, string> = {};
        const uniqueQuizIds = Array.from(new Set(completions.map(c => c.quiz_id)));
        
        await Promise.all(
          uniqueQuizIds.map(async (quizId) => {
            titles[quizId] = await quizService.getQuizTitle(quizId);
          })
        );
        
        setQuizTitles(titles);
      }
    };

    loadQuizTitles();
  }, [completions]);

  // Handle deletion of a completion
  const handleDeleteCompletion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz completion? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    
    try {
      console.log('handleDeleteCompletion: Attempting to delete completion with ID:', id);
      const success = await deleteCompletion(id);
      console.log('handleDeleteCompletion: Delete operation result:', success);
      
      if (success) {
        console.log('handleDeleteCompletion: Successfully deleted completion');
      } else {
        console.error('handleDeleteCompletion: Failed to delete completion');
        alert('Failed to delete completion. Please try again.');
      }
    } catch (error) {
      console.error('handleDeleteCompletion: Error during deletion:', error);
      alert('An error occurred while deleting the completion.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-neutral-600 mt-2">Loading your progress...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600">Please log in to view your progress.</p>
      </div>
    );
  }

  const userLevel = userProgress ? calculateUserLevel(userProgress.total_score) : { level: 1, progress: 0, nextLevelScore: 1000 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Learning Progress</h1>
            <p className="text-primary-100">Welcome back, {user.name}!</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">Level {userLevel.level}</div>
            <div className="text-sm text-primary-100">
              {userLevel.nextLevelScore} pts to next level
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Level {userLevel.level + 1}</span>
            <span>{userLevel.progress}%</span>
          </div>
          <div className="w-full bg-primary-700 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${userLevel.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {progressSummary?.total_quizzes_completed || 0}
          </div>
          <p className="text-neutral-600">Quizzes Completed</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {progressSummary?.total_quizzes_passed || 0}
          </div>
          <p className="text-neutral-600">Quizzes Passed</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {progressSummary?.average_score || 0}%
          </div>
          <p className="text-neutral-600">Average Score</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {progressSummary?.streak_days || 0}
          </div>
          <p className="text-neutral-600">Day Streak</p>
        </div>
      </div>

      {/* Detailed Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Activity</h2>
          {progressSummary?.recent_activity && progressSummary.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {progressSummary.recent_activity.map((completion) => (
                <div key={completion.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg group hover:bg-neutral-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      completion.passed ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {completion.passed ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">
                        {quizTitles[completion.quiz_id] || `Quiz #${completion.quiz_id.slice(0, 8)}...`}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDuration(completion.time_spent)} • {new Date(completion.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${completion.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {completion.percentage}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCompletion(completion.id)}
                      disabled={deletingId === completion.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md disabled:opacity-50"
                      title="Delete completion"
                    >
                      {deletingId === completion.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No quiz activity yet</p>
              <p className="text-sm">Complete a quiz to see your progress!</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Achievements</h2>
          {progressSummary?.achievements && progressSummary.achievements.length > 0 ? (
            <div className="space-y-3">
              {progressSummary.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div>
                    <p className="font-medium text-neutral-900">{achievement.name}</p>
                    <p className="text-sm text-neutral-600">{achievement.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p>No achievements yet</p>
              <p className="text-sm">Complete quizzes to earn achievements!</p>
            </div>
          )}
        </div>
      </div>

      {/* Study Statistics */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Study Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {formatDuration(progressSummary?.time_spent || 0)}
            </div>
            <p className="text-neutral-600">Total Study Time</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {progressSummary?.total_quizzes_passed || 0}
            </div>
            <p className="text-neutral-600">Quizzes Passed</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {userProgress?.badges?.length || 0}
            </div>
            <p className="text-neutral-600">Badges Earned</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProgressDashboard;
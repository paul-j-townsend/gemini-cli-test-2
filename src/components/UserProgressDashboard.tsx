import React, { useState, useEffect } from 'react';
import { useQuizCompletion } from '../hooks/useQuizCompletion';
import { useAuth } from '../hooks/useAuth';
import { calculateUserProgress, formatDuration, calculateUserLevel } from '../utils/progressUtils';
import { quizService } from '../services/quizService';
import type { ProgressSummary, Achievement } from '../utils/progressUtils';

export const UserProgressDashboard: React.FC = () => {
  const { user } = useAuth();
  const { completions, userProgress, isLoading } = useQuizCompletion();
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [quizTitles, setQuizTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (completions.length > 0) {
      const summary = calculateUserProgress(completions);
      setProgressSummary(summary);
    }
  }, [completions]);

  // Load quiz titles for all completions
  useEffect(() => {
    const loadQuizTitles = async () => {
      if (completions.length > 0) {
        const titles: Record<string, string> = {};
        const uniqueQuizIds = [...new Set(completions.map(c => c.quizId))];
        
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-neutral-600">Loading progress...</span>
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

  const userLevel = userProgress ? calculateUserLevel(userProgress.totalScore) : { level: 1, progress: 0, nextLevelScore: 1000 };

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
        
        {/* Level Progress Bar */}
        <div className="mt-4">
          <div className="bg-primary-400 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${userLevel.progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-primary-100 mt-1">
            {userLevel.progress}% to Level {userLevel.level + 1}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-600">Total Completed</p>
              <p className="text-2xl font-bold text-neutral-900">{progressSummary?.totalQuizzesCompleted || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-600">Pass Rate</p>
              <p className="text-2xl font-bold text-neutral-900">{progressSummary?.completionRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-600">Average Score</p>
              <p className="text-2xl font-bold text-neutral-900">{progressSummary?.averageScore || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-600">Streak</p>
              <p className="text-2xl font-bold text-neutral-900">{progressSummary?.streakDays || 0} days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Activity</h2>
          {progressSummary?.recentActivity && progressSummary.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {progressSummary.recentActivity.map((completion) => (
                <div key={completion.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
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
                        {quizTitles[completion.quizId] || `Quiz #${completion.quizId.slice(0, 8)}...`}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDuration(completion.timeSpent)} • {new Date(completion.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${completion.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {completion.percentage}%
                    </p>
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
              {progressSummary.achievements.slice(0, 5).map((achievement) => (
                <div key={achievement.id} className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div>
                    <p className="font-medium text-neutral-900">{achievement.name}</p>
                    <p className="text-sm text-neutral-600">{achievement.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
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
              {formatDuration(progressSummary?.timeSpent || 0)}
            </div>
            <p className="text-neutral-600">Total Study Time</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {progressSummary?.totalQuizzesPassed || 0}
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
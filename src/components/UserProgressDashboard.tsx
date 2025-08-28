import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuizCompletion } from '../hooks/useQuizCompletion';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '@/contexts/UserContext';
import { formatDuration, calculateUserLevel } from '../utils/progressUtils';
import { useMemoizedProgressCalculations } from '../utils/performanceUtils';
import Certificate from './Certificate';
import PurchasedContentCard from './PurchasedContentCard';
import { DownloadService } from '@/services/downloadService';
import { QuizCompletion } from '../types/database';

export const UserProgressDashboard: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { accessibleContentIds, paymentSummary } = useUser();
  const { completions, userProgress, isLoading, deleteCompletion } = useQuizCompletion();
  const [quizTitles, setQuizTitles] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState<QuizCompletion | null>(null);
  const [purchasedContent, setPurchasedContent] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const progressSummary = useMemoizedProgressCalculations(completions);

  const uniqueQuizIds = useMemo(() => 
    Array.from(new Set(completions.map(c => c.quiz_id))), 
    [completions]
  );

  useEffect(() => {
    const loadQuizTitles = async () => {
      if (uniqueQuizIds.length > 0) {
        const titles: Record<string, string> = {};
        
        // First, try to get titles from preserved quiz completion data
        const preservedTitles: Record<string, string> = {};
        completions.forEach(completion => {
          const contentId = completion.quiz_id;
          if (contentId && (completion.quiz_title || completion.content_title)) {
            preservedTitles[contentId] = completion.quiz_title || completion.content_title || '';
          }
        });
        
        await Promise.all(
          uniqueQuizIds.map(async (contentId) => {
            try {
              const response = await fetch(`/api/admin/content?id=${contentId}&include_deleted=true`);
              if (response.ok) {
                const content = await response.json();
                const title = content.title || content.quiz_title || `Content #${contentId.slice(0, 8)}...`;
                const isDeleted = content.deleted_at ? ' (Deleted)' : '';
                titles[contentId] = title + isDeleted;
              } else if (response.status === 404) {
                // Use preserved title if available, otherwise fallback
                titles[contentId] = preservedTitles[contentId] 
                  ? `${preservedTitles[contentId]} (Permanently Deleted)`
                  : `Deleted Content #${contentId.slice(0, 8)}...`;
              } else {
                titles[contentId] = preservedTitles[contentId] || `Content #${contentId.slice(0, 8)}...`;
              }
            } catch (error) {
              console.error('Failed to fetch content title:', error);
              titles[contentId] = preservedTitles[contentId] || `Content #${contentId.slice(0, 8)}...`;
            }
          })
        );
        
        setQuizTitles(titles);
      }
    };

    loadQuizTitles();
  }, [uniqueQuizIds, completions]);

  // Load purchased content data
  useEffect(() => {
    const loadPurchasedContent = async () => {
      if (!user?.id || accessibleContentIds.length === 0) {
        setPurchasedContent([]);
        return;
      }

      setLoadingPurchases(true);
      try {
        const contentPromises = accessibleContentIds.map(async (contentId) => {
          const response = await fetch(`/api/admin/content?id=${contentId}`);
          if (response.ok) {
            const content = await response.json();
            return {
              id: contentId,
              title: content.title || `Content ${contentId.slice(0, 8)}...`,
              thumbnail_url: content.thumbnail_url,
              purchased_at: new Date().toISOString() // This should come from purchase data
            };
          }
          return null;
        });

        const contentResults = await Promise.all(contentPromises);
        setPurchasedContent(contentResults.filter(Boolean));
      } catch (error) {
        console.error('Error loading purchased content:', error);
        setPurchasedContent([]);
      } finally {
        setLoadingPurchases(false);
      }
    };

    loadPurchasedContent();
  }, [user?.id, accessibleContentIds]);

  // Download handler functions
  const handleDownloadReport = useCallback(async (contentId: string) => {
    if (!user?.id) return;
    try {
      await DownloadService.downloadLearningReport(user.id, contentId);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download learning report. Please try again.');
    }
  }, [user?.id]);

  const handleDownloadPodcast = useCallback(async (contentId: string) => {
    if (!user?.id) return;
    try {
      await DownloadService.downloadPodcast(user.id, contentId);
    } catch (error) {
      console.error('Failed to download podcast:', error);
      alert('Failed to download podcast. Please try again.');
    }
  }, [user?.id]);

  const handleDownloadCertificate = useCallback(async (contentId: string) => {
    if (!user?.id) return;
    try {
      // Find the completion for this content to show certificate
      const completion = completions.find(c => c.quiz_id === contentId);
      if (completion) {
        setShowCertificate(completion);
      }
    } catch (error) {
      console.error('Failed to show certificate:', error);
      alert('Failed to show certificate. Please try again.');
    }
  }, [user?.id, completions]);

  const handleDeleteCompletion = useCallback(async (id: string) => {
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
  }, [deleteCompletion]);

  const userLevel = useMemo(() => 
    userProgress ? calculateUserLevel(userProgress.total_score) : { level: 1, progress: 0, nextLevelScore: 1000 },
    [userProgress]
  );


  const recentActivity = useMemo(() => 
    progressSummary?.recentActivity || [],
    [progressSummary]
  );

  const achievements = useMemo(() => 
    progressSummary?.achievements || [],
    [progressSummary]
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="text-emerald-700 mt-2">Loading your progress...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-emerald-700">Please log in to view your progress.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-emerald-200 text-center">
          <div className="text-3xl font-bold text-emerald-600 mb-2">
            {progressSummary?.totalQuizzes || 0}
          </div>
          <p className="text-emerald-700">Quizzes Completed</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-emerald-200 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {(progressSummary?.totalCPDHours || 0).toFixed(1)}
          </div>
          <p className="text-emerald-700">CPD Hours Earned</p>
        </div>
      </div>

      {/* My Purchased Content */}
      <div className="bg-white rounded-xl p-6 border border-emerald-200">
        <h2 className="text-xl font-bold text-emerald-900 mb-4">My Purchased Content</h2>
        {loadingPurchases ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-emerald-700 mt-2">Loading your purchases...</p>
          </div>
        ) : purchasedContent.length > 0 ? (
          <div className="space-y-4">
            {purchasedContent.map((content) => (
              <PurchasedContentCard
                key={content.id}
                content={content}
                onDownloadReport={() => handleDownloadReport(content.id)}
                onDownloadPodcast={() => handleDownloadPodcast(content.id)}
                onDownloadCertificate={() => handleDownloadCertificate(content.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-emerald-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p>No purchased content yet</p>
            <p className="text-sm">Purchase a learning unit to access content downloads!</p>
          </div>
        )}
      </div>

      {/* Detailed Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-emerald-200">
          <h2 className="text-xl font-bold text-emerald-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((completion) => (
                <div key={completion.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg group hover:bg-emerald-100 transition-colors duration-200">
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
                      <p className="text-sm font-medium text-emerald-900">
                        {quizTitles[completion.quiz_id] || `Quiz #${completion.quiz_id.slice(0, 8)}...`}
                      </p>
                      <p className="text-xs text-emerald-500">
                        {formatDuration(completion.time_spent)} • {new Date(completion.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${completion.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {completion.passed ? 'Completed' : 'Incomplete'}
                      </p>
                    </div>
                    {completion.passed && (
                      <button
                        onClick={() => setShowCertificate(completion)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md"
                        title="Download certificate"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCompletion(completion.id)}
                      disabled={deletingId === completion.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-md disabled:opacity-50"
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
            <div className="text-center py-8 text-emerald-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No quiz activity yet</p>
              <p className="text-sm">Complete a quiz to see your progress!</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl p-6 border border-emerald-200">
          <h2 className="text-xl font-bold text-emerald-900 mb-4">Achievements</h2>
          {achievements.length > 0 ? (
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div>
                    <p className="font-medium text-emerald-900">{achievement.name}</p>
                    <p className="text-sm text-emerald-600">{achievement.description}</p>
                    <p className="text-xs text-emerald-500 mt-1">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-emerald-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p>No achievements yet</p>
              <p className="text-sm">Complete quizzes to earn achievements!</p>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-emerald-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-emerald-900">Certificate of Completion</h2>
              <button
                onClick={() => setShowCertificate(null)}
                className="text-emerald-400 hover:text-emerald-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <Certificate
                completion={showCertificate}
                userName={user?.name || 'User'}
                quizTitle={quizTitles[showCertificate.quiz_id] || 'Quiz'}
                onDownload={() => setShowCertificate(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

UserProgressDashboard.displayName = 'UserProgressDashboard';

export default UserProgressDashboard;
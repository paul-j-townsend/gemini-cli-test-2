import React, { useState } from 'react';
import { Button } from '../ui/Button';
import PadlockIcon from '../PadlockIcon';
import Certificate from '../Certificate';
import { useAuth } from '../../hooks/useAuth';
import { QuizCompletion as QuizCompletionType } from '../../types/database';

interface ScoreData {
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
}

interface QuizCompletionProps {
  score: ScoreData;
  onRestartQuiz: () => void;
  quizTitle?: string;
  episodeTitle?: string;
  episodeDuration?: number; // Duration in seconds for CPD calculation
  quizId?: string;
  completion?: QuizCompletionType;
}

export const QuizCompletion: React.FC<QuizCompletionProps> = ({
  score,
  onRestartQuiz,
  quizTitle,
  episodeTitle,
  episodeDuration,
  quizId,
  completion
}) => {
  const { user } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);

  const calculateCPDHours = () => {
    if (!episodeDuration) return 1; // Default to 1 hour if duration not available
    const hours = Math.floor(episodeDuration / 3600);
    return hours > 0 ? hours : 1; // Minimum 1 hour CPD
  };

  const cpdHours = calculateCPDHours();

  const handleGetCertificate = () => {
    if (completion) {
      setShowCertificate(true);
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up border border-emerald-100">
      {/* Celebration Header */}
      <div className="mb-8">
        <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center relative overflow-hidden ${
          score.passed ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-2xl' : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-2xl'
        }`}>
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          {score.passed ? (
            <div className="relative">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-xs">🏆</span>
              </div>
            </div>
          ) : (
            <svg className="w-16 h-16 text-white relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-emerald-900">CPD Assessment Complete!</h2>
          <p className={`text-2xl font-semibold ${
            score.passed ? 'text-green-600' : 'text-orange-600'
          }`}>
            {score.passed ? 'Professional Excellence Achieved! 🎉' : 'Keep Learning & Growing 📚'}
          </p>
          {score.passed && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-green-700 font-medium">{cpdHours} CPD Hour{cpdHours > 1 ? 's' : ''} Earned</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Results Panel */}
      <div className={`rounded-2xl p-8 mb-8 border-2 shadow-lg ${
        score.passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Completion Status */}
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${
              score.passed ? 'text-green-600' : 'text-orange-600'
            }`}>
              {score.passed ? '✓' : '○'}
            </div>
            <div className="text-sm text-emerald-600 font-medium">Status</div>
          </div>
          
          {/* CPD Status */}
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${
              score.passed ? 'text-green-600' : 'text-orange-600'
            }`}>
              {score.passed ? 'VALIDATED' : 'REVIEW'}
            </div>
            <div className="text-sm text-emerald-600 font-medium">CPD Status</div>
          </div>
        </div>
        
        {/* Professional Feedback */}
        <div className={`rounded-xl p-4 ${
          score.passed ? 'bg-green-100 border border-green-200' : 'bg-orange-100 border border-orange-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <svg className={`w-5 h-5 ${
              score.passed ? 'text-green-600' : 'text-orange-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className={`font-semibold ${
              score.passed ? 'text-green-800' : 'text-orange-800'
            }`}>Professional Assessment</span>
          </div>
          <p className={`text-sm leading-relaxed ${
            score.passed ? 'text-green-700' : 'text-orange-700'
          }`}>
            {score.passed 
              ? 'Your comprehensive understanding of veterinary principles has been validated. This assessment confirms your professional competency and qualifies you for 1 hour CPD certification.'
              : 'This assessment helps identify areas for continued professional development. Review the explanations and consider additional study to strengthen your veterinary knowledge base.'
            }
          </p>
        </div>
        
        <div className="mt-4 text-xs text-emerald-500 font-medium text-center">
          Veterinary Professional Standard: {score.passed ? 'Met ✓' : 'Requires completion for CPD validation'}
        </div>
      </div>
      
      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRestartQuiz}
          variant="secondary"
          className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {score.passed ? 'Retake for Practice' : 'Retake Assessment'}
        </Button>
        
        <Button
          disabled={!score.passed}
          variant="primary"
          onClick={handleGetCertificate}
          className={`flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold ${
            score.passed ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg' : ''
          }`}
        >
          <PadlockIcon isLocked={!score.passed} />
          <span>{score.passed ? 'Download CPD Certificate' : 'Certificate Locked'}</span>
          {score.passed && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </Button>
      </div>

      {/* Certificate Modal */}
      {showCertificate && completion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-white rounded-xl w-fit h-fit max-w-[95vw] max-h-[95vh] flex flex-col">
            <div className="p-4 border-b border-emerald-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-emerald-900 text-center">Certificate of Completion</h2>
            </div>
            <div className="p-4 flex items-center justify-center">
              <div className="transform scale-75 sm:scale-90 md:scale-100 origin-center">
                <Certificate
                  completion={completion}
                  userName={user?.name || 'User'}
                  quizTitle={episodeTitle || quizTitle || 'Quiz'}
                  onDownload={() => setShowCertificate(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCompletion;
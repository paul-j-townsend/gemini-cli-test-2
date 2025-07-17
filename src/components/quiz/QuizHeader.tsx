import React from 'react';
import { QuizData } from '../../hooks/useQuizState';

interface QuizHeaderProps {
  quiz: QuizData;
  currentQuestionIndex: number;
  progressPercentage: number;
}

export const QuizHeader: React.FC<QuizHeaderProps> = React.memo(({
  quiz,
  currentQuestionIndex,
  progressPercentage
}) => {
  const totalQuestions = quiz.questions?.length || 0;
  
  return (
    <div className="mb-8">
      {/* CPD Assessment Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-medium opacity-90">Veterinary CPD Assessment</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{quiz.title || 'Professional Knowledge Quiz'}</h1>
            {quiz.description && (
              <p className="text-blue-100 leading-relaxed">{quiz.description}</p>
            )}
          </div>
          <div className="flex-shrink-0 ml-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{currentQuestionIndex + 1}</div>
              <div className="text-xs opacity-80">of {totalQuestions}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Progress Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold text-neutral-900">Assessment Progress</span>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-full">
            <span className="text-sm font-bold text-blue-800">{Math.round(progressPercentage)}% Complete</span>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full bg-neutral-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden" 
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-neutral-600 mt-2">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {totalQuestions - currentQuestionIndex - 1} remaining
          </span>
        </div>
      </div>
    </div>
  );
});

QuizHeader.displayName = 'QuizHeader';

export default QuizHeader;
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
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">{quiz.title}</h2>
      </div>
      {quiz.description && (
        <p className="text-neutral-600 mb-4">{quiz.description}</p>
      )}
      
      {/* Progress Bar */}
      <div className="bg-neutral-200 rounded-full h-2 mb-2">
        <div 
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm text-neutral-500">
        <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
        <span>{progressPercentage}% complete</span>
      </div>
    </div>
  );
});

QuizHeader.displayName = 'QuizHeader';

export default QuizHeader;
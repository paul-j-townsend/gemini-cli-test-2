import React, { useMemo } from 'react';
import { Question, QuizAttempt } from '../../hooks/useQuizState';

interface QuestionDisplayProps {
  question: Question;
  showExplanation: boolean;
  lastAttempt: QuizAttempt | undefined;
  hasMultipleCorrectAnswers: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = React.memo(({
  question,
  showExplanation,
  lastAttempt,
  hasMultipleCorrectAnswers
}) => {
  const isCurrentQuestionCorrect = useMemo(() => 
    lastAttempt && lastAttempt.is_correct, 
    [lastAttempt]
  );

  return (
    <div>

      <h3 className="text-base lg:text-lg font-normal text-neutral-900 mb-4 leading-relaxed">
        {question.question_text}
      </h3>
      
      {/* Multiple choice indicator */}
      {hasMultipleCorrectAnswers && !showExplanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center text-blue-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Multiple answers may be correct - select all that apply</span>
          </div>
        </div>
      )}

      {/* Feedback and Explanation */}
      {showExplanation && (
        <>
          {/* Feedback Message */}
          <div className={`border-l-4 p-4 rounded-r-xl mb-4 animate-fade-in-up ${
            isCurrentQuestionCorrect 
              ? 'bg-success-50 border-success-400' 
              : 'bg-error-50 border-error-400'
          }`}>
            <div className="flex items-start">
              {isCurrentQuestionCorrect ? (
                <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-error-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div>
                <h4 className={`font-semibold mb-1 ${
                  isCurrentQuestionCorrect ? 'text-success-900' : 'text-error-900'
                }`}>
                  {isCurrentQuestionCorrect ? 'Correct!' : 'Incorrect'}
                </h4>
                <p className={`leading-relaxed ${
                  isCurrentQuestionCorrect ? 'text-success-800' : 'text-error-800'
                }`}>
                  {isCurrentQuestionCorrect 
                    ? 'You can proceed to the next question or finish the quiz!' 
                    : 'That\'s not quite right. Please try again!'
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Explanation - Only show when answer is correct */}
          {question.explanation && isCurrentQuestionCorrect && (
            <div className="bg-primary-50 border-l-4 border-primary-400 p-4 rounded-r-xl mb-6 animate-fade-in-up">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">Explanation:</h4>
                  <p className="text-primary-800 leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

QuestionDisplay.displayName = 'QuestionDisplay';

export default QuestionDisplay;
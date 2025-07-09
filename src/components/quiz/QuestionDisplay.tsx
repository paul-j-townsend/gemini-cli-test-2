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
      {/* Learning Outcome */}
      {question.learning_outcome && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Learning Outcome:</h4>
              <p className="text-green-800 leading-relaxed">{question.learning_outcome}</p>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-4 leading-relaxed">
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
          
          {/* Rationale - Only show when answer is correct */}
          {question.rationale && isCurrentQuestionCorrect && (
            <div className="bg-primary-50 border-l-4 border-primary-400 p-4 rounded-r-xl mb-6 animate-fade-in-up">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">Rationale:</h4>
                  <p className="text-primary-800 leading-relaxed">{question.rationale}</p>
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
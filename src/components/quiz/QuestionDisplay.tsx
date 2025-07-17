import React, { useMemo } from 'react';
import { Question, QuizAttempt } from '../../hooks/useQuizState';

interface QuestionDisplayProps {
  question: Question;
  showExplanation: boolean;
  lastAttempt: QuizAttempt | undefined;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = React.memo(({
  question,
  showExplanation,
  lastAttempt
}) => {
  const isCurrentQuestionCorrect = useMemo(() => 
    lastAttempt && lastAttempt.is_correct, 
    [lastAttempt]
  );

  return (
    <div>
      {/* Learning Context Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 text-sm mb-1">CPD Learning Assessment</h4>
            <p className="text-blue-800 text-xs leading-relaxed">This question tests your understanding of core veterinary principles. Take your time to consider all aspects.</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-6 leading-relaxed border-l-4 border-green-400 pl-4 bg-green-50 py-3 rounded-r-lg">
        {question.question_text}
      </h3>
      

      {/* Feedback and Explanation */}
      {showExplanation && (
        <>
          {/* Combined Feedback and Clinical Explanation */}
          <div className={`border-l-4 p-4 rounded-r-xl mb-6 animate-fade-in-up ${
            isCurrentQuestionCorrect 
              ? 'bg-success-50 border-success-400' 
              : 'bg-error-50 border-error-400'
          }`}>
            <div className="flex items-start">
              {isCurrentQuestionCorrect ? (
                <svg className="w-5 h-5 text-success-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-error-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div className="flex-1">
                <h4 className={`font-semibold mb-2 ${
                  isCurrentQuestionCorrect ? 'text-success-900' : 'text-error-900'
                }`}>
                  {isCurrentQuestionCorrect ? 'Correct!' : 'Incorrect'}
                </h4>
                <p className={`leading-relaxed mb-4 ${
                  isCurrentQuestionCorrect ? 'text-success-800' : 'text-error-800'
                }`}>
                  {isCurrentQuestionCorrect 
                    ? 'You can proceed to the next question or finish the quiz!' 
                    : 'That\'s not quite right. Please try again!'
                  }
                </p>
                
                {/* Clinical Explanation within same panel */}
                {question.explanation && isCurrentQuestionCorrect && (
                  <div className="border-t border-success-200/50 pt-4">
                    <div className="flex items-start gap-2 mb-2">
                      <svg className="w-4 h-4 text-success-700 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h5 className="font-semibold text-success-900">Clinical Explanation:</h5>
                    </div>
                    <p className="text-success-800 leading-relaxed ml-6">{question.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

QuestionDisplay.displayName = 'QuestionDisplay';

export default QuestionDisplay;
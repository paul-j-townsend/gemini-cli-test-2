import React, { useMemo } from 'react';
import { Button } from '../ui/Button';

interface QuizNavigationProps {
  showExplanation: boolean;
  selectedAnswers: string[];
  isCurrentQuestionCorrect: boolean;
  isLastQuestion: boolean;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
}

export const QuizNavigation: React.FC<QuizNavigationProps> = React.memo(({
  showExplanation,
  selectedAnswers,
  isCurrentQuestionCorrect,
  isLastQuestion,
  onSubmitAnswer,
  onNextQuestion
}) => {
  const isSubmitDisabled = useMemo(() => 
    selectedAnswers.length === 0, 
    [selectedAnswers.length]
  );

  const buttonContent = useMemo(() => {
    if (!isCurrentQuestionCorrect) {
      return (
        <>
          Try Again
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </>
      );
    }
    
    if (isLastQuestion) {
      return (
        <>
          Finish Quiz
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </>
      );
    }
    
    return (
      <>
        Next Question
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </>
    );
  }, [isCurrentQuestionCorrect, isLastQuestion]);

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-emerald-500">
      </div>
      
      <div className="flex gap-3">
        {!showExplanation ? (
          <Button
            onClick={onSubmitAnswer}
            disabled={isSubmitDisabled}
            variant="primary"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={onNextQuestion}
            variant="primary"
          >
            {buttonContent}
          </Button>
        )}
      </div>
    </div>
  );
});

QuizNavigation.displayName = 'QuizNavigation';

export default QuizNavigation;
import React, { useMemo, useCallback } from 'react';
import { McqAnswer } from '../../hooks/useQuizState';

interface AnswerOptionsProps {
  answers: McqAnswer[];
  selectedAnswers: string[];
  showExplanation: boolean;
  hasMultipleCorrectAnswers: boolean;
  onAnswerSelect: (answerId: string) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = React.memo(({
  answers,
  selectedAnswers,
  showExplanation,
  hasMultipleCorrectAnswers,
  onAnswerSelect
}) => {
  const sortedAnswers = useMemo(() => {
    if (!answers || answers.length === 0) return [];
    return [...answers].sort((a, b) => a.answer_letter.localeCompare(b.answer_letter));
  }, [answers]);

  const handleAnswerClick = useCallback((answerId: string) => {
    if (!showExplanation) {
      onAnswerSelect(answerId);
    }
  }, [onAnswerSelect, showExplanation]);

  if (!answers || answers.length === 0) {
    return (
      <div className="text-center py-4 text-neutral-500">
        No answer options available for this question.
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {sortedAnswers.map(answer => {
          const isSelected = selectedAnswers.includes(answer.id);
          const isCorrect = answer.is_correct;
          const isWrong = showExplanation && isSelected && !isCorrect;
          const showCorrect = showExplanation && isCorrect;
          
          return (
            <label 
              key={answer.id} 
              className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-soft group ${
                isSelected && !showExplanation ? 'border-primary-500 bg-primary-50' : 
                showCorrect ? 'border-success-500 bg-success-50' :
                isWrong ? 'border-error-500 bg-error-50' :
                'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              } ${showExplanation ? 'cursor-default' : ''}`}
              onClick={() => handleAnswerClick(answer.id)}
            >
              <div className={`flex-shrink-0 w-6 h-6 mr-4 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                hasMultipleCorrectAnswers ? 'rounded border-2' : 'rounded-full border-2'
              } ${
                isSelected && !showExplanation ? 'border-primary-500 bg-primary-500' :
                showCorrect ? 'border-success-500 bg-success-500' :
                isWrong ? 'border-error-500 bg-error-500' :
                'border-neutral-300 group-hover:border-neutral-400'
              }`}>
                {showCorrect && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isWrong && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {isSelected && !showExplanation && (
                  hasMultipleCorrectAnswers ? (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )
                )}
              </div>
              <div className="flex-grow">
                <p className={`text-neutral-800 leading-relaxed ${
                  showCorrect ? 'font-medium' : ''
                }`}>
                  {answer.answer_text}
                </p>
              </div>
            </label>
          );
        })}
    </div>
  );
});

AnswerOptions.displayName = 'AnswerOptions';

export default AnswerOptions;
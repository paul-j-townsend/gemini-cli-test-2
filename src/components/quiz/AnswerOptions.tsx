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
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold text-neutral-900">Select the {hasMultipleCorrectAnswers ? 'correct answers' : 'best answer'}:</span>
        {hasMultipleCorrectAnswers && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Multiple Selection</span>
        )}
      </div>
      
      {sortedAnswers.map((answer, index) => {
          const isSelected = selectedAnswers.includes(answer.id);
          const isCorrect = answer.is_correct;
          const isWrong = showExplanation && isSelected && !isCorrect;
          const showCorrect = showExplanation && isSelected && isCorrect;
          const letterOption = String.fromCharCode(65 + index); // A, B, C, D...
          
          return (
            <label 
              key={answer.id} 
              className={`flex items-start p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md group ${
                isSelected && !showExplanation ? 'border-blue-500 bg-blue-50 shadow-sm' : 
                showCorrect ? 'border-green-500 bg-green-50 shadow-sm' :
                isWrong ? 'border-red-500 bg-red-50 shadow-sm' :
                'border-neutral-200 hover:border-blue-300 hover:bg-blue-50/50'
              } ${showExplanation ? 'cursor-default' : ''}`}
              onClick={() => handleAnswerClick(answer.id)}
            >
              {/* Enhanced Option Letter/Indicator */}
              <div className="flex-shrink-0 mr-4">
                <div className={`w-10 h-10 flex items-center justify-center transition-all duration-300 font-bold text-sm ${
                  hasMultipleCorrectAnswers ? 'rounded-lg border-2' : 'rounded-full border-2'
                } ${
                  isSelected && !showExplanation ? 'border-blue-500 bg-blue-500 text-white shadow-lg' :
                  showCorrect ? 'border-green-500 bg-green-500 text-white shadow-lg' :
                  isWrong ? 'border-red-500 bg-red-500 text-white shadow-lg' :
                  'border-neutral-300 bg-white text-neutral-600 group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}>
                  {!showExplanation ? (
                    letterOption
                  ) : (
                    showCorrect ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isWrong ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      letterOption
                    )
                  )}
                </div>
              </div>
              {/* Enhanced Answer Text */}
              <div className="flex-grow">
                <div className={`text-lg leading-relaxed transition-all duration-200 ${
                  showCorrect ? 'font-semibold text-green-800' : 
                  isWrong ? 'font-medium text-red-800' :
                  isSelected && !showExplanation ? 'font-medium text-blue-800' :
                  'text-neutral-800'
                }`}>
                  {answer.answer_text}
                </div>
                
              </div>
            </label>
          );
        })}
    </div>
  );
});

AnswerOptions.displayName = 'AnswerOptions';

export default AnswerOptions;
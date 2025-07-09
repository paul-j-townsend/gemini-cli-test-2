import React from 'react';
import { Button } from '../ui/Button';
import PadlockIcon from '../PadlockIcon';

interface ScoreData {
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
}

interface QuizCompletionProps {
  score: ScoreData;
  onRestartQuiz: () => void;
}

export const QuizCompletion: React.FC<QuizCompletionProps> = ({
  score,
  onRestartQuiz
}) => {
  return (
    <div className="card p-8 text-center animate-fade-in-up">
      <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
        score.passed ? 'bg-success-50 ring-4 ring-success-100' : 'bg-error-50 ring-4 ring-error-100'
      }`}>
        {score.passed ? (
          <svg className="w-14 h-14 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-14 h-14 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      
      <h2 className="text-3xl font-bold text-neutral-900 mb-3">Quiz Complete!</h2>
      <p className={`text-xl font-semibold mb-6 ${
        score.passed ? 'text-success-600' : 'text-error-600'
      }`}>
        {score.passed ? 'Congratulations! You passed!' : 'Not quite there yet!'}
      </p>
      
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 mb-8 border border-neutral-200">
        <div className={`text-5xl font-bold mb-3 ${
          score.passed ? 'text-success-600' : 'text-error-600'
        }`}>
          {score.passed ? 'PASSED' : 'FAILED'}
        </div>
        <div className="text-3xl font-semibold text-neutral-700 mb-3">{score.percentage}%</div>
        <p className="text-neutral-700 mb-4 text-lg">
          You got <span className={`font-semibold ${
            score.passed ? 'text-success-600' : 'text-error-600'
          }`}>{score.correct}</span> out of <span className="font-semibold text-neutral-900">{score.total}</span> questions correct
        </p>
        <div className="text-sm text-neutral-500 font-medium">
          Pass requirement: 100% (All questions must be correct)
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRestartQuiz}
          variant="secondary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retake Quiz
        </Button>
        <Button
          disabled={!score.passed}
          variant="primary"
        >
          <PadlockIcon isLocked={!score.passed} />
          <span className="ml-2">Get Certificate</span>
        </Button>
      </div>
    </div>
  );
};

export default QuizCompletion;
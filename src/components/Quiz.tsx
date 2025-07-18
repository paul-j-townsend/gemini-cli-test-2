import React, { useEffect } from 'react';
import { useQuizLogic } from '../hooks/useQuizLogic';
import { LoadingState } from './ui/LoadingState';
import { ErrorDisplay } from './ui/ErrorDisplay';
import QuizHeader from './quiz/QuizHeader';
import QuestionDisplay from './quiz/QuestionDisplay';
import AnswerOptions from './quiz/AnswerOptions';
import QuizNavigation from './quiz/QuizNavigation';
import QuizCompletion from './quiz/QuizCompletion';

interface QuizProps {
  quizId: string; // Required - every podcast now has a quiz
  podcastId?: string;
  episodeTitle?: string;
  episodeDuration?: number; // Duration in seconds for CPD calculation
  onComplete?: () => void; // Callback when quiz is completed
}

const Quiz: React.FC<QuizProps> = ({ quizId, podcastId, episodeTitle, episodeDuration, onComplete }) => {
  const {
    // State
    quiz,
    currentQuestionIndex,
    selectedAnswers,
    showExplanation,
    isCompleted,
    loading,
    error,
    
    // Computed values
    hasMultipleCorrectAnswers,
    getCurrentQuestion,
    getProgressPercentage,
    calculateScore,
    getLastAttempt,
    isCurrentQuestionCorrect,
    
    // Actions
    handleAnswerSelect,
    handleSubmitAnswer,
    handleNextQuestion,
    handleRestartQuiz,
    retryQuiz,
    
    // Quiz completion related
    lastCompletion,
  } = useQuizLogic({ quizId, podcastId });

  // Call onComplete callback when quiz is completed
  useEffect(() => {
    if (lastCompletion && onComplete) {
      onComplete();
    }
  }, [lastCompletion, onComplete]);

  if (loading) {
    return <LoadingState message="Loading quiz..." />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={retryQuiz}
      />
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.287 0-4.33.957-5.824 2.496" />
        </svg>
        No quiz found.
      </div>
    );
  }

  if (isCompleted) {
    const score = calculateScore();
    return (
      <QuizCompletion 
        score={score} 
        onRestartQuiz={handleRestartQuiz}
        quizTitle={quiz?.title}
        episodeTitle={episodeTitle}
        episodeDuration={episodeDuration}
        quizId={quizId}
        completion={lastCompletion}
      />
    );
  }

  // Ensure we have valid question data
  if (!quiz.questions || quiz.questions.length === 0 || currentQuestionIndex >= quiz.questions.length) {
    return (
      <div className="text-center py-8">
        <div className="text-error-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          No questions available for this quiz.
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progressPercentage = getProgressPercentage();
  const isMultipleChoice = hasMultipleCorrectAnswers();
  const lastAttempt = getLastAttempt();
  const isCurrentCorrect = isCurrentQuestionCorrect();

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <div className="text-error-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Current question not found.
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container animate-fade-in-up">
      <QuizHeader 
        quiz={quiz}
        currentQuestionIndex={currentQuestionIndex}
        progressPercentage={progressPercentage}
      />
      
      <div className="card p-6 lg:p-8">
        <QuestionDisplay 
          question={currentQuestion}
          showExplanation={showExplanation}
          lastAttempt={lastAttempt}
          hasMultipleCorrectAnswers={isMultipleChoice}
        />
        
        <AnswerOptions 
          answers={currentQuestion.mcq_answers || []}
          selectedAnswers={selectedAnswers}
          showExplanation={showExplanation}
          hasMultipleCorrectAnswers={isMultipleChoice}
          onAnswerSelect={handleAnswerSelect}
        />

        <QuizNavigation 
          showExplanation={showExplanation}
          selectedAnswers={selectedAnswers}
          isCurrentQuestionCorrect={isCurrentCorrect}
          isLastQuestion={currentQuestionIndex + 1 >= quiz.questions.length}
          onSubmitAnswer={handleSubmitAnswer}
          onNextQuestion={handleNextQuestion}
        />
      </div>
    </div>
  );
};

export default Quiz; 
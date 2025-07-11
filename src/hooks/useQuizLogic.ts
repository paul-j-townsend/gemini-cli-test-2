import { useCallback, useEffect, useState } from 'react';
import { useQuizState, QuizData, QuizAttempt } from './useQuizState';
import { QuizAnswer, QuizCompletion } from '../types/database';
import { useAuth } from './useAuth';
import { useQuizCompletion } from './useQuizCompletion';

interface UseQuizLogicProps {
  quizId?: string;
  podcastId?: string;
}

export const useQuizLogic = ({ quizId, podcastId }: UseQuizLogicProps) => {
  const { user } = useAuth();
  const [lastCompletion, setLastCompletion] = useState<QuizCompletion | null>(null);
  const { 
    submitQuizCompletion, 
    isQuizCompleted, 
    isQuizPassed, 
    getQuizScore,
    getQuizPercentage,
    isLoading: completionLoading 
  } = useQuizCompletion();

  const {
    state,
    setQuiz,
    setLoading,
    setError,
    setCurrentQuestion,
    setSelectedAnswers,
    addAttempt,
    setShowExplanation,
    setCompleted,
    resetQuiz,
    resetCurrentQuestion,
    setStartTime,
    hasMultipleCorrectAnswers,
    getCurrentQuestion,
    getProgressPercentage,
    calculateScore,
    getLastAttempt,
    isCurrentQuestionCorrect,
  } = useQuizState();

  const fetchQuiz = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quizzes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      const data = await response.json();
      setQuiz(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setQuiz, setError]);

  const handleAnswerSelect = useCallback((answerId: string) => {
    if (state.showExplanation) return;

    if (hasMultipleCorrectAnswers()) {
      setSelectedAnswers(
        state.selectedAnswers.includes(answerId) 
          ? state.selectedAnswers.filter(id => id !== answerId)
          : [...state.selectedAnswers, answerId]
      );
    } else {
      setSelectedAnswers([answerId]);
    }
  }, [state.showExplanation, state.selectedAnswers, hasMultipleCorrectAnswers, setSelectedAnswers]);

  const handleSubmitAnswer = useCallback(() => {
    if (state.selectedAnswers.length === 0 || !state.quiz) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !currentQuestion.mcq_answers) return;
    
    const correctAnswerIds = currentQuestion.mcq_answers
      .filter(answer => answer.is_correct)
      .map(answer => answer.id);
    
    const isCorrect = state.selectedAnswers.length === correctAnswerIds.length &&
                     state.selectedAnswers.every(id => correctAnswerIds.includes(id));

    const attempt: QuizAttempt = {
      question_id: currentQuestion.id,
      selected_answer_ids: [...state.selectedAnswers],
      is_correct: isCorrect,
    };

    addAttempt(attempt);
    setShowExplanation(true);
  }, [state.selectedAnswers, state.quiz, getCurrentQuestion, addAttempt, setShowExplanation]);

  const handleNextQuestion = useCallback(async () => {
    const lastAttempt = getLastAttempt();
    const isCurrentCorrect = lastAttempt && lastAttempt.is_correct;
    
    if (!isCurrentCorrect) {
      resetCurrentQuestion();
      return;
    }
    
    if (state.quiz && state.currentQuestionIndex + 1 < state.quiz.questions.length) {
      setCurrentQuestion(state.currentQuestionIndex + 1);
      resetCurrentQuestion();
    } else {
      setCompleted(true);
      
      if (state.quiz && quizId && user) {
        const score = calculateScore();
        const timeSpent = Math.round((Date.now() - state.startTime) / 1000);
        
        const finalAttempts = new Map();
        state.attempts.forEach(attempt => {
          finalAttempts.set(attempt.question_id, attempt);
        });
        
        const quizAnswers: QuizAnswer[] = Array.from(finalAttempts.values()).map(attempt => ({
          questionId: attempt.question_id,
          selectedAnswers: attempt.selected_answer_ids,
          isCorrect: attempt.is_correct,
          points: attempt.is_correct ? Math.round(100 / state.quiz!.questions.length) : 0
        }));

        const completion = await submitQuizCompletion(
          quizId,
          quizAnswers,
          score.percentage,
          100,
          timeSpent,
          podcastId,
          100
        );
        setLastCompletion(completion);
      }
    }
  }, [
    getLastAttempt,
    resetCurrentQuestion,
    state.quiz,
    state.currentQuestionIndex,
    state.attempts,
    state.startTime,
    setCurrentQuestion,
    setCompleted,
    calculateScore,
    quizId,
    user,
    submitQuizCompletion,
    podcastId
  ]);

  const handleRestartQuiz = useCallback(() => {
    resetQuiz();
    setStartTime(Date.now());
    setLastCompletion(null);
  }, [resetQuiz, setStartTime]);

  const retryQuiz = useCallback(() => {
    if (quizId) {
      fetchQuiz(quizId);
      setStartTime(Date.now());
    }
  }, [quizId, fetchQuiz, setStartTime]);

  useEffect(() => {
    if (quizId) {
      fetchQuiz(quizId);
      setStartTime(Date.now());
    }
  }, [quizId, fetchQuiz, setStartTime]);

  return {
    // State
    quiz: state.quiz,
    currentQuestionIndex: state.currentQuestionIndex,
    selectedAnswers: state.selectedAnswers,
    attempts: state.attempts,
    showExplanation: state.showExplanation,
    isCompleted: state.isCompleted,
    loading: state.loading,
    error: state.error,
    startTime: state.startTime,
    sessionId: state.sessionId,
    
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
    isQuizCompleted,
    isQuizPassed,
    getQuizScore,
    getQuizPercentage,
    completionLoading,
    lastCompletion,
  };
};
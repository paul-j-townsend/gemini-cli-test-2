import { useReducer, useCallback } from 'react';
import { QuizAnswer } from '../types/database';

interface McqAnswer {
  id: string;
  answer_text: string;
  is_correct: boolean;
  answer_letter: string;
}

interface Question {
  id: string;
  question_text: string;
  learning_outcome?: string;
  rationale?: string;
  category?: string;
  mcq_answers: McqAnswer[];
}

interface QuizData {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  pass_percentage?: number;
}

interface QuizAttempt {
  question_id: string;
  selected_answer_ids: string[];
  is_correct: boolean;
}

interface QuizState {
  quiz: QuizData | null;
  currentQuestionIndex: number;
  selectedAnswers: string[];
  attempts: QuizAttempt[];
  showExplanation: boolean;
  isCompleted: boolean;
  loading: boolean;
  error: string | null;
  startTime: number;
  sessionId: string;
}

type QuizAction =
  | { type: 'SET_QUIZ'; payload: QuizData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'SET_SELECTED_ANSWERS'; payload: string[] }
  | { type: 'ADD_ATTEMPT'; payload: QuizAttempt }
  | { type: 'SET_SHOW_EXPLANATION'; payload: boolean }
  | { type: 'SET_COMPLETED'; payload: boolean }
  | { type: 'RESET_QUIZ' }
  | { type: 'RESET_CURRENT_QUESTION' }
  | { type: 'SET_START_TIME'; payload: number };

const initialState: QuizState = {
  quiz: null,
  currentQuestionIndex: 0,
  selectedAnswers: [],
  attempts: [],
  showExplanation: false,
  isCompleted: false,
  loading: true,
  error: null,
  startTime: Date.now(),
  sessionId: Math.random().toString(36).substring(2, 15),
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_QUIZ':
      return {
        ...state,
        quiz: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: action.payload,
      };
    case 'SET_SELECTED_ANSWERS':
      return {
        ...state,
        selectedAnswers: action.payload,
      };
    case 'ADD_ATTEMPT':
      return {
        ...state,
        attempts: [...state.attempts, action.payload],
      };
    case 'SET_SHOW_EXPLANATION':
      return {
        ...state,
        showExplanation: action.payload,
      };
    case 'SET_COMPLETED':
      return {
        ...state,
        isCompleted: action.payload,
      };
    case 'RESET_QUIZ':
      return {
        ...state,
        currentQuestionIndex: 0,
        selectedAnswers: [],
        attempts: [],
        showExplanation: false,
        isCompleted: false,
        startTime: Date.now(),
        sessionId: Math.random().toString(36).substring(2, 15),
      };
    case 'RESET_CURRENT_QUESTION':
      return {
        ...state,
        selectedAnswers: [],
        showExplanation: false,
      };
    case 'SET_START_TIME':
      return {
        ...state,
        startTime: action.payload,
      };
    default:
      return state;
  }
}

export const useQuizState = () => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const setQuiz = useCallback((quiz: QuizData) => {
    dispatch({ type: 'SET_QUIZ', payload: quiz });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setCurrentQuestion = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_QUESTION', payload: index });
  }, []);

  const setSelectedAnswers = useCallback((answers: string[]) => {
    dispatch({ type: 'SET_SELECTED_ANSWERS', payload: answers });
  }, []);

  const addAttempt = useCallback((attempt: QuizAttempt) => {
    dispatch({ type: 'ADD_ATTEMPT', payload: attempt });
  }, []);

  const setShowExplanation = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_EXPLANATION', payload: show });
  }, []);

  const setCompleted = useCallback((completed: boolean) => {
    dispatch({ type: 'SET_COMPLETED', payload: completed });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, []);

  const resetCurrentQuestion = useCallback(() => {
    dispatch({ type: 'RESET_CURRENT_QUESTION' });
  }, []);

  const setStartTime = useCallback((time: number) => {
    dispatch({ type: 'SET_START_TIME', payload: time });
  }, []);

  // Helper functions
  const hasMultipleCorrectAnswers = useCallback(() => {
    if (!state.quiz || !state.quiz.questions || state.quiz.questions.length === 0) return false;
    const currentQuestion = state.quiz.questions[state.currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.mcq_answers) return false;
    return currentQuestion.mcq_answers.filter(answer => answer.is_correct).length > 1;
  }, [state.quiz, state.currentQuestionIndex]);

  const getCurrentQuestion = useCallback(() => {
    if (!state.quiz || !state.quiz.questions || state.currentQuestionIndex >= state.quiz.questions.length) {
      return null;
    }
    return state.quiz.questions[state.currentQuestionIndex];
  }, [state.quiz, state.currentQuestionIndex]);

  const getProgressPercentage = useCallback(() => {
    if (!state.quiz) return 0;
    return Math.round(((state.currentQuestionIndex + (state.showExplanation ? 1 : 0)) / state.quiz.questions.length) * 100);
  }, [state.quiz, state.currentQuestionIndex, state.showExplanation]);

  const calculateScore = useCallback(() => {
    if (!state.quiz) return { correct: 0, total: 0, percentage: 0, passed: false };
    
    const questionsAnswered = new Set();
    const correctQuestions = new Set();
    
    state.attempts.forEach(attempt => {
      questionsAnswered.add(attempt.question_id);
      if (attempt.is_correct) {
        correctQuestions.add(attempt.question_id);
      } else {
        correctQuestions.delete(attempt.question_id);
      }
    });
    
    const totalQuestions = state.quiz.questions.length;
    const correctAnswers = correctQuestions.size;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = percentage === 100;
    
    return {
      correct: correctAnswers,
      total: totalQuestions,
      percentage,
      passed
    };
  }, [state.quiz, state.attempts]);

  const getLastAttempt = useCallback(() => {
    return state.attempts[state.attempts.length - 1];
  }, [state.attempts]);

  const isCurrentQuestionCorrect = useCallback(() => {
    const lastAttempt = getLastAttempt();
    return lastAttempt && lastAttempt.is_correct;
  }, [getLastAttempt]);

  return {
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
  };
};

export { useQuizState };
export type { QuizState, QuizData, Question, McqAnswer, QuizAttempt };
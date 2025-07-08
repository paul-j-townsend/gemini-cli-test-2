import PadlockIcon from './PadlockIcon';
import React, { useState, useEffect } from 'react';
import { useQuizCompletion } from '../hooks/useQuizCompletion';
import { useAuth } from '../hooks/useAuth';
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

interface QuizProps {
  quizId?: string;
  podcastId?: string;
  category?: string;
}

const Quiz: React.FC<QuizProps> = ({ quizId, podcastId }) => {
  const { user } = useAuth();
  const { 
    submitQuizCompletion, 
    isQuizCompleted, 
    isQuizPassed, 
    getQuizScore,
    getQuizPercentage,
    isLoading: completionLoading 
  } = useQuizCompletion();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));

  useEffect(() => {
    if (quizId) {
      fetchQuiz(quizId);
      setStartTime(Date.now());
    }
  }, [quizId]);

  const fetchQuiz = async (id: string) => {
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
  };

  


  const hasMultipleCorrectAnswers = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return false;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.mcq_answers) return false;
    return currentQuestion.mcq_answers.filter(answer => answer.is_correct).length > 1;
  };

  const handleAnswerSelect = (answerId: string) => {
    if (showExplanation) return;

    if (hasMultipleCorrectAnswers()) {
      setSelectedAnswers(prev => 
        prev.includes(answerId) 
          ? prev.filter(id => id !== answerId)
          : [...prev, answerId]
      );
    } else {
      setSelectedAnswers([answerId]);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswers.length === 0 || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.mcq_answers) return;
    
    const correctAnswerIds = currentQuestion.mcq_answers
      .filter(answer => answer.is_correct)
      .map(answer => answer.id);
    
    const isCorrect = selectedAnswers.length === correctAnswerIds.length &&
                     selectedAnswers.every(id => correctAnswerIds.includes(id));

    const attempt: QuizAttempt = {
      question_id: currentQuestion.id,
      selected_answer_ids: [...selectedAnswers],
      is_correct: isCorrect,
    };

    setAttempts([...attempts, attempt]);
    setShowExplanation(true);
  };

  const handleNextQuestion = async () => {
    // Check if the current question was answered correctly
    const lastAttempt = attempts[attempts.length - 1];
    const isCurrentQuestionCorrect = lastAttempt && lastAttempt.is_correct;
    
    // If incorrect, stay on current question and allow retry
    if (!isCurrentQuestionCorrect) {
      setSelectedAnswers([]);
      setShowExplanation(false);
      return;
    }
    
    // If correct, proceed to next question or complete quiz
    if (quiz && currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
      
      // Record completion when quiz finishes
      if (quiz && quizId && user) {
        const score = calculateScore();
        const timeSpent = Math.round((Date.now() - startTime) / 1000); // Convert to seconds
        
        // Create QuizAnswer array for tracking (only final attempt per question)
        const finalAttempts = new Map();
        attempts.forEach(attempt => {
          finalAttempts.set(attempt.question_id, attempt);
        });
        
        const quizAnswers: QuizAnswer[] = Array.from(finalAttempts.values()).map(attempt => ({
          questionId: attempt.question_id,
          selectedAnswers: attempt.selected_answer_ids,
          isCorrect: attempt.is_correct,
          points: attempt.is_correct ? Math.round(100 / quiz.questions.length) : 0 // Equal points per question
        }));

        // Submit to our completion tracking system
        await submitQuizCompletion(
          quizId,
          quizAnswers,
          score.percentage, // Use percentage as score
          100, // Max score is always 100%
          timeSpent,
          podcastId,
          100 // All questions must be correct for pass
        );
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setAttempts([]);
    setShowExplanation(false);
    setIsCompleted(false);
    setStartTime(Date.now()); // Reset start time
  };

  const calculateScore = () => {
    if (!quiz) return { correct: 0, total: 0, percentage: 0, passed: false };
    
    // Count correct answers per question (only final result matters since retries are allowed)
    const questionsAnswered = new Set();
    const correctQuestions = new Set();
    
    // Process attempts in chronological order to get final result for each question
    attempts.forEach(attempt => {
      questionsAnswered.add(attempt.question_id);
      if (attempt.is_correct) {
        correctQuestions.add(attempt.question_id);
      } else {
        // If incorrect, remove from correct set (in case there was a previous correct attempt)
        correctQuestions.delete(attempt.question_id);
      }
    });
    
    const totalQuestions = quiz.questions.length;
    const correctAnswers = correctQuestions.size;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = percentage === 100; // Only 100% is a pass
    
    return {
      correct: correctAnswers,
      total: totalQuestions,
      percentage,
      passed
    };
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    return Math.round(((currentQuestionIndex + (showExplanation ? 1 : 0)) / quiz.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-neutral-600">Loading quiz...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-error-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Error: {error}
        </div>
        <button 
          onClick={() => quizId && fetchQuiz(quizId)}
          className="btn-secondary"
        >
          Try Again
        </button>
      </div>
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
      <div className="card p-8 text-center animate-fade-in-up">
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${score.passed ? 'bg-success-50 ring-4 ring-success-100' : 'bg-error-50 ring-4 ring-error-100'}`}>
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
        <p className={`text-xl font-semibold mb-6 ${score.passed ? 'text-success-600' : 'text-error-600'}`}>
          {score.passed ? 'Congratulations! You passed!' : 'Not quite there yet!'}
        </p>
        
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 mb-8 border border-neutral-200">
          <div className={`text-5xl font-bold mb-3 ${score.passed ? 'text-success-600' : 'text-error-600'}`}>
            {score.passed ? 'PASSED' : 'FAILED'}
          </div>
          <div className="text-3xl font-semibold text-neutral-700 mb-3">{score.percentage}%</div>
          <p className="text-neutral-700 mb-4 text-lg">
            You got <span className={`font-semibold ${score.passed ? 'text-success-600' : 'text-error-600'}`}>{score.correct}</span> out of <span className="font-semibold text-neutral-900">{score.total}</span> questions correct
          </p>
          <div className="text-sm text-neutral-500 font-medium">
            Pass requirement: 100% (All questions must be correct)
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleRestartQuiz}
            className="btn-secondary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake Quiz
          </button>
          <button
            disabled={!score.passed}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <PadlockIcon isLocked={!score.passed} />
            <span className="ml-2">Get Certificate</span>
          </button>
        </div>
      </div>
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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = getProgressPercentage();
  const isMultipleChoice = hasMultipleCorrectAnswers();

  return (
    <div className="quiz-container animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">{quiz.title}</h2>
        </div>
        {quiz.description && (
          <p className="text-neutral-600 mb-4">{quiz.description}</p>
        )}
        
        {/* Progress Bar */}
        <div className="bg-neutral-200 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-neutral-500">
          <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          <span>{progressPercentage}% complete</span>
        </div>
      </div>
      
      {/* Question Card */}
      <div className="card p-6 lg:p-8">
        {/* Learning Outcome */}
        {currentQuestion.learning_outcome && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Learning Outcome:</h4>
                <p className="text-green-800 leading-relaxed">{currentQuestion.learning_outcome}</p>
              </div>
            </div>
          </div>
        )}

        <h3 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-4 leading-relaxed">
          {currentQuestion.question_text}
        </h3>
        
        {/* Multiple choice indicator */}
        {isMultipleChoice && !showExplanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-center text-blue-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Multiple answers may be correct - select all that apply</span>
            </div>
          </div>
        )}
        
        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.mcq_answers && currentQuestion.mcq_answers.length > 0 ? currentQuestion.mcq_answers
            .sort((a, b) => a.answer_letter.localeCompare(b.answer_letter))
            .map(answer => {
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
                  onClick={() => handleAnswerSelect(answer.id)}
                >
                  <div className={`flex-shrink-0 w-6 h-6 mr-4 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                    isMultipleChoice ? 'rounded border-2' : 'rounded-full border-2'
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
                      isMultipleChoice ? (
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
            }) : (
              <div className="text-center py-4 text-neutral-500">
                No answer options available for this question.
              </div>
            )}
        </div>

        {/* Feedback and Explanation */}
        {showExplanation && (
          <>
            {/* Feedback Message */}
            {(() => {
              const lastAttempt = attempts[attempts.length - 1];
              const isCurrentQuestionCorrect = lastAttempt && lastAttempt.is_correct;
              
              return (
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
                          ? (currentQuestionIndex + 1 < quiz.questions.length 
                              ? 'You can proceed to the next question.' 
                              : 'Question complete!')
                          : 'That\'s not quite right. Please try again!'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* Rationale - Only show when answer is correct */}
            {(() => {
              const lastAttempt = attempts[attempts.length - 1];
              const isCurrentQuestionCorrect = lastAttempt && lastAttempt.is_correct;
              
              return currentQuestion.rationale && isCurrentQuestionCorrect && (
                <div className="bg-primary-50 border-l-4 border-primary-400 p-4 rounded-r-xl mb-6 animate-fade-in-up">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-1">Rationale:</h4>
                      <p className="text-primary-800 leading-relaxed">{currentQuestion.rationale}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-neutral-500">
          </div>
          
          <div className="flex gap-3">
            {!showExplanation ? (
              <button 
                onClick={handleSubmitAnswer} 
                disabled={selectedAnswers.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                className="btn-primary"
              >
                {(() => {
                  const lastAttempt = attempts[attempts.length - 1];
                  const isCurrentQuestionCorrect = lastAttempt && lastAttempt.is_correct;
                  
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
                  
                  return currentQuestionIndex + 1 < quiz.questions.length ? (
                    <>
                      Next Question
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Finish Quiz
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </>
                  );
                })()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz; 
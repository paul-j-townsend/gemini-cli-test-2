import React, { useState, useEffect } from 'react';

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
  difficulty?: string;
  points?: number;
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
  selected_answer_id: string;
  is_correct: boolean;
}

interface QuizProps {
  quizId?: string;
  category?: string;
}

const Quiz: React.FC<QuizProps> = ({ quizId }) => {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      fetchQuiz(quizId);
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

  const handleAnswerSelect = (answerId: string) => {
    if (!showExplanation) {
      setSelectedAnswer(answerId);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOption = currentQuestion.mcq_answers.find(ans => ans.id === selectedAnswer);
    const isCorrect = selectedOption?.is_correct || false;

    const attempt: QuizAttempt = {
      question_id: currentQuestion.id,
      selected_answer_id: selectedAnswer,
      is_correct: isCorrect,
    };

    setAttempts([...attempts, attempt]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAttempts([]);
    setShowExplanation(false);
    setIsCompleted(false);
  };

  const calculateScore = () => {
    const correctAnswers = attempts.filter(attempt => attempt.is_correct).length;
    const percentage = attempts.length > 0 ? Math.round((correctAnswers / attempts.length) * 100) : 0;
    const passed = percentage >= (quiz?.pass_percentage || 70);
    
    return {
      correct: correctAnswers,
      total: attempts.length,
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
        <div className="text-red-500 mb-4">
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
      <div className="card-glow p-8 text-center animate-fade-in-up">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${score.passed ? 'bg-green-100' : 'bg-orange-100'}`}>
          {score.passed ? (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Quiz Complete!</h2>
        <p className={`text-xl font-semibold mb-2 ${score.passed ? 'text-green-600' : 'text-orange-600'}`}>
          {score.passed ? 'Congratulations! You passed!' : 'Keep studying and try again!'}
        </p>
        
        <div className="bg-neutral-50 rounded-xl p-6 mb-6">
          <div className="text-4xl font-bold text-primary-600 mb-2">{score.percentage}%</div>
          <p className="text-neutral-600 mb-4">
            You got <span className="font-semibold text-green-600">{score.correct}</span> out of <span className="font-semibold">{score.total}</span> questions correct
          </p>
          <div className="text-sm text-neutral-500">
            Pass requirement: {quiz.pass_percentage || 70}%
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={handleRestartQuiz}
            className="btn-secondary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake Quiz
          </button>
          {score.passed && (
            <button className="btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Get Certificate
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = getProgressPercentage();

  return (
    <div className="quiz-container animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">{quiz.title}</h2>
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
      <div className="card-glow p-6 lg:p-8">
        <h3 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-6 leading-relaxed">
          {currentQuestion.question_text}
        </h3>
        
        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.mcq_answers
            .sort((a, b) => a.answer_letter.localeCompare(b.answer_letter))
            .map(answer => {
              const isSelected = selectedAnswer === answer.id;
              const isCorrect = answer.is_correct;
              const isWrong = showExplanation && isSelected && !isCorrect;
              const showCorrect = showExplanation && isCorrect;
              
              return (
                <label 
                  key={answer.id} 
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-soft group ${
                    isSelected && !showExplanation ? 'border-primary-500 bg-primary-50' : 
                    showCorrect ? 'border-green-500 bg-green-50' :
                    isWrong ? 'border-red-500 bg-red-50' :
                    'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  } ${showExplanation ? 'cursor-default' : ''}`}
                  onClick={() => handleAnswerSelect(answer.id)}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                    isSelected && !showExplanation ? 'border-primary-500 bg-primary-500' :
                    showCorrect ? 'border-green-500 bg-green-500' :
                    isWrong ? 'border-red-500 bg-red-500' :
                    'border-neutral-300 group-hover:border-neutral-400'
                  }`}>
                    {(isSelected || showCorrect) && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                    {isWrong && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {showCorrect && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mr-3 ${
                        showCorrect ? 'bg-green-100 text-green-800' :
                        isWrong ? 'bg-red-100 text-red-800' :
                        isSelected ? 'bg-primary-100 text-primary-800' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {answer.answer_letter}
                      </span>
                    </div>
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

        {/* Explanation */}
        {showExplanation && currentQuestion.rationale && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6 animate-fade-in-up">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Explanation:</h4>
                <p className="text-blue-800 leading-relaxed">{currentQuestion.rationale}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            {currentQuestion.points && (
              <span>{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</span>
            )}
          </div>
          
          <div className="flex gap-3">
            {!showExplanation ? (
              <button 
                onClick={handleSubmitAnswer} 
                disabled={selectedAnswer === null}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                className="btn-primary"
              >
                {currentQuestionIndex + 1 < quiz.questions.length ? (
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
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz; 
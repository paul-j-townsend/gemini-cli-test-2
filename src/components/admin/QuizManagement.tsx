import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface QuestionAnswer {
  id?: string;
  question_id?: string;
  answer_letter: string;
  answer_text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id?: string;
  quiz_id?: string;
  question_number: number;
  question_text: string;
  explanation?: string;
  points?: number;
  answers?: QuestionAnswer[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  total_questions?: number;
  pass_percentage?: number;
  quiz_questions?: QuizQuestion[];
}

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/quizzes');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setQuizzes(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch quizzes: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz and all its questions?')) {
      try {
        const response = await fetch(`/api/admin/quizzes?id=${quizId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        fetchQuizzes();
      } catch (error) {
        setError(`Failed to delete quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      setSaving(true);
      
      if (quiz.id === 'new-quiz') {
        // Create new quiz
        const response = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            difficulty: quiz.difficulty,
            pass_percentage: quiz.pass_percentage,
            quiz_questions: quiz.quiz_questions?.map(q => ({
              ...q,
              answers: q.answers?.map(a => ({ ...a }))
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        // Update existing quiz
        const response = await fetch('/api/admin/quizzes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            difficulty: quiz.difficulty,
            pass_percentage: quiz.pass_percentage,
            quiz_questions: quiz.quiz_questions?.map(q => ({
              ...q,
              answers: q.answers?.map(a => ({ ...a }))
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      setEditingQuiz(null);
      fetchQuizzes();
    } catch (error) {
      console.error('Save error:', error);
      setError(`Failed to save quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleCreateQuiz = () => {
    const newQuiz: Quiz = {
      id: 'new-quiz',
      title: 'New Quiz',
      description: 'A new quiz',
      category: '',
      difficulty: 'beginner',
      pass_percentage: 70,
      quiz_questions: [{
        question_number: 1,
        question_text: '',
        answers: [
          { answer_letter: 'A', answer_text: '', is_correct: false },
          { answer_letter: 'B', answer_text: '', is_correct: false },
          { answer_letter: 'C', answer_text: '', is_correct: false },
          { answer_letter: 'D', answer_text: '', is_correct: false },
        ]
      }]
    };
    setEditingQuiz(newQuiz);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
        {!editingQuiz && (
          <button 
            onClick={handleCreateQuiz}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Add New Quiz
          </button>
        )}
      </div>
      {editingQuiz ? (
        <QuizForm quiz={editingQuiz} onSave={handleSaveQuiz} onCancel={() => setEditingQuiz(null)} />
      ) : (
        <QuizList quizzes={quizzes} onEdit={handleEditQuiz} onDelete={handleDeleteQuiz} />
      )}
    </div>
  );
};

interface QuizListProps {
  quizzes: Quiz[];
  onEdit: (quiz: Quiz) => void;
  onDelete: (quizId: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ quizzes, onEdit, onDelete }) => (
  <div>
    {quizzes.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No quizzes found. Click "Add New Quiz" to create your first quiz.</p>
      </div>
    ) : (
      quizzes.map(quiz => (
        <div key={quiz.id} className="border p-4 my-2 rounded-lg bg-white shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
          <p className="text-gray-600 mt-1">{quiz.description}</p>
          <div className="text-sm text-gray-500 mt-2">
            <span className="inline-block mr-4">📊 {quiz.quiz_questions?.length || 0} questions</span>
            <span className="inline-block mr-4">🎯 {quiz.pass_percentage || 70}% to pass</span>
            <span className="inline-block">📁 {quiz.category || 'General'}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => onEdit(quiz)} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Edit Quiz
            </button>
            <button 
              onClick={() => onDelete(quiz.id)} 
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Quiz
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);

interface QuizFormProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Quiz>(quiz);

  const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'pass_percentage' ? parseInt(value) || 70 : value 
    }));
  };

  const handleQuestionChange = (index: number, updatedQuestion: QuizQuestion) => {
    const newQuestions = [...(formData.quiz_questions || [])];
    newQuestions[index] = updatedQuestion;
    setFormData(prev => ({ ...prev, quiz_questions: newQuestions }));
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      question_number: (formData.quiz_questions?.length || 0) + 1,
      question_text: ''
    };
    setFormData(prev => ({ 
      ...prev, 
      quiz_questions: [...(prev.quiz_questions || []), newQuestion] 
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...(formData.quiz_questions || [])];
    newQuestions.splice(index, 1);
    // Renumber questions
    newQuestions.forEach((q, i) => q.question_number = i + 1);
    setFormData(prev => ({ ...prev, quiz_questions: newQuestions }));
  };

  const handleAddAnswer = (questionIndex: number) => {
    const newQuestions = [...(formData.quiz_questions || [])];
    const question = newQuestions[questionIndex];
    if (!question.answers) {
      question.answers = [];
    }
    
    // Determine the next answer letter
    const existingLetters = question.answers.map(a => a.answer_letter);
    const availableLetters = ['A', 'B', 'C', 'D', 'E'];
    const nextLetter = availableLetters.find(letter => !existingLetters.includes(letter)) || 'A';
    
    question.answers.push({
      answer_letter: nextLetter,
      answer_text: '',
      is_correct: false
    });
    
    setFormData(prev => ({ ...prev, quiz_questions: newQuestions }));
  };

  const handleRemoveAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...(formData.quiz_questions || [])];
    const question = newQuestions[questionIndex];
    if (question.answers) {
      question.answers.splice(answerIndex, 1);
    }
    setFormData(prev => ({ ...prev, quiz_questions: newQuestions }));
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number, updatedAnswer: QuestionAnswer) => {
    const newQuestions = [...(formData.quiz_questions || [])];
    const question = newQuestions[questionIndex];
    if (question.answers) {
      question.answers[answerIndex] = updatedAnswer;
    }
    setFormData(prev => ({ ...prev, quiz_questions: newQuestions }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {quiz.id === 'new-quiz' ? 'Create New Quiz' : 'Edit Quiz'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input 
            name="title" 
            value={formData.title} 
            onChange={handleQuizChange} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Quiz title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <input 
            name="category" 
            value={formData.category || ''} 
            onChange={handleQuizChange} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="e.g. Ethics, Professional Practice"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select 
            name="difficulty" 
            value={formData.difficulty || 'beginner'} 
            onChange={handleQuizChange} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pass Percentage</label>
          <input 
            name="pass_percentage" 
            type="number" 
            min="0" 
            max="100" 
            value={formData.pass_percentage || 70} 
            onChange={handleQuizChange} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea 
          name="description" 
          value={formData.description || ''} 
          onChange={handleQuizChange} 
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          placeholder="Brief description of the quiz"
        />
      </div>

      <hr className="my-6" />
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Questions</h4>
          <button 
            onClick={handleAddQuestion} 
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Add Question
          </button>
        </div>
        
        {formData.quiz_questions?.map((question, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
              <h5 className="font-medium text-gray-900">Question {question.question_number}</h5>
              <button 
                onClick={() => handleRemoveQuestion(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <textarea
              value={question.question_text}
              onChange={(e) => handleQuestionChange(index, { ...question, question_text: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your question here..."
            />
            <div className="mt-4">
              <h6 className="text-md font-medium text-gray-700 mb-2">Answers</h6>
              {question.answers?.map((answer, ansIndex) => (
                <AnswerForm 
                  key={ansIndex}
                  answer={answer}
                  onAnswerChange={(updatedAnswer) => handleAnswerChange(index, ansIndex, updatedAnswer)}
                  onRemoveAnswer={() => handleRemoveAnswer(index, ansIndex)}
                />
              ))}
              <button 
                onClick={() => handleAddAnswer(index)}
                className="mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors"
              >
                Add Answer
              </button>
            </div>
          </div>
        ))}
        
        {(!formData.quiz_questions || formData.quiz_questions.length === 0) && (
          <p className="text-gray-500 text-center py-8">No questions yet. Click "Add Question" to get started.</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button 
          onClick={onCancel} 
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(formData)} 
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Save Quiz
        </button>
      </div>
    </div>
  );
};

interface AnswerFormProps {
  answer: QuestionAnswer;
  onAnswerChange: (answer: QuestionAnswer) => void;
  onRemoveAnswer: () => void;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ answer, onAnswerChange, onRemoveAnswer }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onAnswerChange({
      ...answer,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <input
        type="text"
        name="answer_text"
        value={answer.answer_text}
        onChange={handleChange}
        className="flex-grow border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
        placeholder={`Answer ${answer.answer_letter}`}
      />
      <label className="flex items-center text-sm text-gray-700">
        <input
          type="checkbox"
          name="is_correct"
          checked={answer.is_correct}
          onChange={handleChange}
          className="form-checkbox h-4 w-4 text-blue-600 rounded"
        />
        <span className="ml-1">Correct</span>
      </label>
      <button
        onClick={onRemoveAnswer}
        className="text-red-500 hover:text-red-700 text-sm"
      >
        Remove
      </button>
    </div>
  );
};

export default QuizManagement;
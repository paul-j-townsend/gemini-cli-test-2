import React, { useState, useEffect } from 'react';
import { AdminDataTable, AdminForm, type TableColumn, type TableAction, type FormSection } from './shared';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingState } from '@/components/ui/LoadingState';
import { useFormManagement } from '@/hooks/useFormManagement';
import { quizValidationSchema } from '@/utils/validationUtils';

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
  rationale?: string;
  learning_outcome?: string;
  answers?: QuestionAnswer[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  category?: string;
  pass_percentage?: number;
  total_questions?: number;
  is_active?: boolean;
  quiz_questions?: QuizQuestion[];
}

interface QuizFormData {
  title: string;
  description: string;
  category: string;
  pass_percentage: number;
  total_questions: number;
  quiz_questions: QuizQuestion[];
}

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingSystemQuizzes, setCreatingSystemQuizzes] = useState(false);

  const formHook = useFormManagement<QuizFormData>({
    initialData: {
      title: '',
      description: '',
      category: '',
      pass_percentage: 70,
      total_questions: 0,
      quiz_questions: []
    },
    validationSchema: {
      title: { required: true, minLength: 1 },
      description: { required: false },
      category: { required: false },
      pass_percentage: { required: true, min: 0, max: 100 },
      total_questions: { required: true, min: 0 }
    },
    validateOnChange: true,
    validateOnBlur: true
  });

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
      
      const transformedQuizzes = data.map((quiz: any) => ({
        ...quiz,
        quiz_questions: quiz.quiz_questions?.map((q: any) => ({
          ...q,
          answers: q.question_answers || []
        }))
      }));
      
      setQuizzes(transformedQuizzes);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch quizzes: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    const editableQuiz = {
      ...quiz,
      quiz_questions: quiz.quiz_questions?.map(q => ({
        ...q,
        answers: q.answers || []
      }))
    };
    setEditingQuiz(editableQuiz);
    
    formHook.setData({
      title: editableQuiz.title,
      description: editableQuiz.description || '',
      category: editableQuiz.category || '',
      pass_percentage: editableQuiz.pass_percentage || 70,
      total_questions: editableQuiz.total_questions || 0,
      quiz_questions: editableQuiz.quiz_questions || []
    });
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
        
        await fetchQuizzes();
      } catch (error) {
        setError(`Failed to delete quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleSaveQuiz = async (data: QuizFormData) => {
    try {
      setSaving(true);
      
      const apiQuizData = {
        id: editingQuiz?.id || 'new-quiz',
        title: data.title,
        description: data.description,
        category: data.category,
        pass_percentage: data.pass_percentage,
        quiz_questions: data.quiz_questions?.map(q => ({
          id: q.id,
          quiz_id: q.quiz_id,
          question_number: q.question_number,
          question_text: q.question_text,
          explanation: q.explanation,
          rationale: q.rationale,
          learning_outcome: q.learning_outcome,
          question_answers: q.answers?.map(a => ({
            id: a.id,
            question_id: a.question_id,
            answer_letter: a.answer_letter,
            answer_text: a.answer_text,
            is_correct: a.is_correct
          })) || []
        })) || []
      };
      
      const isNew = !editingQuiz || editingQuiz.id === 'new-quiz';
      const response = await fetch('/api/admin/quizzes', {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiQuizData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setEditingQuiz(null);
      await fetchQuizzes();
      formHook.reset();
    } catch (error) {
      console.error('Save error:', error);
      setError(`Failed to save quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSystemQuizzes = async () => {
    setCreatingSystemQuizzes(true);
    try {
      const response = await fetch('/api/create-sample-quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await fetchQuizzes();
      setError(null);
    } catch (err) {
      setError(`Failed to create system quizzes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setCreatingSystemQuizzes(false);
  };

  const handleCreateQuiz = () => {
    const newQuiz: Quiz = {
      id: 'new-quiz',
      title: 'New Quiz',
      description: 'A new quiz',
      category: '',
      pass_percentage: 70,
      total_questions: 0,
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
    formHook.setData({
      title: newQuiz.title,
      description: newQuiz.description || '',
      category: newQuiz.category || '',
      pass_percentage: newQuiz.pass_percentage || 70,
      total_questions: newQuiz.total_questions || 0,
      quiz_questions: newQuiz.quiz_questions || []
    });
  };

  const handleCancel = () => {
    setEditingQuiz(null);
    formHook.reset();
  };

  const tableColumns: TableColumn<Quiz>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (quiz) => (
        <div>
          <div className="font-semibold text-gray-900">{quiz.title}</div>
          <div className="text-sm text-gray-500">{quiz.description}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (quiz) => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
          {quiz.category || 'General'}
        </span>
      )
    },
    {
      key: 'quiz_questions',
      label: 'Questions',
      render: (quiz) => (
        <div className="text-sm">
          <div className="font-medium">{quiz.quiz_questions?.length || 0} questions</div>
          <div className="text-gray-500">{quiz.pass_percentage || 70}% to pass</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions'
    }
  ];

  const tableActions: TableAction<Quiz>[] = [
    {
      label: 'Edit',
      onClick: handleEditQuiz,
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (quiz) => handleDeleteQuiz(quiz.id),
      variant: 'ghost'
    }
  ];

  const formSections: FormSection[] = [
    {
      title: 'Quiz Information',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          placeholder: 'Enter quiz title'
        },
        {
          name: 'category',
          label: 'Category',
          type: 'text',
          placeholder: 'e.g. Ethics, Professional Practice'
        },
        {
          name: 'pass_percentage',
          label: 'Pass Percentage',
          type: 'number',
          required: true,
          min: 0,
          max: 100
        },
        {
          name: 'total_questions',
          label: 'Total Questions',
          type: 'number',
          required: true,
          min: 0
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Brief description of the quiz',
          gridColumn: 'span-full'
        }
      ]
    },
    {
      title: 'Questions',
      fields: [
        {
          name: 'quiz_questions',
          label: 'Questions',
          type: 'custom',
          gridColumn: 'span-full',
          render: (questions, onChange) => (
            <QuizQuestionsEditor
              questions={questions || []}
              onChange={onChange}
            />
          )
        }
      ]
    }
  ];

  if (loading) {
    return <LoadingState message="Loading quizzes..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchQuizzes} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
        {!editingQuiz && (
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateSystemQuizzes}
              disabled={creatingSystemQuizzes}
              variant="secondary"
              loading={creatingSystemQuizzes}
            >
              Create System Quizzes
            </Button>
            <Button 
              onClick={handleCreateQuiz}
              variant="primary"
            >
              Add New Quiz
            </Button>
          </div>
        )}
      </div>

      {editingQuiz ? (
        <AdminForm
          title={editingQuiz.id === 'new-quiz' ? 'Create New Quiz' : 'Edit Quiz'}
          formHook={formHook}
          sections={formSections}
          onSubmit={handleSaveQuiz}
          onCancel={handleCancel}
          loading={saving}
          error={error}
        />
      ) : (
        <AdminDataTable
          data={quizzes}
          columns={tableColumns}
          actions={tableActions}
          emptyMessage="No quizzes found. Click 'Add New Quiz' to create your first quiz."
        />
      )}
    </div>
  );
};

// Quiz Questions Editor Component
interface QuizQuestionsEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const QuizQuestionsEditor: React.FC<QuizQuestionsEditorProps> = ({ questions, onChange }) => {
  const handleQuestionChange = (index: number, updatedQuestion: QuizQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    onChange(newQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      question_number: questions.length + 1,
      question_text: '',
      answers: [
        { answer_letter: 'A', answer_text: '', is_correct: false },
        { answer_letter: 'B', answer_text: '', is_correct: false },
        { answer_letter: 'C', answer_text: '', is_correct: false },
        { answer_letter: 'D', answer_text: '', is_correct: false },
      ]
    };
    onChange([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    newQuestions.forEach((q, i) => q.question_number = i + 1);
    onChange(newQuestions);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Questions</h4>
        <Button onClick={handleAddQuestion} variant="secondary" size="sm">
          Add Question
        </Button>
      </div>
      
      {questions.map((question, index) => (
        <QuestionEditor
          key={index}
          question={question}
          index={index}
          onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
          onRemove={() => handleRemoveQuestion(index)}
        />
      ))}
      
      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No questions yet. Click "Add Question" to get started.</p>
        </div>
      )}
    </div>
  );
};

// Question Editor Component
interface QuestionEditorProps {
  question: QuizQuestion;
  index: number;
  onChange: (question: QuizQuestion) => void;
  onRemove: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, index, onChange, onRemove }) => {
  const handleAnswerChange = (answerIndex: number, updatedAnswer: QuestionAnswer) => {
    const newAnswers = [...(question.answers || [])];
    newAnswers[answerIndex] = updatedAnswer;
    onChange({ ...question, answers: newAnswers });
  };

  const handleAddAnswer = () => {
    const existingLetters = (question.answers || []).map(a => a.answer_letter);
    const availableLetters = ['A', 'B', 'C', 'D', 'E'];
    const nextLetter = availableLetters.find(letter => !existingLetters.includes(letter)) || 'A';
    
    const newAnswer: QuestionAnswer = {
      answer_letter: nextLetter,
      answer_text: '',
      is_correct: false
    };
    
    onChange({ ...question, answers: [...(question.answers || []), newAnswer] });
  };

  const handleRemoveAnswer = (answerIndex: number) => {
    const newAnswers = [...(question.answers || [])];
    newAnswers.splice(answerIndex, 1);
    onChange({ ...question, answers: newAnswers });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <h5 className="font-medium text-gray-900">Question {question.question_number}</h5>
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
        >
          Remove
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
          <textarea
            value={question.question_text}
            onChange={(e) => onChange({ ...question, question_text: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your question here..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcome</label>
          <textarea
            value={question.learning_outcome || ''}
            onChange={(e) => onChange({ ...question, learning_outcome: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="What the student should learn from this question..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rationale</label>
          <textarea
            value={question.rationale || ''}
            onChange={(e) => onChange({ ...question, rationale: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Explain why the correct answer is correct..."
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Answers</label>
            <Button onClick={handleAddAnswer} variant="ghost" size="sm">
              Add Answer
            </Button>
          </div>
          
          <div className="space-y-2">
            {question.answers?.map((answer, answerIndex) => (
              <div key={answerIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={answer.answer_text}
                  onChange={(e) => handleAnswerChange(answerIndex, { ...answer, answer_text: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`Answer ${answer.answer_letter}`}
                />
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={answer.is_correct}
                    onChange={(e) => handleAnswerChange(answerIndex, { ...answer, is_correct: e.target.checked })}
                    className="mr-1"
                  />
                  Correct
                </label>
                <Button
                  onClick={() => handleRemoveAnswer(answerIndex)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;
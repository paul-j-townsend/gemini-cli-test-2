import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Quiz from '@/components/Quiz';

const QuizPage: React.FC = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quizzes');
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
  };

  if (loading) return <Layout><div>Loading quizzes...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="container-wide py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-900 mb-4">
              Knowledge Quiz
            </h1>
            <p className="text-lg text-emerald-600">
              Test your knowledge with our interactive quiz questions
            </p>
          </div>

          {selectedQuizId ? (
            <Quiz quizId={selectedQuizId} />
          ) : (
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <h2 className="text-2xl font-semibold text-emerald-900 mb-6">
                Select a Quiz
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="border p-4 rounded-lg">
                    <h3 className="text-xl font-bold">{quiz.title}</h3>
                    <p>{quiz.description}</p>
                    <button onClick={() => handleSelectQuiz(quiz.id)}>
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuizPage;
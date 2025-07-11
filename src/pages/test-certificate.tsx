import React from 'react';
import Certificate from '../components/Certificate';
import { QuizCompletion } from '../types/database';

const TestCertificate: React.FC = () => {
  const mockCompletion: QuizCompletion = {
    id: 'test-completion-id',
    user_id: 'test-user-id',
    quiz_id: 'test-quiz-id',
    podcast_id: 'test-podcast-id',
    score: 100,
    max_score: 100,
    percentage: 100,
    time_spent: 900, // 15 minutes = 900 seconds, should give 1 base + 1 bonus = 2 CPD points
    completed_at: new Date().toISOString(),
    answers: [],
    passed: true,
    attempts: 1
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Certificate Test Page</h1>
        <Certificate
          completion={mockCompletion}
          userName="Dr. Sarah Johnson"
          quizTitle="Veterinary Pharmacology Fundamentals"
          onDownload={() => console.log('Certificate downloaded!')}
        />
      </div>
    </div>
  );
};

export default TestCertificate;
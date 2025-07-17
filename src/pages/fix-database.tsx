import { useState } from 'react';

export default function FixDatabase() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createQuizRecord = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-quiz-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testDirect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db-direct');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const removeFKConstraint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/remove-fk-constraint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const checkQuizSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-quiz-schema');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Fix Tools</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={checkQuizSchema}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Check Quiz Table Schema'}
        </button>
        
        <button
          onClick={createQuizRecord}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Processing...' : 'Create Quiz Record (Recommended)'}
        </button>
        
        <button
          onClick={testDirect}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Processing...' : 'Test Database Direct'}
        </button>
        
        <button
          onClick={removeFKConstraint}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Processing...' : 'Remove FK Constraint (Advanced)'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';

export default function MigratePage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    setStatus('Checking database...');
    
    try {
      // First, check if column exists by trying to query it
      const testResponse = await fetch('/api/quizzes/test-learning-outcome', {
        method: 'GET'
      });
      
      const testResult = await testResponse.json();
      
      if (testResult.exists) {
        setStatus('✅ learning_outcome column already exists!');
        setLoading(false);
        return;
      }
      
      setStatus('❌ Column does not exist. Manual SQL required.');
      
    } catch (error) {
      setStatus('❌ Error checking database. Manual SQL required.');
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database Migration</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add Learning Outcome Column</h2>
        
        <p className="mb-4">
          This will add the <code className="bg-gray-100 px-2 py-1 rounded">learning_outcome</code> column 
          to the <code className="bg-gray-100 px-2 py-1 rounded">quiz_questions</code> table.
        </p>
        
        <button 
          onClick={runMigration}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Database Status'}
        </button>
        
        {status && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="whitespace-pre-wrap">{status}</p>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Manual Migration Required</h3>
          <p className="text-yellow-700 mb-3">
            Please run this SQL in your Supabase SQL Editor:
          </p>
          <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm">
            ALTER TABLE quiz_questions ADD COLUMN learning_outcome TEXT;
          </code>
          <p className="text-yellow-700 mt-3 text-sm">
            1. Go to your <a href="https://supabase.com/dashboard" className="underline">Supabase Dashboard</a><br/>
            2. Navigate to SQL Editor<br/>
            3. Run the SQL command above<br/>
            4. Refresh this page to verify
          </p>
        </div>
      </div>
    </div>
  );
}
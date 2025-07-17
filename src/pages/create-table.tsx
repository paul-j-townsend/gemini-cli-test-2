import { useState } from 'react';
import Layout from '@/components/Layout';

const CreateTable = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createTable = async () => {
    setLoading(true);
    setResult('Creating table...');
    
    try {
      const response = await fetch('/api/test-table-creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Success: ${data.message}\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.error}\n\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Create User Content Progress Table</h1>
        
        <div className="space-y-4">
          <button
            onClick={createTable}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
          >
            {loading ? 'Creating...' : 'Create Table'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CreateTable;
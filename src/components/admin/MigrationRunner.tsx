import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

export default function MigrationRunner() {
  const [migrating, setMigrating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setMigrating(true);
    setError(null);
    setSuccess(false);

    try {
      // First check if the tables already exist by trying to fetch content
      const contentCheck = await fetch('/api/admin/content');
      
      if (contentCheck.ok) {
        // Tables already exist and working!
        setSuccess(true);
        setMigrating(false);
        return;
      }

      // If content check fails, try the migration
      const response = await fetch('/api/admin/migrate-to-unified-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Migration failed');
      }

      const result = await response.json();
      console.log('Migration result:', result);
      setSuccess(true);
    } catch (err) {
      setError(`Migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Database Migration</h3>
          <p className="text-gray-600 mt-1">
            Run the unified content schema migration to combine podcast and quiz data.
          </p>
        </div>

        {error && (
          <ErrorDisplay
            error={error}
            onDismiss={() => setError(null)}
          />
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Migration completed successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>The database has been updated to use the unified content schema.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={runMigration}
            disabled={migrating || success}
            loading={migrating}
            variant="primary"
          >
            {success ? 'Migration Complete' : 'Run Migration'}
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          <p><strong>Warning:</strong> This will clear all existing data and create a new unified schema.</p>
          <p>Make sure you have a backup if needed.</p>
        </div>
      </div>
    </Card>
  );
}
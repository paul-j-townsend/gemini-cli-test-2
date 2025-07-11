import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

interface TestLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

interface TestResult {
  success: boolean;
  logs: TestLog[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningTests: number;
  };
  details: {
    preMigrationState: any;
    postMigrationState: any;
    rollbackState?: any;
  };
}

let testLogs: TestLog[] = [];

function log(level: TestLog['level'], message: string, data?: any) {
  const entry: TestLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
  testLogs.push(entry);
  console.log(`[TEST ${level.toUpperCase()}] ${message}`, data || '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { testType = 'full', includeRollback = false } = req.body;

  // Reset logs for this test run
  testLogs = [];

  try {
    log('info', 'Starting podcast-quiz migration test suite', { testType, includeRollback });

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let warningTests = 0;

    const incrementTest = (result: 'pass' | 'fail' | 'warning') => {
      totalTests++;
      switch (result) {
        case 'pass': passedTests++; break;
        case 'fail': failedTests++; break;
        case 'warning': warningTests++; break;
      }
    };

    // Test 1: Capture pre-migration state
    log('info', 'Test 1: Capturing pre-migration state');
    const preMigrationState = await captureSystemState();
    if (preMigrationState) {
      log('success', 'Pre-migration state captured');
      incrementTest('pass');
    } else {
      log('error', 'Failed to capture pre-migration state');
      incrementTest('fail');
    }

    // Test 2: Validate audit endpoint
    log('info', 'Test 2: Testing audit endpoint');
    const auditResult = await testAuditEndpoint();
    incrementTest(auditResult ? 'pass' : 'fail');

    // Test 3: Run migration in dry-run mode
    log('info', 'Test 3: Testing migration dry-run');
    const dryRunResult = await testMigrationDryRun();
    incrementTest(dryRunResult ? 'pass' : 'fail');

    // Test 4: Run actual migration
    log('info', 'Test 4: Running actual migration');
    const migrationResult = await testActualMigration();
    incrementTest(migrationResult.success ? 'pass' : 'fail');

    // Test 5: Validate post-migration state
    log('info', 'Test 5: Validating post-migration state');
    const postMigrationState = await captureSystemState();
    const validationResult = await validatePostMigration(preMigrationState, postMigrationState);
    incrementTest(validationResult ? 'pass' : 'fail');

    // Test 6: Test rollback (if requested)
    let rollbackState = null;
    if (includeRollback && migrationResult.rollbackData) {
      log('info', 'Test 6: Testing rollback functionality');
      const rollbackResult = await testRollback(migrationResult.rollbackData);
      incrementTest(rollbackResult.success ? 'pass' : 'fail');
      
      rollbackState = await captureSystemState();
    }

    // Test 7: Database integrity checks
    log('info', 'Test 7: Database integrity checks');
    const integrityResult = await testDatabaseIntegrity();
    incrementTest(integrityResult ? 'pass' : 'fail');

    // Test 8: Performance and constraint checks
    log('info', 'Test 8: Performance and constraint checks');
    const performanceResult = await testPerformanceAndConstraints();
    incrementTest(performanceResult ? 'pass' : 'fail');

    const result: TestResult = {
      success: failedTests === 0,
      logs: testLogs,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        warningTests
      },
      details: {
        preMigrationState,
        postMigrationState,
        rollbackState
      }
    };

    log('success', `Test suite completed: ${passedTests}/${totalTests} passed, ${failedTests} failed, ${warningTests} warnings`);
    return res.status(200).json(result);

  } catch (error) {
    log('error', 'Test suite failed with error', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: testLogs
    });
  }
}

async function captureSystemState() {
  try {
    // Get episode and quiz counts
    const { count: episodeCount } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('*', { count: 'exact', head: true });

    const { count: quizCount } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*', { count: 'exact', head: true });

    // Get episodes without quizzes
    const { data: episodesWithoutQuizzes } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, title, quiz_id')
      .is('quiz_id', null);

    // Get quiz completions count
    const { count: completionsCount } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('*', { count: 'exact', head: true });

    // Get constraint information
    const { data: constraints } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          SELECT 
            conname as constraint_name,
            pg_get_constraintdef(c.oid) as constraint_definition
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE t.relname = 'vsk_podcast_episodes' 
            AND c.contype = 'f'
            AND pg_get_constraintdef(c.oid) LIKE '%quiz_id%'
        `
      });

    // Check if quiz_id is nullable
    const { data: columnInfo } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          SELECT 
            column_name,
            is_nullable,
            data_type
          FROM information_schema.columns
          WHERE table_name = 'vsk_podcast_episodes'
            AND column_name = 'quiz_id'
        `
      });

    return {
      episodeCount: episodeCount || 0,
      quizCount: quizCount || 0,
      episodesWithoutQuizzes: episodesWithoutQuizzes?.length || 0,
      completionsCount: completionsCount || 0,
      constraints: constraints || [],
      columnInfo: columnInfo || [],
      episodeDetails: episodesWithoutQuizzes || []
    };

  } catch (error) {
    log('error', 'Failed to capture system state', error);
    return null;
  }
}

async function testAuditEndpoint() {
  try {
    const auditResponse = await fetch('/api/audit-podcast-quiz-relationships', {
      method: 'GET'
    });

    if (!auditResponse.ok) {
      log('error', 'Audit endpoint failed', { status: auditResponse.status });
      return false;
    }

    const auditData = await auditResponse.json();
    
    if (!auditData.summary || !auditData.details || !auditData.recommendations) {
      log('error', 'Audit endpoint returned invalid data structure');
      return false;
    }

    log('success', 'Audit endpoint test passed', {
      totalEpisodes: auditData.summary.totalEpisodes,
      totalQuizzes: auditData.summary.totalQuizzes,
      episodesWithoutQuizzes: auditData.summary.episodesWithoutQuizzes
    });

    return true;

  } catch (error) {
    log('error', 'Audit endpoint test failed', error);
    return false;
  }
}

async function testMigrationDryRun() {
  try {
    const response = await fetch('/api/migrate-podcast-quiz-refactor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: true })
    });

    if (!response.ok) {
      log('error', 'Migration dry-run failed', { status: response.status });
      return false;
    }

    const data = await response.json();
    
    if (!data.success || !data.dryRun) {
      log('error', 'Migration dry-run returned invalid response');
      return false;
    }

    log('success', 'Migration dry-run test passed', data.summary);
    return true;

  } catch (error) {
    log('error', 'Migration dry-run test failed', error);
    return false;
  }
}

async function testActualMigration() {
  try {
    const response = await fetch('/api/migrate-podcast-quiz-refactor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: false })
    });

    if (!response.ok) {
      log('error', 'Migration execution failed', { status: response.status });
      return { success: false };
    }

    const data = await response.json();
    
    if (!data.success) {
      log('error', 'Migration execution returned failure', data);
      return { success: false };
    }

    log('success', 'Migration execution test passed', data.summary);
    return { success: true, rollbackData: data.rollbackData };

  } catch (error) {
    log('error', 'Migration execution test failed', error);
    return { success: false };
  }
}

async function validatePostMigration(preMigrationState: any, postMigrationState: any) {
  try {
    // Check that all episodes now have quizzes
    if (postMigrationState.episodesWithoutQuizzes > 0) {
      log('error', `Post-migration validation failed: ${postMigrationState.episodesWithoutQuizzes} episodes still without quizzes`);
      return false;
    }

    // Check that total episodes remained the same
    if (postMigrationState.episodeCount !== preMigrationState.episodeCount) {
      log('error', 'Episode count changed during migration', {
        before: preMigrationState.episodeCount,
        after: postMigrationState.episodeCount
      });
      return false;
    }

    // Check that quiz count increased (due to placeholder quizzes)
    if (postMigrationState.quizCount <= preMigrationState.quizCount) {
      log('warning', 'Quiz count did not increase - might be expected if no episodes were missing quizzes');
    }

    // Check that constraints were updated
    const hasNotNullConstraint = postMigrationState.columnInfo.some(
      (col: any) => col.column_name === 'quiz_id' && col.is_nullable === 'NO'
    );

    if (!hasNotNullConstraint) {
      log('error', 'quiz_id column is still nullable after migration');
      return false;
    }

    log('success', 'Post-migration validation passed');
    return true;

  } catch (error) {
    log('error', 'Post-migration validation failed', error);
    return false;
  }
}

async function testRollback(rollbackData: any) {
  try {
    const response = await fetch('/api/rollback-podcast-quiz-refactor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollbackData, dryRun: false })
    });

    if (!response.ok) {
      log('error', 'Rollback execution failed', { status: response.status });
      return { success: false };
    }

    const data = await response.json();
    
    if (!data.success) {
      log('error', 'Rollback execution returned failure', data);
      return { success: false };
    }

    log('success', 'Rollback execution test passed', data.summary);
    return { success: true };

  } catch (error) {
    log('error', 'Rollback execution test failed', error);
    return { success: false };
  }
}

async function testDatabaseIntegrity() {
  try {
    // Check for orphaned records
    const { data: orphanedCompletions } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('id, quiz_id')
      .not('quiz_id', 'in', `(SELECT id FROM vsk_quizzes)`);

    if (orphanedCompletions && orphanedCompletions.length > 0) {
      log('error', `Found ${orphanedCompletions.length} orphaned quiz completions`);
      return false;
    }

    // Check for circular references or invalid relationships
    const { data: episodes } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, quiz_id')
      .not('quiz_id', 'is', null);

    if (episodes) {
      const quizIds = episodes.map(ep => ep.quiz_id);
      const uniqueQuizIds = Array.from(new Set(quizIds));
      
      if (quizIds.length !== uniqueQuizIds.length) {
        log('warning', 'Found duplicate quiz assignments - multiple episodes using same quiz');
      }
    }

    log('success', 'Database integrity checks passed');
    return true;

  } catch (error) {
    log('error', 'Database integrity checks failed', error);
    return false;
  }
}

async function testPerformanceAndConstraints() {
  try {
    // Test constraint enforcement
    const testEpisodeId = 'test-episode-' + Date.now();
    
    try {
      // Try to insert episode with null quiz_id (should fail if constraints are working)
      const { error: insertError } = await supabaseAdmin
        .from('vsk_podcast_episodes')
        .insert({
          id: testEpisodeId,
          title: 'Test Episode',
          quiz_id: null
        });

      if (!insertError) {
        // Clean up the test record
        await supabaseAdmin
          .from('vsk_podcast_episodes')
          .delete()
          .eq('id', testEpisodeId);
        
        log('error', 'Constraint enforcement failed - null quiz_id was accepted');
        return false;
      }

      log('success', 'Constraint enforcement working correctly');
    } catch (error) {
      log('info', 'Constraint test completed with expected error');
    }

    // Test foreign key constraint
    const { data: sampleQuiz } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('id')
      .limit(1)
      .single();

    if (sampleQuiz) {
      // Try to delete a quiz that's referenced by an episode (should fail)
      const { error: deleteError } = await supabaseAdmin
        .from('vsk_quizzes')
        .delete()
        .eq('id', sampleQuiz.id);

      if (!deleteError) {
        log('error', 'Foreign key constraint not working - quiz with references was deleted');
        return false;
      }

      log('success', 'Foreign key constraint working correctly');
    }

    return true;

  } catch (error) {
    log('error', 'Performance and constraint tests failed', error);
    return false;
  }
}
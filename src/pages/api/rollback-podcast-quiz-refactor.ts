import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

interface RollbackLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

let rollbackLogs: RollbackLog[] = [];

function log(level: RollbackLog['level'], message: string, data?: any) {
  const entry: RollbackLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
  rollbackLogs.push(entry);
  console.log(`[ROLLBACK ${level.toUpperCase()}] ${message}`, data || '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    rollbackData, 
    dryRun = false, 
    forceRollback = false 
  } = req.body;

  if (!rollbackData) {
    return res.status(400).json({ 
      error: 'Rollback data required. This should be provided from the migration result.' 
    });
  }

  // Reset logs for this rollback run
  rollbackLogs = [];

  try {
    log('info', 'Starting podcast-quiz refactoring rollback', { dryRun, forceRollback });

    // Phase 1: Validate rollback data
    log('info', 'Phase 1: Validating rollback data');
    
    const validationResult = await validateRollbackData(rollbackData);
    if (!validationResult.success && !forceRollback) {
      log('error', 'Rollback data validation failed');
      return res.status(400).json({
        success: false,
        error: 'Invalid rollback data',
        logs: rollbackLogs,
        details: validationResult.details
      });
    }

    // Phase 2: Safety checks
    log('info', 'Phase 2: Performing safety checks');
    
    const safetyResult = await performSafetyChecks();
    if (!safetyResult.success && !forceRollback) {
      log('warning', 'Safety checks failed - use forceRollback=true to override');
      return res.status(400).json({
        success: false,
        error: 'Safety checks failed',
        logs: rollbackLogs,
        safetyDetails: safetyResult.details
      });
    }

    if (dryRun) {
      log('info', 'Dry run completed - no changes made');
      return res.status(200).json({
        success: true,
        dryRun: true,
        logs: rollbackLogs,
        plannedActions: {
          constraintsToRestore: rollbackData.originalConstraints?.length || 0,
          quizzesToDelete: rollbackData.createdQuizzes?.length || 0,
          quizzesToUnarchive: rollbackData.archivedQuizzes?.length || 0
        }
      });
    }

    // Phase 3: Restore original constraints
    log('info', 'Phase 3: Restoring original constraints');
    
    const constraintResult = await restoreConstraints(rollbackData.originalConstraints);

    // Phase 4: Handle created quizzes
    log('info', 'Phase 4: Handling created quizzes');
    
    const createdQuizResult = await handleCreatedQuizzes(rollbackData.createdQuizzes);

    // Phase 5: Restore archived quizzes
    log('info', 'Phase 5: Restoring archived quizzes');
    
    const archivedQuizResult = await restoreArchivedQuizzes(rollbackData.archivedQuizzes);

    // Phase 6: Final validation
    log('info', 'Phase 6: Final validation');
    
    const finalValidation = await performFinalValidation();

    const rollbackResult = {
      success: true,
      logs: rollbackLogs,
      summary: {
        constraintsRestored: constraintResult.success,
        quizzesDeleted: createdQuizResult.deletedCount,
        quizzesUnarchived: archivedQuizResult.unarchivedCount,
        episodesAffected: createdQuizResult.episodesAffected,
        finalValidation: finalValidation.success
      }
    };

    log('success', 'Rollback completed successfully', rollbackResult.summary);
    return res.status(200).json(rollbackResult);

  } catch (error) {
    log('error', 'Rollback failed with error', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: rollbackLogs
    });
  }
}

async function validateRollbackData(rollbackData: any) {
  log('info', 'Validating rollback data structure');

  try {
    const hasCreatedQuizzes = Array.isArray(rollbackData.createdQuizzes);
    const hasArchivedQuizzes = Array.isArray(rollbackData.archivedQuizzes);
    const hasOriginalConstraints = Array.isArray(rollbackData.originalConstraints);

    if (!hasCreatedQuizzes || !hasArchivedQuizzes || !hasOriginalConstraints) {
      return {
        success: false,
        details: {
          hasCreatedQuizzes,
          hasArchivedQuizzes,
          hasOriginalConstraints
        }
      };
    }

    // Validate that the created quizzes still exist
    if (rollbackData.createdQuizzes.length > 0) {
      const { data: existingQuizzes, error: quizError } = await supabaseAdmin
        .from('vsk_quizzes')
        .select('id')
        .in('id', rollbackData.createdQuizzes);

      if (quizError) {
        log('error', 'Failed to validate created quizzes', quizError);
        return { success: false };
      }

      const missingQuizzes = rollbackData.createdQuizzes.filter(
        (id: string) => !existingQuizzes?.find(q => q.id === id)
      );

      if (missingQuizzes.length > 0) {
        log('warning', `${missingQuizzes.length} created quizzes no longer exist`, missingQuizzes);
      }
    }

    log('success', 'Rollback data validation passed');
    return { success: true };

  } catch (error) {
    log('error', 'Rollback data validation failed', error);
    return { success: false };
  }
}

async function performSafetyChecks() {
  log('info', 'Performing safety checks');

  try {
    // Check if there are any new quiz completions since migration
    const { data: recentCompletions, error: completionsError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('id, quiz_id, completed_at')
      .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .limit(100);

    if (completionsError) {
      log('error', 'Failed to check recent completions', completionsError);
      return { success: false };
    }

    const recentCompletionCount = recentCompletions?.length || 0;

    // Check current constraint status
    const { data: constraintInfo, error: constraintError } = await supabaseAdmin
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

    if (constraintError) {
      log('warning', 'Could not check current constraints', constraintError);
    }

    const details = {
      recentCompletions: recentCompletionCount,
      currentConstraints: constraintInfo?.length || 0,
      constraintInfo: constraintInfo || []
    };

    log('info', 'Safety checks completed', details);

    // For now, allow rollback even with recent completions, but warn
    if (recentCompletionCount > 0) {
      log('warning', `${recentCompletionCount} quiz completions in last 24 hours - rollback may affect user data`);
    }

    return { success: true, details };

  } catch (error) {
    log('error', 'Safety checks failed', error);
    return { success: false };
  }
}

async function restoreConstraints(originalConstraints: any[]) {
  log('info', 'Restoring original constraints');

  try {
    // First, make the quiz_id column nullable again
    const { error: nullableError } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          ALTER TABLE vsk_podcast_episodes 
          ALTER COLUMN quiz_id DROP NOT NULL;
        `
      });

    if (nullableError) {
      log('error', 'Failed to make quiz_id nullable', nullableError);
      return { success: false };
    }

    // Drop the current constraint
    const { error: dropError } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          ALTER TABLE vsk_podcast_episodes 
          DROP CONSTRAINT IF EXISTS vsk_podcast_episodes_quiz_id_fkey;
        `
      });

    if (dropError) {
      log('error', 'Failed to drop current constraint', dropError);
      return { success: false };
    }

    // Restore the original constraint (if any)
    if (originalConstraints && originalConstraints.length > 0) {
      const originalConstraint = originalConstraints[0];
      const { error: restoreError } = await supabaseAdmin
        .rpc('exec_sql', {
          query: `
            ALTER TABLE vsk_podcast_episodes 
            ADD CONSTRAINT vsk_podcast_episodes_quiz_id_fkey 
            FOREIGN KEY (quiz_id) 
            REFERENCES vsk_quizzes(id) 
            ON DELETE SET NULL;
          `
        });

      if (restoreError) {
        log('error', 'Failed to restore original constraint', restoreError);
        return { success: false };
      }

      log('success', 'Original constraint restored');
    } else {
      log('info', 'No original constraint to restore');
    }

    return { success: true };

  } catch (error) {
    log('error', 'Failed to restore constraints', error);
    return { success: false };
  }
}

async function handleCreatedQuizzes(createdQuizzes: string[]) {
  log('info', `Processing ${createdQuizzes.length} created quizzes`);

  let deletedCount = 0;
  let episodesAffected = 0;

  try {
    for (const quizId of createdQuizzes) {
      // First, check if the quiz has any completions
      const { data: completions, error: completionsError } = await supabaseAdmin
        .from('vsk_quiz_completions')
        .select('id')
        .eq('quiz_id', quizId)
        .limit(1);

      if (completionsError) {
        log('error', `Failed to check completions for quiz ${quizId}`, completionsError);
        continue;
      }

      if (completions && completions.length > 0) {
        log('warning', `Quiz ${quizId} has completions - marking as archived instead of deleting`);
        
        // Update the quiz to mark it as archived
        const { error: archiveError } = await supabaseAdmin
          .from('vsk_quizzes')
          .update({
            title: `[ROLLBACK-ARCHIVED] ${new Date().toISOString()}`,
            description: 'Quiz was created during migration but has user completions, so it was archived during rollback.',
            is_active: false
          })
          .eq('id', quizId);

        if (archiveError) {
          log('error', `Failed to archive quiz ${quizId}`, archiveError);
        }

        // Set the episode's quiz_id to null
        const { error: updateError } = await supabaseAdmin
          .from('vsk_podcast_episodes')
          .update({ quiz_id: null })
          .eq('quiz_id', quizId);

        if (updateError) {
          log('error', `Failed to unlink episode from quiz ${quizId}`, updateError);
        } else {
          episodesAffected++;
        }
      } else {
        // No completions, safe to delete
        
        // First, unlink any episodes
        const { error: unlinkError } = await supabaseAdmin
          .from('vsk_podcast_episodes')
          .update({ quiz_id: null })
          .eq('quiz_id', quizId);

        if (unlinkError) {
          log('error', `Failed to unlink episodes from quiz ${quizId}`, unlinkError);
        } else {
          episodesAffected++;
        }

        // Then delete the quiz
        const { error: deleteError } = await supabaseAdmin
          .from('vsk_quizzes')
          .delete()
          .eq('id', quizId);

        if (deleteError) {
          log('error', `Failed to delete quiz ${quizId}`, deleteError);
        } else {
          deletedCount++;
          log('info', `Deleted created quiz ${quizId}`);
        }
      }
    }

    log('success', `Processed created quizzes: ${deletedCount} deleted, ${episodesAffected} episodes affected`);
    return { success: true, deletedCount, episodesAffected };

  } catch (error) {
    log('error', 'Failed to handle created quizzes', error);
    return { success: false, deletedCount, episodesAffected };
  }
}

async function restoreArchivedQuizzes(archivedQuizzes: string[]) {
  log('info', `Restoring ${archivedQuizzes.length} archived quizzes`);

  let unarchivedCount = 0;

  try {
    for (const quizId of archivedQuizzes) {
      // Get the current quiz state
      const { data: quiz, error: quizError } = await supabaseAdmin
        .from('vsk_quizzes')
        .select('title, description')
        .eq('id', quizId)
        .single();

      if (quizError) {
        log('error', `Failed to get quiz ${quizId}`, quizError);
        continue;
      }

      // Remove the [ARCHIVED] prefix and restore description
      let restoredTitle = quiz.title;
      let restoredDescription = quiz.description;

      if (restoredTitle.startsWith('[ARCHIVED] ')) {
        restoredTitle = restoredTitle.replace('[ARCHIVED] ', '');
      }

      // Remove the archive note from description
      if (restoredDescription && restoredDescription.includes('\n\nThis quiz was archived during podcast-quiz refactoring')) {
        restoredDescription = restoredDescription.split('\n\nThis quiz was archived during podcast-quiz refactoring')[0];
      }

      // Update the quiz to restore it
      const { error: updateError } = await supabaseAdmin
        .from('vsk_quizzes')
        .update({
          title: restoredTitle,
          description: restoredDescription,
          is_active: true
        })
        .eq('id', quizId);

      if (updateError) {
        log('error', `Failed to restore quiz ${quizId}`, updateError);
      } else {
        unarchivedCount++;
        log('info', `Restored archived quiz ${quizId}`);
      }
    }

    log('success', `Restored ${unarchivedCount} archived quizzes`);
    return { success: true, unarchivedCount };

  } catch (error) {
    log('error', 'Failed to restore archived quizzes', error);
    return { success: false, unarchivedCount };
  }
}

async function performFinalValidation() {
  log('info', 'Performing final validation');

  try {
    // Check current state
    const { data: episodesWithoutQuizzes, error: episodesError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id')
      .is('quiz_id', null);

    if (episodesError) {
      log('error', 'Failed to check episodes in final validation', episodesError);
      return { success: false };
    }

    const { count: totalEpisodes } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('*', { count: 'exact', head: true });

    const { count: totalQuizzes } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*', { count: 'exact', head: true });

    const summary = {
      totalEpisodes: totalEpisodes || 0,
      totalQuizzes: totalQuizzes || 0,
      episodesWithoutQuizzes: episodesWithoutQuizzes?.length || 0,
      episodesWithQuizzes: (totalEpisodes || 0) - (episodesWithoutQuizzes?.length || 0)
    };

    log('success', 'Final validation completed', summary);
    return { success: true, summary };

  } catch (error) {
    log('error', 'Final validation failed', error);
    return { success: false };
  }
}
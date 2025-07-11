import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

interface MigrationLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

interface MigrationResult {
  success: boolean;
  logs: MigrationLog[];
  summary: {
    episodesProcessed: number;
    quizzesCreated: number;
    quizzesArchived: number;
    constraintsUpdated: number;
    rollbackAvailable: boolean;
  };
  rollbackData?: {
    createdQuizzes: string[];
    archivedQuizzes: string[];
    originalConstraints: any[];
  };
}

let migrationLogs: MigrationLog[] = [];

function log(level: MigrationLog['level'], message: string, data?: any) {
  const entry: MigrationLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
  migrationLogs.push(entry);
  console.log(`[${level.toUpperCase()}] ${message}`, data || '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dryRun = false, forceExecute = false } = req.body;

  // Reset logs for this migration run
  migrationLogs = [];

  try {
    log('info', 'Starting podcast-quiz refactoring migration', { dryRun, forceExecute });

    // Phase 1: Pre-migration audit and safety checks
    log('info', 'Phase 1: Pre-migration audit and safety checks');
    
    const auditResult = await performPreMigrationAudit();
    if (!auditResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Pre-migration audit failed',
        logs: migrationLogs
      });
    }

    // Phase 2: Safety checks and validation
    log('info', 'Phase 2: Safety checks and validation');
    
    const validationResult = await performValidation();
    if (!validationResult.success && !forceExecute) {
      log('warning', 'Validation failed - use forceExecute=true to override');
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        logs: migrationLogs,
        validationDetails: validationResult.details
      });
    }

    if (dryRun) {
      log('info', 'Dry run completed - no changes made');
      return res.status(200).json({
        success: true,
        dryRun: true,
        logs: migrationLogs,
        summary: auditResult.summary
      });
    }

    // Phase 3: Create backup and rollback data
    log('info', 'Phase 3: Creating backup and rollback data');
    
    const rollbackData = await createRollbackData();

    // Phase 4: Create placeholder quizzes for episodes without them
    log('info', 'Phase 4: Creating placeholder quizzes for episodes without them');
    
    const createdQuizzes = await createPlaceholderQuizzes(auditResult.episodesWithoutQuizzes);

    // Phase 5: Handle orphaned quizzes
    log('info', 'Phase 5: Handling orphaned quizzes');
    
    const archivedQuizzes = await handleOrphanedQuizzes(auditResult.orphanedQuizzes);

    // Phase 6: Update foreign key constraints
    log('info', 'Phase 6: Updating foreign key constraints');
    
    const constraintResult = await updateConstraints();

    // Phase 7: Final validation
    log('info', 'Phase 7: Final validation');
    
    const finalAudit = await performPostMigrationAudit();

    const result: MigrationResult = {
      success: true,
      logs: migrationLogs,
      summary: {
        episodesProcessed: auditResult.episodesWithoutQuizzes.length,
        quizzesCreated: createdQuizzes.length,
        quizzesArchived: archivedQuizzes.length,
        constraintsUpdated: constraintResult.success ? 1 : 0,
        rollbackAvailable: true
      },
      rollbackData: {
        createdQuizzes,
        archivedQuizzes,
        originalConstraints: rollbackData.originalConstraints
      }
    };

    log('success', 'Migration completed successfully', result.summary);
    return res.status(200).json(result);

  } catch (error) {
    log('error', 'Migration failed with error', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: migrationLogs
    });
  }
}

async function performPreMigrationAudit() {
  log('info', 'Starting pre-migration audit');

  try {
    // Get episodes without quizzes
    const { data: episodesWithoutQuizzes, error: episodesError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, title, quiz_id')
      .is('quiz_id', null);

    if (episodesError) {
      log('error', 'Failed to fetch episodes without quizzes', episodesError);
      return { success: false };
    }

    // Get orphaned quizzes (quizzes not referenced by any episode)
    const { data: allQuizzes, error: quizzesError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('id, title');

    if (quizzesError) {
      log('error', 'Failed to fetch quizzes', quizzesError);
      return { success: false };
    }

    const { data: referencedQuizzes, error: referencedError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('quiz_id')
      .not('quiz_id', 'is', null);

    if (referencedError) {
      log('error', 'Failed to fetch referenced quizzes', referencedError);
      return { success: false };
    }

    const referencedQuizIds = new Set(referencedQuizzes?.map(ep => ep.quiz_id) || []);
    const orphanedQuizzes = allQuizzes?.filter(quiz => !referencedQuizIds.has(quiz.id)) || [];

    // Get total counts
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
      orphanedQuizzes: orphanedQuizzes.length,
      episodesWithQuizzes: (totalEpisodes || 0) - (episodesWithoutQuizzes?.length || 0)
    };

    log('info', 'Pre-migration audit completed', summary);

    return {
      success: true,
      summary,
      episodesWithoutQuizzes: episodesWithoutQuizzes || [],
      orphanedQuizzes
    };

  } catch (error) {
    log('error', 'Pre-migration audit failed', error);
    return { success: false };
  }
}

async function performValidation() {
  log('info', 'Performing validation checks');

  try {
    // Check if there are any existing quiz completions that might be affected
    const { data: completions, error: completionsError } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .select('id, quiz_id, user_id')
      .limit(1);

    if (completionsError) {
      log('error', 'Failed to check quiz completions', completionsError);
      return { success: false };
    }

    // Check for any critical constraints that might prevent migration
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
      log('warning', 'Could not check constraints', constraintError);
    }

    const hasCompletions = completions && completions.length > 0;
    const hasConstraints = constraintInfo && constraintInfo.length > 0;

    log('info', 'Validation completed', {
      hasCompletions,
      hasConstraints,
      constraintCount: constraintInfo?.length || 0
    });

    return {
      success: true,
      details: {
        hasCompletions,
        hasConstraints,
        constraintInfo: constraintInfo || []
      }
    };

  } catch (error) {
    log('error', 'Validation failed', error);
    return { success: false };
  }
}

async function createRollbackData() {
  log('info', 'Creating rollback data');

  try {
    // Get current constraint definitions
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
      log('warning', 'Could not backup constraints', constraintError);
    }

    const rollbackData = {
      originalConstraints: constraintInfo || []
    };

    log('info', 'Rollback data created', rollbackData);
    return rollbackData;

  } catch (error) {
    log('error', 'Failed to create rollback data', error);
    throw error;
  }
}

async function createPlaceholderQuizzes(episodesWithoutQuizzes: any[]) {
  log('info', `Creating ${episodesWithoutQuizzes.length} placeholder quizzes`);

  const createdQuizzes: string[] = [];

  try {
    for (const episode of episodesWithoutQuizzes) {
      // Create a placeholder quiz for this episode
      const { data: quiz, error: quizError } = await supabaseAdmin
        .from('vsk_quizzes')
        .insert({
          title: `Quiz for: ${episode.title}`,
          description: `Placeholder quiz created for podcast episode "${episode.title}". This quiz should be updated with actual content.`,
          category: 'general',
          pass_percentage: 70,
          total_questions: 0,
          is_active: false // Mark as inactive until content is added
        })
        .select()
        .single();

      if (quizError) {
        log('error', `Failed to create quiz for episode ${episode.id}`, quizError);
        throw quizError;
      }

      // Update the episode to reference the new quiz
      const { error: updateError } = await supabaseAdmin
        .from('vsk_podcast_episodes')
        .update({ quiz_id: quiz.id })
        .eq('id', episode.id);

      if (updateError) {
        log('error', `Failed to update episode ${episode.id} with quiz ${quiz.id}`, updateError);
        throw updateError;
      }

      createdQuizzes.push(quiz.id);
      log('info', `Created placeholder quiz ${quiz.id} for episode ${episode.id}`);
    }

    log('success', `Created ${createdQuizzes.length} placeholder quizzes`);
    return createdQuizzes;

  } catch (error) {
    log('error', 'Failed to create placeholder quizzes', error);
    throw error;
  }
}

async function handleOrphanedQuizzes(orphanedQuizzes: any[]) {
  log('info', `Handling ${orphanedQuizzes.length} orphaned quizzes`);

  const archivedQuizzes: string[] = [];

  try {
    for (const quiz of orphanedQuizzes) {
      // Check if the quiz has any completions
      const { data: completions, error: completionsError } = await supabaseAdmin
        .from('vsk_quiz_completions')
        .select('id')
        .eq('quiz_id', quiz.id)
        .limit(1);

      if (completionsError) {
        log('error', `Failed to check completions for quiz ${quiz.id}`, completionsError);
        continue;
      }

      if (completions && completions.length > 0) {
        // Quiz has completions, mark it as archived but don't delete
        const { error: archiveError } = await supabaseAdmin
          .from('vsk_quizzes')
          .update({
            title: `[ARCHIVED] ${quiz.title}`,
            description: `${quiz.description || ''}\n\nThis quiz was archived during podcast-quiz refactoring as it had no associated podcast episode but had user completions.`,
            is_active: false
          })
          .eq('id', quiz.id);

        if (archiveError) {
          log('error', `Failed to archive quiz ${quiz.id}`, archiveError);
        } else {
          archivedQuizzes.push(quiz.id);
          log('info', `Archived quiz ${quiz.id} (had completions)`);
        }
      } else {
        // Quiz has no completions, check if it should be associated with an episode
        // For now, we'll just mark it as archived
        const { error: archiveError } = await supabaseAdmin
          .from('vsk_quizzes')
          .update({
            title: `[ARCHIVED] ${quiz.title}`,
            description: `${quiz.description || ''}\n\nThis quiz was archived during podcast-quiz refactoring as it had no associated podcast episode.`,
            is_active: false
          })
          .eq('id', quiz.id);

        if (archiveError) {
          log('error', `Failed to archive quiz ${quiz.id}`, archiveError);
        } else {
          archivedQuizzes.push(quiz.id);
          log('info', `Archived quiz ${quiz.id} (no completions)`);
        }
      }
    }

    log('success', `Processed ${orphanedQuizzes.length} orphaned quizzes, archived ${archivedQuizzes.length}`);
    return archivedQuizzes;

  } catch (error) {
    log('error', 'Failed to handle orphaned quizzes', error);
    throw error;
  }
}

async function updateConstraints() {
  log('info', 'Updating foreign key constraints');

  try {
    // First, verify all episodes now have quizzes
    const { data: episodesWithoutQuizzes, error: checkError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id')
      .is('quiz_id', null);

    if (checkError) {
      log('error', 'Failed to check episodes before constraint update', checkError);
      return { success: false };
    }

    if (episodesWithoutQuizzes && episodesWithoutQuizzes.length > 0) {
      log('error', `Cannot update constraints: ${episodesWithoutQuizzes.length} episodes still have no quiz`);
      return { success: false };
    }

    // Update the foreign key constraint to CASCADE DELETE and make NOT NULL
    const { error: constraintError } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          -- Drop the existing constraint
          ALTER TABLE vsk_podcast_episodes 
          DROP CONSTRAINT IF EXISTS vsk_podcast_episodes_quiz_id_fkey;
          
          -- Make the column NOT NULL
          ALTER TABLE vsk_podcast_episodes 
          ALTER COLUMN quiz_id SET NOT NULL;
          
          -- Add the new constraint with CASCADE DELETE
          ALTER TABLE vsk_podcast_episodes 
          ADD CONSTRAINT vsk_podcast_episodes_quiz_id_fkey 
          FOREIGN KEY (quiz_id) 
          REFERENCES vsk_quizzes(id) 
          ON DELETE CASCADE;
        `
      });

    if (constraintError) {
      log('error', 'Failed to update constraints', constraintError);
      return { success: false };
    }

    log('success', 'Foreign key constraints updated successfully');
    return { success: true };

  } catch (error) {
    log('error', 'Failed to update constraints', error);
    return { success: false };
  }
}

async function performPostMigrationAudit() {
  log('info', 'Performing post-migration audit');

  try {
    // Check that all episodes now have quizzes
    const { data: episodesWithoutQuizzes, error: episodesError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id')
      .is('quiz_id', null);

    if (episodesError) {
      log('error', 'Failed to check episodes in post-migration audit', episodesError);
      return { success: false };
    }

    const episodesWithoutQuizzesCount = episodesWithoutQuizzes?.length || 0;

    // Get total counts
    const { count: totalEpisodes } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('*', { count: 'exact', head: true });

    const { count: totalQuizzes } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*', { count: 'exact', head: true });

    // Check constraint status
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
      log('warning', 'Could not check final constraints', constraintError);
    }

    const summary = {
      totalEpisodes: totalEpisodes || 0,
      totalQuizzes: totalQuizzes || 0,
      episodesWithoutQuizzes: episodesWithoutQuizzesCount,
      constraintsUpdated: constraintInfo?.length || 0
    };

    log('info', 'Post-migration audit completed', summary);

    const success = episodesWithoutQuizzesCount === 0;
    
    if (success) {
      log('success', 'Migration validation successful - all episodes have quizzes');
    } else {
      log('error', `Migration validation failed - ${episodesWithoutQuizzesCount} episodes still missing quizzes`);
    }

    return { success, summary };

  } catch (error) {
    log('error', 'Post-migration audit failed', error);
    return { success: false };
  }
}
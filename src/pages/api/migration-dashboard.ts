import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';

interface DashboardData {
  systemStatus: {
    healthy: boolean;
    readyForMigration: boolean;
    postMigrationState: boolean;
    lastMigrationCheck: string;
  };
  currentState: {
    episodes: {
      total: number;
      withQuizzes: number;
      withoutQuizzes: number;
      withoutQuizzesList: Array<{id: string; title: string}>;
    };
    quizzes: {
      total: number;
      active: number;
      inactive: number;
      orphaned: number;
      orphanedList: Array<{id: string; title: string}>;
    };
    constraints: {
      foreignKeyExists: boolean;
      columnNullable: boolean;
      cascadeDelete: boolean;
      constraintDetails: any[];
    };
  };
  recommendations: {
    actions: string[];
    warnings: string[];
    blockers: string[];
  };
  availableOperations: {
    canRunMigration: boolean;
    canRollback: boolean;
    needsBackup: boolean;
    suggestedNext: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dashboardData: DashboardData = {
      systemStatus: {
        healthy: true,
        readyForMigration: false,
        postMigrationState: false,
        lastMigrationCheck: new Date().toISOString()
      },
      currentState: {
        episodes: {
          total: 0,
          withQuizzes: 0,
          withoutQuizzes: 0,
          withoutQuizzesList: []
        },
        quizzes: {
          total: 0,
          active: 0,
          inactive: 0,
          orphaned: 0,
          orphanedList: []
        },
        constraints: {
          foreignKeyExists: false,
          columnNullable: true,
          cascadeDelete: false,
          constraintDetails: []
        }
      },
      recommendations: {
        actions: [],
        warnings: [],
        blockers: []
      },
      availableOperations: {
        canRunMigration: false,
        canRollback: false,
        needsBackup: true,
        suggestedNext: ''
      }
    };

    // Get episode information
    const { count: totalEpisodes, error: episodeCountError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('*', { count: 'exact', head: true });

    if (episodeCountError) {
      console.error('Error fetching episode count:', episodeCountError);
      dashboardData.systemStatus.healthy = false;
    } else {
      dashboardData.currentState.episodes.total = totalEpisodes || 0;
    }

    // Get episodes without quizzes
    const { data: episodesWithoutQuizzes, error: episodeNoQuizError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('id, title, quiz_id')
      .is('quiz_id', null);

    if (episodeNoQuizError) {
      console.error('Error fetching episodes without quizzes:', episodeNoQuizError);
      dashboardData.systemStatus.healthy = false;
    } else {
      dashboardData.currentState.episodes.withoutQuizzes = episodesWithoutQuizzes?.length || 0;
      dashboardData.currentState.episodes.withQuizzes = 
        dashboardData.currentState.episodes.total - dashboardData.currentState.episodes.withoutQuizzes;
      dashboardData.currentState.episodes.withoutQuizzesList = 
        (episodesWithoutQuizzes || []).map(ep => ({ id: ep.id, title: ep.title }));
    }

    // Get quiz information
    const { count: totalQuizzes, error: quizCountError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*', { count: 'exact', head: true });

    if (quizCountError) {
      console.error('Error fetching quiz count:', quizCountError);
      dashboardData.systemStatus.healthy = false;
    } else {
      dashboardData.currentState.quizzes.total = totalQuizzes || 0;
    }

    // Get active/inactive quiz counts
    const { count: activeQuizzes, error: activeQuizError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeQuizError) {
      console.error('Error fetching active quiz count:', activeQuizError);
    } else {
      dashboardData.currentState.quizzes.active = activeQuizzes || 0;
      dashboardData.currentState.quizzes.inactive = 
        dashboardData.currentState.quizzes.total - dashboardData.currentState.quizzes.active;
    }

    // Get orphaned quizzes
    const { data: allQuizzes, error: allQuizzesError } = await supabaseAdmin
      .from('vsk_quizzes')
      .select('id, title');

    const { data: referencedQuizzes, error: referencedQuizzesError } = await supabaseAdmin
      .from('vsk_podcast_episodes')
      .select('quiz_id')
      .not('quiz_id', 'is', null);

    if (allQuizzesError || referencedQuizzesError) {
      console.error('Error fetching quiz references:', { allQuizzesError, referencedQuizzesError });
    } else {
      const referencedQuizIds = new Set(referencedQuizzes?.map(ep => ep.quiz_id) || []);
      const orphanedQuizzes = allQuizzes?.filter(quiz => !referencedQuizIds.has(quiz.id)) || [];
      
      dashboardData.currentState.quizzes.orphaned = orphanedQuizzes.length;
      dashboardData.currentState.quizzes.orphanedList = 
        orphanedQuizzes.map(quiz => ({ id: quiz.id, title: quiz.title }));
    }

    // Get constraint information
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
      console.error('Error fetching constraint info:', constraintError);
    } else {
      dashboardData.currentState.constraints.constraintDetails = constraintInfo || [];
      dashboardData.currentState.constraints.foreignKeyExists = (constraintInfo || []).length > 0;
      
      // Check if constraint has CASCADE DELETE
      const constraintDef = constraintInfo?.[0]?.constraint_definition || '';
      dashboardData.currentState.constraints.cascadeDelete = 
        constraintDef.includes('ON DELETE CASCADE');
    }

    // Get column nullability
    const { data: columnInfo, error: columnError } = await supabaseAdmin
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

    if (columnError) {
      console.error('Error fetching column info:', columnError);
    } else {
      dashboardData.currentState.constraints.columnNullable = 
        columnInfo?.[0]?.is_nullable === 'YES';
    }

    // Analyze state and provide recommendations
    const hasEpisodesWithoutQuizzes = dashboardData.currentState.episodes.withoutQuizzes > 0;
    const hasOrphanedQuizzes = dashboardData.currentState.quizzes.orphaned > 0;
    const isColumnNullable = dashboardData.currentState.constraints.columnNullable;
    const hasCascadeDelete = dashboardData.currentState.constraints.cascadeDelete;

    // Determine system state
    if (!isColumnNullable && hasCascadeDelete && !hasEpisodesWithoutQuizzes) {
      dashboardData.systemStatus.postMigrationState = true;
      dashboardData.systemStatus.readyForMigration = false;
      dashboardData.availableOperations.suggestedNext = 'System is in post-migration state';
    } else if (hasEpisodesWithoutQuizzes || hasOrphanedQuizzes) {
      dashboardData.systemStatus.readyForMigration = false;
      dashboardData.availableOperations.suggestedNext = 'Run migration to fix relationship issues';
    } else {
      dashboardData.systemStatus.readyForMigration = true;
      dashboardData.availableOperations.suggestedNext = 'Ready for migration - run dry run first';
    }

    // Generate recommendations
    if (hasEpisodesWithoutQuizzes) {
      dashboardData.recommendations.actions.push(
        `Create ${dashboardData.currentState.episodes.withoutQuizzes} placeholder quizzes for episodes without them`
      );
    }

    if (hasOrphanedQuizzes) {
      dashboardData.recommendations.actions.push(
        `Handle ${dashboardData.currentState.quizzes.orphaned} orphaned quizzes (archive or associate)`
      );
    }

    if (isColumnNullable) {
      dashboardData.recommendations.actions.push('Make quiz_id column NOT NULL');
    }

    if (!hasCascadeDelete) {
      dashboardData.recommendations.actions.push('Update foreign key constraint to CASCADE DELETE');
    }

    // Generate warnings
    if (dashboardData.currentState.quizzes.inactive > 0) {
      dashboardData.recommendations.warnings.push(
        `${dashboardData.currentState.quizzes.inactive} quizzes are inactive`
      );
    }

    // Check for blockers
    if (!dashboardData.systemStatus.healthy) {
      dashboardData.recommendations.blockers.push('Database connection issues detected');
    }

    // Set operation availability
    dashboardData.availableOperations.canRunMigration = 
      dashboardData.systemStatus.healthy && !dashboardData.systemStatus.postMigrationState;
    
    dashboardData.availableOperations.canRollback = 
      dashboardData.systemStatus.postMigrationState;

    // Additional system health checks
    try {
      // Check if we can write to database
      const { error: writeTestError } = await supabaseAdmin
        .from('vsk_quizzes')
        .select('id')
        .limit(1);

      if (writeTestError) {
        dashboardData.systemStatus.healthy = false;
        dashboardData.recommendations.blockers.push('Database write permissions issue');
      }
    } catch (error) {
      dashboardData.systemStatus.healthy = false;
      dashboardData.recommendations.blockers.push('Database connection failed');
    }

    return res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
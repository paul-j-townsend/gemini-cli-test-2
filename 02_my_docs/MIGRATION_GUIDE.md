# Podcast-Quiz Refactoring Migration Guide

This guide explains how to use the comprehensive migration scripts to refactor the podcast-quiz relationship in the VetSidekick application.

## Overview

The migration refactors the relationship between podcast episodes and quizzes to ensure:
1. Every podcast episode has exactly one associated quiz
2. The relationship is enforced at the database level with constraints
3. Orphaned quizzes are handled appropriately
4. Data integrity is maintained throughout the process

## Migration Scripts

### 1. Pre-Migration Audit
**Endpoint:** `/api/audit-podcast-quiz-relationships`
**Method:** GET

Use this to understand the current state of your database before migration.

```bash
curl -X GET "http://localhost:3000/api/audit-podcast-quiz-relationships"
```

**Example Response:**
```json
{
  "summary": {
    "totalEpisodes": 10,
    "totalQuizzes": 8,
    "episodesWithoutQuizzes": 3,
    "quizzesWithoutEpisodes": 1,
    "sharedQuizzes": 0,
    "episodesWithQuizzes": 7
  },
  "recommendations": {
    "needsDefaultQuizzes": true,
    "needsOrphanedQuizCleanup": true,
    "needsOneToOneEnforcement": false,
    "readyForMigration": false
  }
}
```

### 2. Migration Execution
**Endpoint:** `/api/migrate-podcast-quiz-refactor`
**Method:** POST

This is the main migration script that performs the refactoring.

#### Dry Run (Recommended First)
```bash
curl -X POST "http://localhost:3000/api/migrate-podcast-quiz-refactor" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```

#### Actual Migration
```bash
curl -X POST "http://localhost:3000/api/migrate-podcast-quiz-refactor" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

#### Force Migration (Override Safety Checks)
```bash
curl -X POST "http://localhost:3000/api/migrate-podcast-quiz-refactor" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "forceExecute": true}'
```

### 3. Rollback
**Endpoint:** `/api/rollback-podcast-quiz-refactor`
**Method:** POST

Use this if you need to rollback the migration. Requires rollback data from the migration response.

#### Rollback Dry Run
```bash
curl -X POST "http://localhost:3000/api/rollback-podcast-quiz-refactor" \
  -H "Content-Type: application/json" \
  -d '{
    "rollbackData": {
      "createdQuizzes": ["quiz-id-1", "quiz-id-2"],
      "archivedQuizzes": ["quiz-id-3"],
      "originalConstraints": [...]
    },
    "dryRun": true
  }'
```

#### Actual Rollback
```bash
curl -X POST "http://localhost:3000/api/rollback-podcast-quiz-refactor" \
  -H "Content-Type: application/json" \
  -d '{
    "rollbackData": {
      "createdQuizzes": ["quiz-id-1", "quiz-id-2"],
      "archivedQuizzes": ["quiz-id-3"],
      "originalConstraints": [...]
    },
    "dryRun": false
  }'
```

### 4. Testing and Validation
**Endpoint:** `/api/test-migration-podcast-quiz`
**Method:** POST

Comprehensive test suite to validate the migration process.

#### Full Test Suite
```bash
curl -X POST "http://localhost:3000/api/test-migration-podcast-quiz" \
  -H "Content-Type: application/json" \
  -d '{"testType": "full", "includeRollback": false}'
```

#### Test with Rollback
```bash
curl -X POST "http://localhost:3000/api/test-migration-podcast-quiz" \
  -H "Content-Type: application/json" \
  -d '{"testType": "full", "includeRollback": true}'
```

## Migration Process

### Step 1: Pre-Migration Assessment
1. Run the audit endpoint to understand current state
2. Review the recommendations
3. Plan your migration strategy

### Step 2: Testing (Recommended)
1. Run the test suite to validate migration logic
2. Review test results and fix any issues
3. Optionally test with rollback enabled

### Step 3: Backup (Critical)
1. Create a database backup before proceeding
2. Ensure you have the rollback data ready
3. Test restore procedures

### Step 4: Migration Execution
1. Run migration in dry-run mode first
2. Review the planned changes
3. Execute the actual migration
4. **Save the rollback data** from the response

### Step 5: Validation
1. Run the audit endpoint again to verify results
2. Check application functionality
3. Monitor for any issues

### Step 6: Rollback (If Needed)
1. Use the rollback endpoint with saved rollback data
2. Verify rollback completed successfully
3. Address any issues before re-attempting migration

## What the Migration Does

### Phase 1: Pre-Migration Audit
- Counts episodes without quizzes
- Identifies orphaned quizzes
- Validates current constraint state
- Provides recommendations

### Phase 2: Safety Checks
- Validates database state
- Checks for existing quiz completions
- Ensures constraints can be safely updated

### Phase 3: Backup Creation
- Captures current constraint definitions
- Creates rollback data structure
- Prepares for safe rollback if needed

### Phase 4: Placeholder Quiz Creation
- Creates placeholder quizzes for episodes without them
- Titles: "Quiz for: [Episode Title]"
- Marked as inactive until content is added
- Links episodes to their new quizzes

### Phase 5: Orphaned Quiz Handling
- Archives quizzes not linked to any episode
- Preserves quizzes with existing user completions
- Adds archive notes to descriptions

### Phase 6: Constraint Updates
- Makes `quiz_id` column NOT NULL
- Updates foreign key constraint to CASCADE DELETE
- Ensures referential integrity

### Phase 7: Final Validation
- Verifies all episodes have quizzes
- Confirms constraint updates
- Validates data integrity

## Database Changes

### Before Migration
```sql
-- vsk_podcast_episodes table
quiz_id UUID NULL REFERENCES vsk_quizzes(id) ON DELETE SET NULL
```

### After Migration
```sql
-- vsk_podcast_episodes table
quiz_id UUID NOT NULL REFERENCES vsk_quizzes(id) ON DELETE CASCADE
```

## Error Handling

The migration includes comprehensive error handling:

- **Validation Errors**: Prevent migration if unsafe conditions exist
- **Constraint Errors**: Handle database constraint violations gracefully
- **Rollback Errors**: Provide detailed logging for rollback issues
- **Data Integrity**: Ensure no data loss during migration

## Logging

All operations are logged with:
- Timestamp
- Log level (info, warning, error, success)
- Detailed message
- Relevant data

Example log entry:
```json
{
  "timestamp": "2025-07-11T10:30:00.000Z",
  "level": "success",
  "message": "Created placeholder quiz for episode",
  "data": {
    "episodeId": "ep-123",
    "quizId": "quiz-456",
    "episodeTitle": "Veterinary Ethics"
  }
}
```

## Recovery Procedures

### If Migration Fails
1. Check the error logs for specific failure reasons
2. Use the rollback endpoint if partial migration occurred
3. Fix the underlying issue
4. Re-run migration with `forceExecute: true` if needed

### If Application Breaks
1. Immediate rollback using saved rollback data
2. Verify rollback completed successfully
3. Test application functionality
4. Plan corrective actions

### If Rollback Fails
1. Restore from database backup
2. Contact support with detailed error logs
3. Manual database repair may be required

## Best Practices

1. **Always run dry-run first**
2. **Create database backups**
3. **Test in development environment**
4. **Monitor application during migration**
5. **Keep rollback data safe**
6. **Validate results thoroughly**
7. **Document any custom changes**

## Support

If you encounter issues:
1. Check the detailed logs in the API response
2. Review the error messages and recommendations
3. Use the rollback functionality if needed
4. Contact support with log data if issues persist

## Example Complete Workflow

```bash
# 1. Check current state
curl -X GET "http://localhost:3000/api/audit-podcast-quiz-relationships"

# 2. Run test suite
curl -X POST "http://localhost:3000/api/test-migration-podcast-quiz" \
  -H "Content-Type: application/json" \
  -d '{"testType": "full"}'

# 3. Dry run migration
curl -X POST "http://localhost:3000/api/migrate-podcast-quiz-refactor" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'

# 4. Execute migration (save the response!)
curl -X POST "http://localhost:3000/api/migrate-podcast-quiz-refactor" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}' > migration-result.json

# 5. Verify results
curl -X GET "http://localhost:3000/api/audit-podcast-quiz-relationships"

# 6. If rollback needed (use data from migration-result.json)
curl -X POST "http://localhost:3000/api/rollback-podcast-quiz-refactor" \
  -H "Content-Type: application/json" \
  -d '{"rollbackData": {...}, "dryRun": false}'
```

This comprehensive migration system ensures safe, reliable refactoring of your podcast-quiz relationships with full rollback capability and extensive validation.
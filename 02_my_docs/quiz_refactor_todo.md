# Quiz Refactor TODO

## Pre-Implementation Analysis

### Current Admin Workflow Assessment
- [ ] Document existing podcast creation process step-by-step
- [ ] Document existing quiz creation process step-by-step
- [ ] Identify pain points in current separated workflow
- [ ] Map current user journey from podcast creation to quiz assignment
- [ ] Analyze time spent on current dual-creation process

### Current Technical State
- [ ] Inventory all API endpoints handling podcast/quiz relationships
- [ ] Document current database query patterns
- [ ] Identify components with conditional podcast/quiz logic
- [ ] Map current data flow between podcast and quiz systems
- [ ] Analyze current error handling for missing relationships

### Current Data Relationships
- [ ] Count existing podcast episodes without associated quizzes
- [ ] Count existing quizzes without associated podcast episodes
- [ ] Identify any many-to-many relationships that need resolution
- [ ] Document current foreign key constraints and their behavior
- [ ] Analyze current certificate generation dependencies

## Current State Analysis

### Database Schema Issues
- [ ] `vsk_quizzes` table has optional `podcast_id` field (nullable)
- [ ] `vsk_podcast_episodes` table has optional `quiz_id` field
- [ ] Inconsistent relationships: Some queries try to join with `vsk_quizzes`, others expect quiz data via different methods
- [ ] Mixed table naming: Some use `public.quizzes`, others use `vsk_quizzes`
- [ ] Virtual quiz system: Currently groups questions by category rather than proper quiz entities

### Current Workflow Problems
- [ ] Quizzes can exist without podcasts
- [ ] Podcasts can exist without quizzes
- [ ] Many-to-many relationship possibility (confusing)
- [ ] Certificate system assumes quiz completion but relationship unclear
- [ ] Admin interface has to handle optional relationships

## Database Schema Restructuring

### Changes
- [ ] Make `vsk_podcast_episodes.quiz_id` required (NOT NULL)
- [ ] Remove `vsk_quizzes.podcast_id` (redundant with above relationship)
- [ ] Add foreign key constraint with CASCADE DELETE
- [ ] Create migration to handle existing data
- [ ] Add database constraint to ensure one quiz per podcast
- [ ] Consider renaming tables to reflect unified concept (e.g., `vsk_podcast_quiz_entities`)

## Data Migration Strategy

### Handle existing data safely
- [ ] Audit current podcast episodes without quizzes
- [ ] Create placeholder/default quizzes for episodes missing them
- [ ] Audit quizzes without associated podcasts
- [ ] Either associate orphaned quizzes with episodes or archive them

## Application Layer Changes

### Type System Updates
- [ ] Update `PodcastEpisode` interface to make `quiz_id` required
- [ ] Remove optional `podcast_id` from `Quiz` interface
- [ ] Update database table interfaces to reflect new constraints
- [ ] Add type guards for validation

### Service Layer Updates
- [ ] Update `quizService` to always expect podcast association
- [ ] Remove `getQuizzesByPodcastId` (no longer needed)
- [ ] Update podcast fetching to always include quiz data
- [ ] Simplify quiz creation to require podcast context

### UI Component Updates
- [ ] Remove conditional quiz rendering in podcast components
- [ ] Always show quiz section for each podcast episode
- [ ] Update admin interface to create quiz with podcast episode
- [ ] Simplify quiz navigation (no more podcast-less quizzes)

## Certificate System Integration

### Leverage the new one-to-one relationship
- [ ] Certificates can now reliably show podcast episode title
- [ ] Simplify certificate API to use podcast-quiz relationship
- [ ] Update certificate component to fetch podcast details

## Admin Interface Unification

### Create unified podcast-quiz entity management
- [ ] Design single unified creation form for podcast+quiz entity
- [ ] Integrate quiz question creation within podcast creation workflow
- [ ] When creating podcast entity → automatically create associated quiz structure
- [ ] When deleting podcast entity → automatically delete associated quiz and questions
- [ ] Remove standalone quiz management (all quizzes are podcast entities)
- [ ] Add bulk operations for podcast-quiz entities (duplicate, archive, etc.)
- [ ] Create unified editing interface with tabbed sections for podcast/quiz details

## Technical Considerations

### Backup and Safety Strategy
- [ ] Create complete database backup before any migration
- [ ] Export current podcast and quiz data to JSON/CSV for external backup
- [ ] Test backup restoration process on development environment
- [ ] Document all environment variables and configurations
- [ ] Create rollback scripts for each migration step

### Rollback Plan
- [ ] Define exact rollback steps for each phase
- [ ] Create rollback scripts that can undo database changes
- [ ] Test rollback procedures on development environment
- [ ] Document rollback decision criteria and triggers
- [ ] Plan communication strategy for rollback scenario

### Testing Strategy
- [ ] Create comprehensive test cases for unified entity creation
- [ ] Test existing quiz completion workflows remain functional
- [ ] Validate certificate generation with unified entities
- [ ] Test admin interface workflows with real user scenarios
- [ ] Perform load testing with large numbers of podcast-quiz entities
- [ ] Test edge cases (duplicate titles, special characters, etc.)

### Performance Considerations
- [ ] Analyze query performance impact of new foreign key constraints
- [ ] Plan database indexes for optimal unified entity queries
- [ ] Consider caching strategies for frequently accessed podcast-quiz data
- [ ] Monitor API response times during and after migration
- [ ] Optimize database queries for unified entity operations

## Implementation Phases

### Phase 0: Pre-Migration Preparation
- [ ] Complete pre-implementation analysis
- [ ] Create development environment backup
- [ ] Set up monitoring and logging
- [ ] Prepare rollback procedures
- [ ] Create comprehensive test suite

### Phase 1: Database Migration (Critical)

#### Audit existing data
- [ ] Count podcast episodes without `quiz_id`
- [ ] Count quizzes without podcast association
- [ ] Identify data inconsistencies

#### Create migration script
- [ ] Create default quizzes for episodes missing them
- [ ] Associate orphaned quizzes with episodes or archive
- [ ] Add NOT NULL constraint to `vsk_podcast_episodes.quiz_id`
- [ ] Add CASCADE DELETE foreign key constraint
- [ ] Drop redundant `vsk_quizzes.podcast_id` column

### Phase 2: Type System & Service Layer

#### Update TypeScript interfaces
- [ ] Make `quiz_id` required in `PodcastEpisode`
- [ ] Remove `podcast_id` from `Quiz` interface
- [ ] Update all component props and API types

#### Refactor services
- [ ] Update podcast fetching to always include quiz
- [ ] Simplify quiz operations
- [ ] Update quiz completion tracking

### Phase 3: Component Refactoring

#### Update podcast components
- [ ] Remove conditional quiz rendering
- [ ] Always expect quiz data to be present
- [ ] Simplify player interface

#### Update admin interface
- [ ] Single podcast+quiz creation workflow
- [ ] Remove standalone quiz management
- [ ] Update episode editing to include quiz editing

### Phase 4: Admin Interface Implementation

#### Unified Creation Form Design
- [ ] Create wireframe/mockup for unified podcast-quiz creation form
- [ ] Design tabbed interface: "Podcast Details" | "Quiz Questions" | "Settings"
- [ ] Plan validation rules for unified form (required fields, constraints)
- [ ] Design quiz question creation workflow within podcast context
- [ ] Create preview functionality for unified entity before saving

#### Form Implementation
- [ ] Build unified creation form component with multiple sections
- [ ] Implement dynamic quiz question addition/removal within form
- [ ] Add real-time validation for both podcast and quiz data
- [ ] Create autosave functionality for complex form data
- [ ] Implement form progress indicator for multi-step creation

#### Bulk Operations
- [ ] Design bulk actions interface (duplicate, archive, publish, etc.)
- [ ] Implement duplicate podcast-quiz entity functionality
- [ ] Add bulk status updates for multiple entities
- [ ] Create bulk export functionality for backup/migration
- [ ] Implement bulk import for entity creation from templates

### Phase 5: Certificate & Progress Integration

#### Update certificate system
- [ ] Use podcast title in certificates
- [ ] Simplify certificate API calls

#### Update progress tracking
- [ ] Associate all completions with both quiz and podcast
- [ ] Simplify completion queries

## File Changes Required

### Database & Migration
- [ ] Create new migration file: `migrate-podcast-quiz-one-to-one.ts`
- [ ] Update `SUPABASE_QUIZ_SETUP.md` with new schema

### Type Definitions
- [ ] `src/types/database.ts` - Update interfaces
- [ ] Remove redundant type definitions across components

### Services
- [ ] `src/services/quizService.ts` - Simplify operations
- [ ] `src/services/quizCompletionService.ts` - Update tracking
- [ ] Create `src/services/podcastQuizService.ts` - Unified operations

### Components
- [ ] `src/components/PodcastPlayer.tsx` - Remove optional quiz logic
- [ ] `src/components/PodcastPlayerItem.tsx` - Simplify quiz integration
- [ ] `src/components/admin/PodcastManagement.tsx` - Unified creation
- [ ] `src/pages/player.tsx` - Always expect quiz

### API Endpoints
- [ ] `src/pages/api/podcast-admin/episodes.ts` - Always include quiz
- [ ] Update quiz-related endpoints to expect podcast context
- [ ] Simplify certificate API

## Edge Cases & Special Considerations

### Quiz Completion and Retry Scenarios
- [ ] **Multiple Quiz Attempts**: How to handle when users retry quizzes multiple times
- [ ] **Partial Completions**: Handle cases where users start but don't finish quizzes
- [ ] **Score History**: Preserve historical scores when migrating to unified entities
- [ ] **Progress Tracking**: Ensure user progress remains intact during migration
- [ ] **Certificate Regeneration**: Handle cases where certificates need to be regenerated

### Data Integrity Edge Cases
- [ ] **Duplicate Podcast Titles**: Handle podcasts with identical titles but different quizzes
- [ ] **Quiz Questions Without Answers**: Handle malformed quiz data during migration
- [ ] **Orphaned Completion Records**: Handle quiz completions that reference non-existent quizzes
- [ ] **Invalid Foreign Key References**: Handle broken relationships in existing data
- [ ] **Concurrent Modifications**: Handle race conditions during admin interface usage

### Certificate System Edge Cases
- [ ] **Podcast Title Changes**: Handle certificate validity when podcast titles are updated
- [ ] **Quiz Score Recalculation**: Handle certificate regeneration when quiz scoring changes
- [ ] **Retroactive Certificate Updates**: Handle bulk certificate updates for existing completions
- [ ] **Certificate Storage**: Handle existing certificate files during migration
- [ ] **CPD Point Calculation**: Ensure CPD points remain accurate with unified entities

### User Experience Edge Cases
- [ ] **Browser Session Persistence**: Handle admin form data across browser sessions
- [ ] **Network Connectivity**: Handle offline scenarios during form submission
- [ ] **Large Quiz Creation**: Handle performance with quizzes containing many questions
- [ ] **File Upload Failures**: Handle podcast audio/image upload failures gracefully
- [ ] **Validation Error Recovery**: Help users recover from complex validation errors

## Monitoring and Observability

### Migration Monitoring
- [ ] **Database Migration Logging**: Log each migration step with timestamps and results
- [ ] **Data Integrity Monitoring**: Track orphaned records and constraint violations
- [ ] **Performance Metrics**: Monitor query execution times during migration
- [ ] **Error Rate Tracking**: Monitor API error rates during and after migration
- [ ] **User Activity Monitoring**: Track admin interface usage patterns pre/post migration

### Post-Migration Observability
- [ ] **Entity Creation Metrics**: Track unified podcast-quiz entity creation success rates
- [ ] **Quiz Completion Tracking**: Monitor quiz completion rates with new unified system
- [ ] **Certificate Generation Monitoring**: Track certificate generation success/failure rates
- [ ] **Admin Interface Analytics**: Monitor admin workflow efficiency and user satisfaction
- [ ] **Performance Dashboards**: Create dashboards for ongoing system health monitoring

### User Feedback Collection
- [ ] **Admin User Surveys**: Collect feedback on new unified creation workflow
- [ ] **Error Reporting**: Implement enhanced error reporting for edge cases
- [ ] **Usage Analytics**: Track feature adoption and workflow completion rates
- [ ] **Support Ticket Analysis**: Monitor support requests related to unified entities
- [ ] **Performance Feedback**: Collect user feedback on system responsiveness

## Security Considerations

### Data Access and Permissions
- [ ] **Review Admin Permissions**: Ensure unified entity creation has appropriate access controls
- [ ] **Audit Trail Implementation**: Log all create/update/delete operations on unified entities
- [ ] **API Security**: Review API endpoints for proper authentication and authorization
- [ ] **Data Validation**: Implement comprehensive input validation for unified forms
- [ ] **SQL Injection Prevention**: Ensure all database queries use parameterized statements

### Migration Security
- [ ] **Backup Encryption**: Ensure all backups are encrypted at rest and in transit
- [ ] **Migration Logging**: Log all migration activities for security audit purposes
- [ ] **Access Control**: Limit migration execution to authorized personnel only
- [ ] **Rollback Security**: Ensure rollback procedures maintain data integrity and security
- [ ] **Environment Isolation**: Ensure migration testing doesn't affect production security

### Ongoing Security Maintenance
- [ ] **Regular Security Reviews**: Schedule periodic security assessments of unified system
- [ ] **Dependency Updates**: Monitor and update security dependencies regularly
- [ ] **Penetration Testing**: Include unified entity workflows in security testing
- [ ] **Compliance Verification**: Ensure unified system meets relevant compliance requirements
- [ ] **Incident Response**: Update incident response procedures for unified entity issues

## Success Criteria

- [ ] All podcast episodes have associated quizzes
- [ ] No orphaned quizzes exist
- [ ] Database constraints enforce one-to-one relationship
- [ ] Admin interface simplified to single workflow
- [ ] Certificate system reliably includes podcast information
- [ ] All TypeScript errors resolved
- [ ] Existing user progress preserved
- [ ] Unified entity creation workflow is intuitive and efficient
- [ ] System performance remains optimal with new unified structure
- [ ] All security considerations have been addressed and verified

---

## Change Log

### 2025-01-11
- **Created**: Initial TODO document extracted from `PODCAST_QUIZ_REFACTORING_PLAN.md`
- **Total Tasks**: 200+ tasks organized into phases and categories
- **Structure**: Organized by implementation phases and technical domains
- **Focus**: Unified podcast-quiz entity creation workflow
- **Coverage**: Database migration, application layer changes, admin interface, security, monitoring
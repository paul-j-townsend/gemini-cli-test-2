# Podcast/Quiz Refactoring Plan: One Quiz Per Podcast

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

## Refactoring Objectives

### 1. Database Schema Restructuring

**Goal**: Establish strict one-to-one relationship between podcasts and quizzes

**Changes**:
- [ ] Make `vsk_podcast_episodes.quiz_id` required (NOT NULL)
- [ ] Remove `vsk_quizzes.podcast_id` (redundant with above relationship)
- [ ] Add foreign key constraint with CASCADE DELETE
- [ ] Create migration to handle existing data
- [ ] Add database constraint to ensure one quiz per podcast

### 2. Data Migration Strategy

**Handle existing data safely**:
- [ ] Audit current podcast episodes without quizzes
- [ ] Create placeholder/default quizzes for episodes missing them
- [ ] Audit quizzes without associated podcasts
- [ ] Either associate orphaned quizzes with episodes or archive them

### 3. Application Layer Changes

#### Type System Updates

- [ ] Update `PodcastEpisode` interface to make `quiz_id` required
- [ ] Remove optional `podcast_id` from `Quiz` interface
- [ ] Update database table interfaces to reflect new constraints
- [ ] Add type guards for validation

#### Service Layer Updates

- [ ] Update `quizService` to always expect podcast association
- [ ] Remove `getQuizzesByPodcastId` (no longer needed)
- [ ] Update podcast fetching to always include quiz data
- [ ] Simplify quiz creation to require podcast context

#### UI Component Updates

- [ ] Remove conditional quiz rendering in podcast components
- [ ] Always show quiz section for each podcast episode
- [ ] Update admin interface to create quiz with podcast episode
- [ ] Simplify quiz navigation (no more podcast-less quizzes)

### 4. Certificate System Integration

**Leverage the new one-to-one relationship**:
- [ ] Certificates can now reliably show podcast episode title
- [ ] Simplify certificate API to use podcast-quiz relationship
- [ ] Update certificate component to fetch podcast details

### 5. Admin Interface Simplification

**Streamline management**:
- [ ] When creating podcast episode → automatically create associated quiz
- [ ] When deleting podcast episode → automatically delete associated quiz
- [ ] Single form for podcast+quiz creation
- [ ] Remove standalone quiz management (all quizzes tied to podcasts)

## Implementation Phases

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

### Phase 4: Certificate & Progress Integration

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

## Benefits of This Refactoring

- [ ] **Simplified Mental Model**: Every podcast has exactly one quiz
- [ ] **Reduced Complexity**: No more optional relationships to handle
- [ ] **Better Data Integrity**: Database constraints prevent orphaned records
- [ ] **Improved UX**: Users always know there's a quiz for each episode
- [ ] **Cleaner Code**: Remove conditional logic throughout the application
- [ ] **Better Certificates**: Can reliably include podcast information

## Risks & Mitigation

- [ ] **Data Loss Risk**: Comprehensive migration strategy with rollback plan
- [ ] **Breaking Changes**: Staged rollout with feature flags if needed
- [ ] **Admin Workflow Changes**: Update documentation and provide training
- [ ] **Type Errors**: Update all TypeScript gradually in phases

## Success Criteria

- [ ] All podcast episodes have associated quizzes
- [ ] No orphaned quizzes exist
- [ ] Database constraints enforce one-to-one relationship
- [ ] Admin interface simplified to single workflow
- [ ] Certificate system reliably includes podcast information
- [ ] All TypeScript errors resolved
- [ ] Existing user progress preserved

This refactoring will create a much cleaner, more maintainable system where the podcast-quiz relationship is clear and enforced.
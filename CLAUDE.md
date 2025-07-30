# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VetSidekick is a veterinary education platform built with Next.js 14, TypeScript, and Supabase. The application provides podcast-based continuing professional development (CPD) with interactive quizzes, user progress tracking, and gamification features.

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database migrations (Supabase)
# Migrations are in supabase/migrations/ and managed through Supabase CLI
```

## Architecture Overview

### Database Schema (Supabase)

- **Table Prefix**: All custom tables use `vsk_` prefix (e.g., `vsk_users`, `vsk_quizzes`)
- **Authentication**: Supabase Auth for user management
- **Storage**: Supabase Storage for audio files and images in separate buckets
- **Row Level Security (RLS)**: Enabled on all tables

### Key Database Tables

- `vsk_users` - User profiles and roles (super_admin, admin, editor, user, viewer)
- `vsk_quizzes` - Quiz metadata with learning outcomes and rationale fields
- `vsk_quiz_questions` - Questions with explanation, rationale, and learning_outcome
- `vsk_question_answers` - Multiple choice answers (A, B, C, D format)
- `vsk_quiz_completions` - User quiz attempts with detailed scoring
- `vsk_user_progress` - Aggregated user statistics and badges
- `vsk_podcast_episodes` - Podcast metadata with quiz associations
- `vsk_articles` - Educational articles

### Client Architecture

- **Supabase Clients**:
  - `supabase` (from `src/lib/supabase.ts`) - Client-side operations with RLS
  - `supabaseAdmin` (from `src/lib/supabase-admin.ts`) - Server-side operations bypassing RLS
- **Singleton Pattern**: Both clients use global singletons to survive HMR
- **Storage Keys**: Custom storage keys (`vsk-main-auth-v3`, `vsk-admin-auth-v3`) for session persistence

### Service Layer

- `quizCompletionService` - Handles quiz scoring, completion tracking, and progress updates
- `quizService` - CRUD operations for quizzes and questions
- `userService` - User management operations

### Type Safety

- Comprehensive TypeScript interfaces in `src/types/database.ts`
- Separate table interfaces (e.g., `UsersTable`) and application interfaces (e.g., `User`)
- Snake_case database columns mapped to camelCase in application layer

## Key Features & Implementation Notes

### Quiz System

- **Multiple Answer Support**: Questions can have multiple correct answers
- **Scoring**: Point-based system with percentage calculations
- **Learning Outcomes**: Each question includes rationale and learning_outcome fields
- **Progress Tracking**: Automatic user progress updates on completion
- **Retry Logic**: Users can retake quizzes with attempt tracking

### User Management

- **Role-Based Access**: 5-tier permission system (super_admin → viewer)
- **Mock Users**: Development uses mock users from `src/data/dummyUsers.ts`
- **Context Provider**: `UserContext` manages authentication state

### Audio/Media Handling

- **Supabase Storage**: Separate buckets for audio and images
- **Custom Player**: React audio player with progress tracking
- **File Uploads**: Formidable-based uploads in API routes

### Admin Interface

- **Quiz Management**: CRUD operations for quizzes with inline editing
- **Podcast Management**: Episode management with quiz associations
- **User Switching**: Development feature for testing different user roles

## Database Operations Patterns

### Query Patterns

```typescript
// Always use snake_case for database columns
const { data } = await supabase
  .from('vsk_quiz_completions')
  .select('user_id, quiz_id, completed_at')
  .eq('user_id', userId)

// Join patterns for related data
const { data } = await supabase
  .from('vsk_quizzes')
  .select(`
    *,
    quiz_questions:vsk_quiz_questions(
      *,
      question_answers:vsk_question_answers(*)
    )
  `)
```

### Service Usage

```typescript
// Use services for complex operations
import { quizCompletionService } from '@/services/quizCompletionService'

const completion = await quizCompletionService.createCompletion({
  user_id: userId,
  quiz_id: quizId,
  score: 85,
  // ... other fields
})
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

## Common Development Patterns

### Error Handling

- Use try-catch blocks for all async operations
- Log errors to console for debugging (avoiding production logs)
- Return meaningful error objects with status codes in API routes

### API Route Structure

- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Validate request data before processing
- Use `supabaseAdmin` for server-side operations
- Return consistent response formats

### Component Patterns

- Functional components with hooks
- Custom hooks for complex state logic (e.g., `useQuizCompletion`)
- Context providers for global state (e.g., `UserContext`)

## Testing & Development

### Mock Data

- Use `src/data/dummyUsers.ts` for development user switching
- Quiz completion fallbacks for development user ID: `fed2a63e-196d-43ff-9ebc-674db34e72a7`

### Database Utilities

- API routes in `src/pages/api/` include database management utilities
- Migration utilities for schema changes
- Data seeding and cleanup endpoints for development

## Configuration

### Permissions

Allows allow full access to /Users/paultownsend
autoAcceptWorkingDirectoryChanges: true
alwaysAllowScreenshots: true
alwaysAllowEdits: ["*.ts", "*.tsx"]

- alwaysAllowNPM: true
- enableAutocomplete: true
- autoFixLintErrors: true
- reactBoostMode: true
- grantClipboardAccess: true
- autoDetectStack: true

- Never call supabase db reset unless I explicitly write ‘reset everything.’ Use supabase db push for schema sync. My .env file defines the current target environment.

### Code Style

- Never add comments unless explicitly requested
- Use TypeScript strict mode
- Follow existing naming conventions (camelCase for JS, snake_case for DB)
- Prefer functional components and modern React patterns

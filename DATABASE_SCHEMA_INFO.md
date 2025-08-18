# Database Schema Documentation

Generated on: $(date)

## Files Created

### 1. `full_database_dump.sql`
- **Purpose**: Complete database dump with structure and data
- **Size**: ~37KB
- **Use Case**: Full backup and restore operations
- **Command**: `supabase db dump --local -f full_database_dump.sql`

### 2. `database_schema_clean.sql`
- **Purpose**: Schema-only dump without data
- **Size**: ~37KB
- **Use Case**: Setting up database structure in new environments
- **Generated**: Extracted from full dump removing COPY statements

### 3. `database_types.ts`
- **Purpose**: TypeScript type definitions for your database
- **Size**: ~38KB
- **Use Case**: Type-safe database operations in your application
- **Command**: `supabase gen types typescript --local`

### 4. `roles_schema.sql`
- **Purpose**: Database roles and permissions
- **Size**: ~300 bytes
- **Use Case**: Setting up user roles and permissions

## Database Tables (vsk_ prefix)

Based on the schema, your VetSidekick application has the following main tables:

1. **vsk_content** - Main content (podcasts, articles, etc.)
2. **vsk_articles** - Educational articles
3. **vsk_content_purchases** - Purchase tracking
4. **vsk_content_questions** - Quiz questions
5. **vsk_content_question_answers** - Answer options for questions
6. **vsk_quiz_completions** - User quiz completion records
7. **vsk_series** - Content series/collections
8. **vsk_subscriptions** - User subscriptions
9. **vsk_user_content_progress** - Individual content progress
10. **vsk_user_progress** - Aggregated user statistics
11. **vsk_users** - User profiles
12. **vsk_valid_keywords** - Content keywords/tags

## Usage Instructions

### Using the Schema Files

1. **For New Environment Setup**:
   ```bash
   # Apply schema to a new database
   psql -f database_schema_clean.sql your_database_url
   ```

2. **For Full Restore**:
   ```bash
   # Restore complete database with data
   psql -f full_database_dump.sql your_database_url
   ```

3. **For TypeScript Development**:
   ```typescript
   // Import types in your application
   import { Database } from './database_types'
   
   // Use with Supabase client
   const supabase = createClient<Database>(url, key)
   ```

### Updating Schema Files

To refresh the schema files when your database changes:

```bash
# Update full dump
supabase db dump --local -f full_database_dump.sql

# Update TypeScript types
supabase gen types typescript --local > database_types.ts

# Recreate clean schema
awk '
BEGIN { in_data = 0; }
/^COPY .* FROM stdin;$/ { in_data = 1; next; }
/^\\.$/ && in_data { in_data = 0; next; }
!in_data { print; }
' full_database_dump.sql > database_schema_clean.sql
```

## Environment-Specific Usage

### Development
- Use local database dump for development setup
- Apply schema with: `supabase db reset --db-url="postgresql://postgres:postgres@127.0.0.1:54322/postgres"`

### Staging/Production
- Use schema-only dump for clean environment setup
- Import data separately or use migration files

## Migration Workflow

1. Make changes to local database
2. Create migration: `supabase db diff --use-migra -f new_migration`
3. Apply to staging: `supabase db push --db-url="your_staging_url"`
4. Apply to production: `supabase db push --db-url="your_production_url"`
5. Update schema files: Run the commands above

## Security Notes

- Schema files are safe to commit (no sensitive data)
- Full dumps contain data - handle carefully
- Environment-specific URLs and keys are in .env files
- Use appropriate database URLs for each environment

## Next Steps

1. ✅ Schema files generated successfully
2. 🔄 Consider updating TypeScript types in `src/types/database.ts`
3. 📝 Document any custom database functions or triggers
4. 🔄 Set up automated schema updates in CI/CD pipeline
# Migrate Online Supabase to Local Docker

This guide will help you copy your online Supabase database to a local Docker instance.

## Prerequisites

1. **Supabase CLI installed** ✅ (already confirmed)
2. **Docker Desktop running**
3. **Your Supabase project credentials**

## Step 1: Get Your Project Information

From your `.env.local` file, you need:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- **Database Password** (from Supabase Dashboard > Settings > Database)

## Step 2: Export Your Online Database

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **Settings > Database**
3. Scroll down to **Database backups**
4. Click **Create backup** or download an existing backup
5. Download the backup file (`.sql` format)

### Option B: Using CLI (if you have database password)

```bash
# Replace with your actual values
export SUPABASE_PROJECT_REF="your-project-ref"  # from URL: https://your-project-ref.supabase.co
export DB_PASSWORD="your-database-password"

# Dump schema and data
supabase db dump \
  --db-url "postgresql://postgres.your-user:${DB_PASSWORD}@aws-0-eu-west-2.pooler.supabase.com:5432/postgres" \
  --file ./online-database-backup.sql
```

## Step 3: Start Local Supabase

```bash
# Start local Supabase (this will create Docker containers)
supabase start

# This will show you local URLs and keys:
# - API URL: http://localhost:54321
# - Database URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
```

## Step 4: Apply Your Existing Migrations

```bash
# Apply all existing migrations to local database
supabase db reset

# This applies all files in supabase/migrations/ to your local database
```

## Step 5: Import Your Data

### Option A: Import from backup file

```bash
# If you downloaded a backup file from dashboard
psql "postgresql://postgres:postgres@localhost:54322/postgres" < your-backup-file.sql
```

### Option B: Import using Supabase CLI

```bash
# If using CLI dump
psql "postgresql://postgres:postgres@localhost:54322/postgres" < online-database-backup.sql
```

### Option C: Manual data export/import

Create a script to copy specific tables:

```bash
# Create data export script
cat > export-data.sql << 'EOF'
-- Export specific tables you want to copy
COPY (SELECT * FROM vsk_users) TO '/tmp/vsk_users.csv' WITH CSV HEADER;
COPY (SELECT * FROM vsk_quizzes) TO '/tmp/vsk_quizzes.csv' WITH CSV HEADER;
COPY (SELECT * FROM vsk_podcast_episodes) TO '/tmp/vsk_podcast_episodes.csv' WITH CSV HEADER;
COPY (SELECT * FROM vsk_quiz_completions) TO '/tmp/vsk_quiz_completions.csv' WITH CSV HEADER;
-- Add more tables as needed
EOF
```

## Step 6: Update Environment Variables

Create a new `.env.local.development` file for local development:

```bash
# Local Supabase settings
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# These are the default local keys - they're safe to commit
```

## Step 7: Test Your Local Setup

```bash
# Start your Next.js app with local environment
npm run dev

# Test connection
curl http://localhost:3000/api/supabase-test
```

## Step 8: Storage Migration (Optional)

If you need to copy files from Supabase Storage:

```bash
# Create local storage buckets to match your online setup
# Go to http://localhost:54323 (Supabase Studio)
# Storage > Create bucket: 'audio'
# Storage > Create bucket: 'images'

# Download files from online storage and upload to local
# This would need to be done manually or with a custom script
```

## Troubleshooting

### Common Issues

1. **Docker not running**: Start Docker Desktop
2. **Port conflicts**: Check if ports 54321-54324 are available
3. **Migration errors**: Review migration files in `supabase/migrations/`
4. **Data import errors**: Check for constraint violations or missing dependencies

### Useful Commands

```bash
# Check local Supabase status
supabase status

# Stop local Supabase
supabase stop

# Reset local database (applies all migrations)
supabase db reset

# View local database in browser
open http://localhost:54323

# Connect to local database directly
psql "postgresql://postgres:postgres@localhost:54322/postgres"
```

## Next Steps

1. **Update your development workflow** to use local Supabase
2. **Create a script** to sync data periodically if needed
3. **Use production environment variables** for staging/production deployments
4. **Set up database seeding** with sample data for development

## Environment Switching

You can maintain both environments by using different env files:

```bash
# For local development
cp .env.local.development .env.local

# For production testing  
cp .env.local.production .env.local
```

# Podcast Enhancement Migration Guide

## Overview
This migration enhances the podcast episodes table with comprehensive content management features, including the new preview/full audio functionality, episode organization, publishing workflow, and SEO optimization.

## Migration: 013_enhance_podcast_episodes.sql

### What This Migration Adds

#### 🎵 **Audio Management**
- `full_audio_url` - Complete episode audio (unlocked after "Listen to Full Version")
- Existing `audio_url` becomes the preview/short version

#### 📊 **Episode Organization**
- `episode_number` - Episode number within season
- `season` - Season number (defaults to 1)
- `duration` - Episode duration in seconds

#### 🚀 **Publishing Workflow**
- `slug` - SEO-friendly URL slug
- `published` - Boolean flag for published status
- `featured` - Boolean flag for featured episodes

#### 📝 **Content Management**
- `category` - Episode category
- `tags` - Array of episode tags
- `show_notes` - Detailed episode content
- `transcript` - Episode transcript for accessibility

#### 🔍 **SEO & Metadata**
- `meta_title` - Custom SEO title
- `meta_description` - SEO description (160 chars)
- `file_size` - Audio file size in bytes

### Database Schema Changes

```sql
-- Add episode organization fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS episode_number INTEGER;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS season INTEGER DEFAULT 1;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS duration INTEGER; -- in seconds

-- Add publishing workflow fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add content organization fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add rich content fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS show_notes TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS full_audio_url TEXT;

-- Add SEO fields
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE vsk_podcast_episodes ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Create unique constraint on slug
ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT unique_podcast_slug UNIQUE (slug);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_slug ON vsk_podcast_episodes(slug);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published ON vsk_podcast_episodes(published);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_featured ON vsk_podcast_episodes(featured);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_category ON vsk_podcast_episodes(category);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_episode_number ON vsk_podcast_episodes(episode_number);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_season ON vsk_podcast_episodes(season);

-- Create composite index for episode ordering
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_season_episode ON vsk_podcast_episodes(season, episode_number);

-- Add check constraints for data integrity
ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT check_episode_number_positive 
    CHECK (episode_number IS NULL OR episode_number > 0);

ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT check_season_positive 
    CHECK (season IS NULL OR season > 0);

ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT check_duration_positive 
    CHECK (duration IS NULL OR duration > 0);

ALTER TABLE vsk_podcast_episodes ADD CONSTRAINT check_file_size_positive 
    CHECK (file_size IS NULL OR file_size > 0);

-- Update existing episodes to have default values
UPDATE vsk_podcast_episodes 
SET 
    published = (published_at IS NOT NULL),
    season = 1
WHERE published IS NULL OR season IS NULL;
```

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the entire contents of `supabase/migrations/013_enhance_podcast_episodes.sql`
5. Click **Run** to execute the migration

### Option 2: Via Migration API
```bash
# Check if migration is needed
curl -X POST http://localhost:3000/api/apply-migration

# This will tell you if the migration needs to be applied manually
```

### Option 3: Command Line (if Supabase CLI available)
```bash
supabase db reset
# or
supabase migration up
```

## New Features After Migration

### 🎵 **Preview/Full Audio Workflow**
- Users initially hear preview audio when clicking play
- "Listen to Full Version" button unlocks complete episode
- Quiz and Certificate buttons appear after accessing full version

### 📊 **Enhanced Admin Interface**
- Episode numbering (S1E5 format display)
- Season organization
- Duration tracking with MM:SS format
- Publishing workflow (draft/published states)
- Featured episode promotion
- Category and tag management
- Rich show notes editor
- SEO metadata fields

### 🔍 **Public Interface Improvements**
- Only published episodes show on public pages
- Episode organization and numbering
- Enhanced metadata for search engines
- Better content categorization

## Data Structure Examples

### Episode with Full Enhancement
```json
{
  "id": "uuid",
  "title": "Advanced Surgical Techniques",
  "description": "Comprehensive guide to modern surgical approaches",
  "audio_url": "https://storage/preview-episode-5.mp3",
  "full_audio_url": "https://storage/full-episode-5.mp3",
  "episode_number": 5,
  "season": 1,
  "duration": 3600,
  "slug": "advanced-surgical-techniques",
  "published": true,
  "featured": false,
  "category": "Surgery",
  "tags": ["surgery", "techniques", "advanced"],
  "show_notes": "Detailed episode content with links...",
  "meta_title": "Advanced Surgical Techniques - Vet Sidekick Podcast",
  "meta_description": "Learn cutting-edge surgical techniques from leading veterinary professionals in this comprehensive guide."
}
```

## Rollback Plan

If you need to rollback the migration:

```sql
-- Remove new columns (be careful - this will lose data!)
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS episode_number;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS season;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS duration;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS slug;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS published;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS featured;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS category;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS tags;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS show_notes;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS transcript;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS file_size;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS full_audio_url;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS meta_title;
ALTER TABLE vsk_podcast_episodes DROP COLUMN IF EXISTS meta_description;

-- Drop constraints and indexes
ALTER TABLE vsk_podcast_episodes DROP CONSTRAINT IF EXISTS unique_podcast_slug;
DROP INDEX IF EXISTS idx_podcast_episodes_slug;
DROP INDEX IF EXISTS idx_podcast_episodes_published;
DROP INDEX IF EXISTS idx_podcast_episodes_featured;
DROP INDEX IF EXISTS idx_podcast_episodes_category;
DROP INDEX IF EXISTS idx_podcast_episodes_episode_number;
DROP INDEX IF EXISTS idx_podcast_episodes_season;
DROP INDEX IF EXISTS idx_podcast_episodes_season_episode;
```

## Verification

After applying the migration, verify it worked:

```sql
-- Check if all new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vsk_podcast_episodes' 
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'vsk_podcast_episodes';

-- Test published episodes query
SELECT id, title, published, episode_number, season, duration 
FROM vsk_podcast_episodes 
WHERE published = true 
ORDER BY season, episode_number;
```

## Post-Migration Steps

1. **Test Admin Interface**: Verify all new fields appear in podcast management
2. **Test Public Interface**: Confirm preview/full audio workflow works
3. **Upload Test Content**: Create an episode with both preview and full audio
4. **Verify Publishing**: Test draft/published workflow
5. **Check SEO**: Verify slug generation and meta fields

## Benefits After Migration

- ✅ **Enhanced User Experience**: Preview/full audio workflow
- ✅ **Better Content Management**: Episode organization and publishing workflow
- ✅ **SEO Optimization**: Proper slugs and metadata
- ✅ **Professional Features**: Season/episode numbering, categories, tags
- ✅ **Accessibility**: Transcript support
- ✅ **Performance**: Proper indexing for fast queries
- ✅ **Scalability**: Support for multiple seasons and advanced content management

---

**Migration File Location**: `supabase/migrations/013_enhance_podcast_episodes.sql`

**Applied Changes**: All admin interfaces, API endpoints, and public components have been updated to support the new fields and functionality.
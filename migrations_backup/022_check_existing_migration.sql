-- Check which podcast enhancement fields already exist
-- Run this to see what's already applied before running the full migration

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vsk_podcast_episodes' 
    AND column_name IN (
        'episode_number', 'season', 'duration', 'slug', 'published', 'featured',
        'category', 'tags', 'show_notes', 'transcript', 'file_size', 
        'full_audio_url', 'meta_title', 'meta_description'
    )
ORDER BY column_name;

-- Check existing constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'vsk_podcast_episodes'
    AND constraint_name LIKE '%podcast%';

-- Check existing indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'vsk_podcast_episodes'
    AND indexname LIKE '%podcast%';
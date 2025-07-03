# Supabase Storage Setup Guide

## Current Issues to Fix

1. ❌ **Missing bucket**: `podcast-thumbnails` bucket doesn't exist (404 error)
2. ❌ **Duplicate uploads**: Audio uploads failing with 409 "already exists" error
3. ❌ **Storage policies**: Need RLS policies for uploads

## Required Storage Buckets

### 1. Audio Bucket (`audio`)
- **Purpose**: Store podcast audio files
- **Path structure**: `podcasts/YYYY-MM-DD_filename.mp3`
- **Status**: ✅ Exists (based on successful uploads)

### 2. Images Bucket (`images`) 
- **Purpose**: Store all images including podcast thumbnails
- **Path structure**: `podcast-thumbnails/YYYY-MM-DD_filename.webp` (folder within images bucket)
- **Status**: ✅ Exists (podcast-thumbnails folder within this bucket)

## Step-by-Step Setup

### Step 1: Verify Bucket Structure

✅ No action needed - buckets already exist:
- `audio` bucket (for MP3 files)
- `images` bucket (contains `podcast-thumbnails` folder)

The folder structure should be:
```
images/
  └── podcast-thumbnails/
      └── YYYY-MM-DD_filename.webp
```

### Step 2: Set Up Storage Policies

Apply these RLS policies in Supabase Dashboard > Storage > Policies:

#### For `audio` bucket:

**Policy 1: Allow public access for reading**
```sql
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'audio');
```

**Policy 2: Allow authenticated uploads**
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audio');
```

**Policy 3: Allow authenticated updates/overwrite**
```sql
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'audio');
```

**Policy 4: Allow authenticated deletes**
```sql
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'audio');
```

#### For `images` bucket:

**Policy 1: Allow public access for reading**
```sql
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

**Policy 2: Allow authenticated uploads**
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');
```

**Policy 3: Allow authenticated updates/overwrite**
```sql
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');
```

**Policy 4: Allow authenticated deletes**
```sql
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'images');
```

### Step 3: Alternative Simplified Policies (Recommended)

If the above policies are too restrictive, use these broader policies:

#### For both buckets (`audio` and `images`):

```sql
-- Allow all operations for service role (bypass RLS)
CREATE POLICY "Service role can do anything" ON storage.objects
USING (auth.role() = 'service_role');

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Authenticated update" ON storage.objects
FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated delete" ON storage.objects
FOR DELETE TO authenticated USING (true);
```

### Step 4: Verify Setup

Test the setup by running this API endpoint: `/api/test-bucket`

Expected response should show both buckets:
```json
{
  "buckets": [
    { "id": "audio", "name": "audio", "public": true },
    { "id": "images", "name": "images", "public": true }
  ]
}
```

## Code Changes Needed

### 1. Fix Duplicate Upload Issue

Update `src/pages/api/upload-audio.ts` to allow overwrites:

```typescript
// Change line ~55 from:
upsert: false,
// To:
upsert: true,
```

### 2. Add Better Error Handling

Both upload APIs should handle storage errors more gracefully.

## Environment Variables Required

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing Commands

After setup, test with:

1. **Test bucket access**: `GET /api/test-bucket`
2. **Upload audio**: Use admin form to upload MP3
3. **Upload image**: Use admin form to upload thumbnail
4. **Check storage**: Go to Supabase Dashboard > Storage to verify files

## Troubleshooting

- **404 Bucket not found**: Bucket doesn't exist - create it
- **409 Duplicate**: File already exists - set `upsert: true`
- **403 Forbidden**: RLS policy issue - check/update policies
- **500 Internal**: Check service role key and permissions

---

**Note**: After making these changes, restart your development server with `npm run dev` to clear any cached errors. 
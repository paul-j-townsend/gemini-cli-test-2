# Supabase Storage Setup for Article Images

This document explains how to set up Supabase Storage for handling article images.

## Prerequisites

1. A Supabase project with the `vsk_articles` table created
2. Supabase environment variables configured in `.env.local`

## Setup Steps

### 1. Create Storage Bucket

Run the migration script `supabase/migrations/002_create_storage_bucket.sql` in your Supabase SQL editor, or manually create the bucket:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Click "New bucket"
4. Name it `images`
5. Set it as a **Public** bucket
6. Click "Create bucket"

### 2. Configure Bucket Policies

The bucket needs proper Row Level Security (RLS) policies. Run the migration script `supabase/migrations/003_fix_storage_policies.sql` in your Supabase SQL editor, or manually set up policies:

1. In the Storage section, click on the `images` bucket
2. Go to the "Policies" tab
3. Create the following policies:

**For Uploads (INSERT):**
- Policy name: `Allow public uploads`
- Allowed operation: `INSERT`
- Policy definition: `true` or `bucket_id = 'images'`

**For Downloads (SELECT):**
- Policy name: `Allow public downloads`
- Allowed operation: `SELECT`
- Policy definition: `true` or `bucket_id = 'images'`

## Troubleshooting

### "Unauthorized: new row violates row-level security policy" Error

This error occurs when the storage bucket doesn't have the proper RLS policies. To fix:

1. Go to your Supabase SQL editor
2. Run the script in `supabase/migrations/003_fix_storage_policies.sql`
3. Or manually create the policies as described above

### Image Upload Fails Silently

Check the browser console for detailed error messages. Common issues:
- Bucket doesn't exist
- File size too large (default limit is 50MB)
- Invalid file type
- Network issues

## Usage in the Application

The admin page (`/admin`) includes image upload functionality:

1. When creating or editing an article, click "Choose File" under "Article Image"
2. Select an image file (JPEG, PNG, GIF, WebP supported)
3. The image will be uploaded when you save the article
4. The image URL will be stored in the `image_url` field of the article

## File Organization

Uploaded images are stored in the `article-images/` folder within the bucket with random filenames to avoid conflicts. 
# Debugging Analysis: /api/user-content-progress 500 Error

## Problem
The user is experiencing 500 Internal Server Error when trying to mark quiz completion via the `/api/user-content-progress` endpoint.

## Files Analyzed

### 1. API Endpoint: `/src/pages/api/user-content-progress.ts`
- **Structure**: Handles both GET and POST requests
- **POST Actions**: `listen_progress`, `quiz_completed`, `report_downloaded`, `certificate_downloaded`
- **Error Handling**: Catches errors and logs them with `console.error`
- **For quiz completion**: Calls `userContentProgressService.markQuizCompleted(userId, contentId)`

### 2. Service: `/src/services/userContentProgressService.ts`
- **markQuizCompleted Method**: Uses `supabaseAdmin.from('vsk_user_content_progress').upsert()`
- **Error Handling**: Catches and logs Supabase errors
- **Returns**: `null` on error, `UserContentProgress` on success

### 3. Database Table: `vsk_user_content_progress`
- **Migration**: Created in migration `036_create_user_content_progress.sql`
- **Structure**: Has all required columns (user_id, content_id, quiz_completed, quiz_completed_at)
- **Constraints**: UNIQUE(user_id, content_id), proper RLS policies
- **Service Role Policy**: Should allow admin operations

## Potential Issues & Solutions

### Issue 1: Database Table Not Applied
**Problem**: Migration 036 may not have been run
**Solution**: Check if table exists and run migration if needed

### Issue 2: Supabase Connection Issues
**Problem**: Service role key or URL misconfiguration
**Solution**: Verify environment variables and test connection

### Issue 3: Row Level Security (RLS) Conflicts
**Problem**: Service role policies might not be working correctly
**Solution**: Check RLS policies and service role authentication

### Issue 4: Data Type Mismatches
**Problem**: UUID strings vs UUID types in database
**Solution**: Ensure proper UUID format and casting

### Issue 5: Missing Required Fields
**Problem**: API request missing userId, contentId, or action
**Solution**: Validate request payload structure

## Debugging Steps

### Step 1: Check Server Logs
Run the development server and look for console.error outputs:
```bash
npm run dev
```
Then trigger the API call and check terminal output.

### Step 2: Test Database Connection
Run the debug script to test database connectivity:
```bash
node debug-api.js
```

### Step 3: Test API Endpoint
With server running, test the API call:
```bash
node test-api-call.js
```

### Step 4: Check Migration Status
Verify if the table exists in Supabase dashboard or via SQL query.

### Step 5: Review Error Logs
Check Next.js development server console for specific error messages.

## Expected Error Messages

Based on the code structure, likely error messages:
1. **"Table 'vsk_user_content_progress' doesn't exist"** - Migration not run
2. **"Permission denied"** - RLS policy issues
3. **"Invalid UUID format"** - Data type issues
4. **"Missing required parameters"** - Request validation issues
5. **"Connection failed"** - Supabase configuration issues

## Immediate Actions Required

1. **Start development server** and monitor console logs
2. **Make a test API call** to trigger the error
3. **Check the exact error message** in server logs
4. **Verify database table exists** in Supabase
5. **Test service role permissions** independently

## Common Fixes

### If Table Missing:
```sql
-- Run migration 036 manually in Supabase SQL editor
-- Or use Supabase CLI: supabase db push
```

### If RLS Issues:
```sql
-- Check service role policy exists
SELECT * FROM pg_policies WHERE tablename = 'vsk_user_content_progress';
```

### If Connection Issues:
```javascript
// Test in Supabase dashboard or verify .env.local values
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
```

## Next Steps

1. **Run development server** to capture live error logs
2. **Execute test scripts** to isolate the issue
3. **Check Supabase dashboard** for table existence and policies
4. **Review migration history** to ensure all changes applied
5. **Test with different user IDs** to rule out data-specific issues
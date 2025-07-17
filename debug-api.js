#!/usr/bin/env node

// Debug script to test the user-content-progress API endpoint
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment Variables:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SERVICE_KEY available:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  }
});

async function testDatabase() {
  try {
    console.log('\n=== Testing Database Connection ===');
    
    // Test 1: Check if the table exists
    console.log('1. Checking if vsk_user_content_progress table exists...');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'vsk_user_content_progress');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }
    
    if (tables.length === 0) {
      console.error('❌ Table vsk_user_content_progress does not exist');
      return;
    }
    
    console.log('✅ Table vsk_user_content_progress exists');
    
    // Test 2: Check table structure
    console.log('\n2. Checking table structure...');
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'vsk_user_content_progress');
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return;
    }
    
    console.log('Table columns:', columns);
    
    // Test 3: Test simple select
    console.log('\n3. Testing simple select...');
    const { data: selectData, error: selectError } = await supabaseAdmin
      .from('vsk_user_content_progress')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Error selecting from table:', selectError);
      return;
    }
    
    console.log('✅ Simple select works. Records found:', selectData.length);
    
    // Test 4: Test upsert operation
    console.log('\n4. Testing upsert operation...');
    const testUserId = 'test-user-id';
    const testContentId = 'test-content-id';
    
    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from('vsk_user_content_progress')
      .upsert({
        user_id: testUserId,
        content_id: testContentId,
        quiz_completed: true,
        quiz_completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (upsertError) {
      console.error('❌ Error upserting data:', upsertError);
      return;
    }
    
    console.log('✅ Upsert operation successful:', upsertData);
    
    // Test 5: Clean up test data
    console.log('\n5. Cleaning up test data...');
    const { error: deleteError } = await supabaseAdmin
      .from('vsk_user_content_progress')
      .delete()
      .eq('user_id', testUserId)
      .eq('content_id', testContentId);
    
    if (deleteError) {
      console.error('❌ Error deleting test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n=== All tests completed ===');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testDatabase().then(() => {
  console.log('\nDebug script completed');
}).catch(error => {
  console.error('Debug script error:', error);
});
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTable() {
  try {
    console.log('Checking if table exists...');
    
    // Check if table exists
    const { data: existingTable } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'vsk_user_content_progress')
      .maybeSingle();

    if (existingTable) {
      console.log('✅ Table already exists!');
      return;
    }

    console.log('Creating table...');

    // Create the table
    const createSQL = `
      CREATE TABLE vsk_user_content_progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        content_id UUID NOT NULL,
        has_listened BOOLEAN DEFAULT false,
        listen_progress_percentage INTEGER DEFAULT 0,
        listened_at TIMESTAMP WITH TIME ZONE,
        quiz_completed BOOLEAN DEFAULT false,
        quiz_completed_at TIMESTAMP WITH TIME ZONE,
        report_downloaded BOOLEAN DEFAULT false,
        report_downloaded_at TIMESTAMP WITH TIME ZONE,
        certificate_downloaded BOOLEAN DEFAULT false,
        certificate_downloaded_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, content_id)
      );

      ALTER TABLE vsk_user_content_progress ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Service role access" ON vsk_user_content_progress
        FOR ALL USING (auth.role() = 'service_role');
    `;

    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createSQL 
    });

    if (error) {
      console.error('❌ Error creating table:', error);
      return;
    }

    console.log('✅ Table created successfully!');

    // Test insert
    console.log('Testing table with sample data...');
    const { data: testData, error: testError } = await supabase
      .from('vsk_user_content_progress')
      .insert({
        user_id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
        content_id: '022b3131-5889-4496-85ee-df43059f5461',
        quiz_completed: true,
        quiz_completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (testError) {
      console.error('❌ Error testing table:', testError);
      return;
    }

    console.log('✅ Test insert successful:', testData);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createTable();
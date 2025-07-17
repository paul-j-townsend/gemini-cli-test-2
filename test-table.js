// Quick test to check if the table exists
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTable() {
  try {
    console.log('Testing table existence...');
    
    // Try to query the table
    const { data, error } = await supabase
      .from('vsk_user_content_progress')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Table query error:', error);
      
      if (error.message.includes('does not exist')) {
        console.log('Table does not exist - need to create it');
        // Try to create the table
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS vsk_user_content_progress (
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
          `
        });
        
        if (createError) {
          console.error('Error creating table:', createError);
        } else {
          console.log('Table created successfully');
        }
      }
    } else {
      console.log('Table exists and is accessible');
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

testTable();
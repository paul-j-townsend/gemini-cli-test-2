import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-service-key'

// Global singleton to prevent multiple instances, persists through HMR
const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdminInstance?: SupabaseClient
}

// Create admin client singleton
export const supabaseAdmin = globalForSupabaseAdmin.supabaseAdminInstance ?? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    storageKey: 'vsk-admin-simple',
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  }
});

// Store singleton in all environments to prevent multiple instances
globalForSupabaseAdmin.supabaseAdminInstance = supabaseAdmin;
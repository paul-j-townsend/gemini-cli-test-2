import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Global singleton to prevent multiple instances, persists through HMR
const globalForSupabase = globalThis as unknown as {
  supabaseInstance?: any
}

// Create singleton client to prevent multiple GoTrueClient instances
export const supabase = globalForSupabase.supabaseInstance ?? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'vsk-main-auth-v3', // Fixed key as per CLAUDE.md
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Store singleton in all environments to prevent multiple instances
globalForSupabase.supabaseInstance = supabase;
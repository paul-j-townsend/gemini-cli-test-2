import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig, getStorageKey } from './env'

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig()

// Global singleton to prevent multiple instances, persists through HMR
const globalForSupabase = globalThis as unknown as {
  supabaseInstance?: any
}

// Create singleton client to prevent multiple GoTrueClient instances
if (!globalForSupabase.supabaseInstance) {
  globalForSupabase.supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: getStorageKey('main-auth-v3'), // Environment-specific storage key
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}

export const supabase = globalForSupabase.supabaseInstance;
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig, getStorageKey } from './env'

const { url: supabaseUrl, serviceRoleKey: supabaseServiceKey } = getSupabaseConfig()

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

// Global singleton to prevent multiple instances, persists through HMR
const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdminInstance?: SupabaseClient
}

// Create admin client singleton
if (!globalForSupabaseAdmin.supabaseAdminInstance) {
  globalForSupabaseAdmin.supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      storageKey: getStorageKey('admin-simple'),
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    }
  });
}

export const supabaseAdmin = globalForSupabaseAdmin.supabaseAdminInstance;
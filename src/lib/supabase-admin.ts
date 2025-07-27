import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-service-key'

// Use a global key that survives HMR and avoids conflicts with main client
const GLOBAL_ADMIN_KEY = '__VSK_SUPABASE_ADMIN_CLIENT_FINAL__'

// Store the singleton instance
let supabaseAdminInstance: SupabaseClient | null = null

// Get the singleton instance with lazy initialization
const getSupabaseAdminInstance = (): SupabaseClient => {
  // Check if we already have a client instance
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const globalContext = typeof window !== 'undefined' ? window : globalThis
  
  // Check if we already have a client stored globally
  if ((globalContext as any)[GLOBAL_ADMIN_KEY]) {
    supabaseAdminInstance = (globalContext as any)[GLOBAL_ADMIN_KEY]
    return supabaseAdminInstance
  }

  // Create admin client for server-side use only
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      storageKey: 'vsk-admin-auth-v4', // Different storage key to avoid conflicts
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'vsk-admin-client'
      }
    }
  })

  // Store in both local variable and global context to survive HMR
  supabaseAdminInstance = client
  ;(globalContext as any)[GLOBAL_ADMIN_KEY] = client
  
  return client
}

// Export a getter function instead of a direct instance
export const supabaseAdmin = getSupabaseAdminInstance()
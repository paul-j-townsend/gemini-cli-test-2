import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-service-key'

// Use a global key that survives HMR
const GLOBAL_KEY = '__VSK_SUPABASE_ADMIN_CLIENT_FINAL__'

// Get the singleton instance with lazy initialization
const getSupabaseAdminInstance = (): SupabaseClient => {
  const globalContext = typeof window !== 'undefined' ? window : globalThis
  
  // Check if we already have a client stored globally
  if ((globalContext as any)[GLOBAL_KEY]) {
    return (globalContext as any)[GLOBAL_KEY]
  }

  // Create new client only if none exists
  console.log('Creating new Supabase admin client')
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: 'vsk-admin-final-v2',
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'vsk-admin-client'
      }
    }
  })

  // Store in global context to survive HMR
  ;(globalContext as any)[GLOBAL_KEY] = client
  
  return client
}

// Export a getter function instead of a direct instance
export const supabaseAdmin = getSupabaseAdminInstance()
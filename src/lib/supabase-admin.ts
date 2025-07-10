import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-service-key'

// Use a global key that survives HMR
const GLOBAL_KEY = '__VSK_SUPABASE_ADMIN_CLIENT_FINAL__'

// Store the singleton instance
let supabaseAdminInstance: SupabaseClient | null = null

// Get the singleton instance with lazy initialization
const getSupabaseAdminInstance = (): SupabaseClient => {
  // Only create admin client server-side
  if (typeof window !== 'undefined') {
    throw new Error('Supabase admin client should only be used server-side')
  }

  // Check if we already have a client instance
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const globalContext = globalThis
  
  // Check if we already have a client stored globally
  if ((globalContext as any)[GLOBAL_KEY]) {
    supabaseAdminInstance = (globalContext as any)[GLOBAL_KEY]
    return supabaseAdminInstance
  }

  // Create new client only if none exists
  console.log('Creating new Supabase admin client')
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      // Remove storageKey to avoid conflicts with main client
    },
    global: {
      headers: {
        'X-Client-Info': 'vsk-admin-client'
      }
    }
  })

  // Store in both local variable and global context to survive HMR
  supabaseAdminInstance = client
  ;(globalContext as any)[GLOBAL_KEY] = client
  
  return client
}

// Export a function to get the admin instance on demand
export const getSupabaseAdmin = () => getSupabaseAdminInstance()

// Export a lazy-loaded admin client that only initializes server-side
export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined') {
    // Return a proxy that throws helpful errors on client-side
    return new Proxy({} as SupabaseClient, {
      get() {
        throw new Error('Supabase admin client can only be used server-side')
      }
    })
  }
  return getSupabaseAdminInstance()
})()
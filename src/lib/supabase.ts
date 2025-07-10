import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Use a global key that survives HMR
const GLOBAL_KEY = '__VSK_SUPABASE_MAIN_CLIENT_FINAL__'

// Store the singleton instance
let supabaseInstance: SupabaseClient | null = null

// Get the singleton instance with lazy initialization
const getSupabaseInstance = (): SupabaseClient => {
  // Check if we already have a client instance
  if (supabaseInstance) {
    return supabaseInstance
  }

  const globalContext = typeof window !== 'undefined' ? window : globalThis
  
  // Check if we already have a client stored globally
  if ((globalContext as any)[GLOBAL_KEY]) {
    supabaseInstance = (globalContext as any)[GLOBAL_KEY]
    return supabaseInstance
  }

  // Create new client only if none exists
  console.log('Creating new Supabase main client')
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'vsk-main-auth-v4', // Main client storage key
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'vsk-main-client'
      }
    }
  })

  // Store in both local variable and global context to survive HMR
  supabaseInstance = client
  ;(globalContext as any)[GLOBAL_KEY] = client
  
  return client
}

// Export a getter function instead of a direct instance
export const supabase = getSupabaseInstance()
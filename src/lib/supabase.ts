import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create client with unique storage key to prevent conflicts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: `vsk-auth-${Date.now()}`, // Unique key to prevent conflicts
    autoRefreshToken: false, // Disable to reduce instance creation
    persistSession: false,   // Disable to reduce instance creation
    detectSessionInUrl: false // Disable to reduce instance creation
  }
})
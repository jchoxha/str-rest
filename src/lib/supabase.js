import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The app is usable for local development only once these are set (see
// .env.example / SUPABASE_SETUP.md). We expose `isSupabaseConfigured` so the UI
// can show a clear setup message instead of throwing on a missing client.
export const isSupabaseConfigured = Boolean(url && anonKey)

// When unconfigured we still create a client against harmless placeholder
// values so imports don't crash; any real call will simply fail and the UI
// guards on `isSupabaseConfigured` before making one.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

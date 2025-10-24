/**
 * Supabase Client Singleton - Prevents multiple client instances
 * Fixes: Multiple GoTrueClient instances detected error
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create new instance
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'X-Client-Info': 'medicine-website',
      },
    },
  });

  return supabaseInstance;
}

/**
 * Get Supabase client for server-side operations (with service role key)
 */
export function getSupabaseServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Reset client instance (for testing or logout)
 */
export function resetSupabaseClient(): void {
  if (supabaseInstance) {
    // Sign out and clear session
    supabaseInstance.auth.signOut();
    supabaseInstance = null;
  }
}

// Export default client
export const supabase = getSupabaseClient();

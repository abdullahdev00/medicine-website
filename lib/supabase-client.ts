import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Create a single instance of Supabase client
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

// For server-side operations with service role
let supabaseServiceClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseServiceClient() {
  if (!supabaseServiceClient) {
    supabaseServiceClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return supabaseServiceClient;
}

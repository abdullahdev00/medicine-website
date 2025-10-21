import { createClient } from '@supabase/supabase-js';
import { db } from './db/client';
import { sql } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Email validation regex - only Gmail and Outlook
export const ALLOWED_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com|live\.com)$/i;

export const validateEmail = (email: string): boolean => {
  return ALLOWED_EMAIL_REGEX.test(email);
};

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user', 
  BUYER = 'buyer',
  PARTNER = 'partner'
}

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
  // Validate email domain
  if (!validateEmail(email)) {
    throw new Error('Only Gmail and Outlook emails are allowed');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: UserRole.USER
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserRole = async (userId: string): Promise<UserRole> => {
  // Check if admin
  const adminResult = await db.execute(sql`
    SELECT id FROM admins WHERE id = ${userId} AND is_active = true
  `);
  if (adminResult.length > 0) return UserRole.ADMIN;

  // Check if partner
  const partnerResult = await db.execute(sql`
    SELECT id FROM partners WHERE user_id = ${userId} AND status = 'active'
  `);
  if (partnerResult.length > 0) return UserRole.PARTNER;

  // Check user metadata or default to USER
  const userResult = await db.execute(sql`
    SELECT id FROM users WHERE id = ${userId}
  `);
  
  return userResult.length > 0 ? UserRole.USER : UserRole.BUYER;
};

'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable email link detection for OTP flow
    flowType: 'implicit' // Change to implicit for OTP
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

// Client-side auth helper functions (no database access)
export const signUp = async (email: string, password: string, fullName: string) => {
  // Validate email domain
  if (!validateEmail(email)) {
    throw new Error('Only Gmail and Outlook emails are allowed');
  }

  // Use regular signUp method with password, but disable email redirect
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: UserRole.USER
      },
      // Don't redirect, we'll handle OTP manually
      emailRedirectTo: undefined
    }
  });

  if (error) throw error;
  return data;
};

// OTP Verification function
export const verifyOTP = async (email: string, otp: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'signup' // Use 'signup' type for signUp flow
  });

  if (error) throw error;
  return data;
};

// Resend OTP function
export const resendOTP = async (email: string) => {
  // Use resend method for signup OTP
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email
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

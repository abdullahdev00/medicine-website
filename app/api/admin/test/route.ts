import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Testing admin login for:', email);
    
    // Step 1: Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, encrypted_password')
      .eq('email', email)
      .single();

    console.log('Auth user found:', !!authUser, authError?.message);

    if (!authUser) {
      return NextResponse.json({ step: 1, error: 'User not found in auth.users' });
    }

    // Step 2: Test password verification
    const { data: passwordValid, error: passwordError } = await supabase
      .rpc('verify_password', {
        password: password,
        encrypted_password: authUser.encrypted_password
      });

    console.log('Password valid:', passwordValid, passwordError?.message);

    if (!passwordValid) {
      return NextResponse.json({ step: 2, error: 'Password verification failed', passwordError });
    }

    // Step 3: Check admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', authUser.id)
      .eq('is_active', true)
      .single();

    console.log('Admin user found:', !!adminUser, adminError?.message);

    if (!adminUser) {
      return NextResponse.json({ step: 3, error: 'Admin user not found', adminError });
    }

    return NextResponse.json({
      success: true,
      authUser: { id: authUser.id, email: authUser.email },
      adminUser: { role: adminUser.role, is_active: adminUser.is_active }
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

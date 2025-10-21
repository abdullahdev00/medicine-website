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
    
    console.log('Simple admin login attempt:', { email });
    
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Use raw SQL to check user and admin status
    const { data: result, error } = await supabase.rpc('admin_login_check', {
      p_email: email,
      p_password: password
    });

    console.log('Admin login check result:', { result, error });

    if (error) {
      console.error('Admin login error:', error);
      return NextResponse.json(
        { message: "Login failed", error: error.message },
        { status: 500 }
      );
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials or not an admin" },
        { status: 401 }
      );
    }

    const adminData = result[0];

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', adminData.user_id);

    // Return admin user data
    return NextResponse.json({
      id: adminData.user_id,
      email: adminData.email,
      role: adminData.role,
      permissions: adminData.permissions,
      department: adminData.department,
      access_level: adminData.access_level,
      full_name: adminData.full_name || 'Admin User',
      isAdmin: true,
      token: Buffer.from(`${adminData.user_id}:${Date.now()}`).toString('base64'),
    });
  } catch (error: any) {
    console.error('Simple admin login error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

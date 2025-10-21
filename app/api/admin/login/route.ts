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
    
    console.log('Admin login attempt:', { email, passwordLength: password?.length });
    
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Hardcoded admin credentials check for now
    // Since we know the admin user exists with these credentials
    if (email === 'adminmedicine@gmail.com' && password === 'Admin123!') {
      console.log('Admin credentials matched');
      
      // Get admin user details from database
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', '11111111-2222-3333-4444-555555555555')
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        console.log('Admin user not found in database:', adminError);
        return NextResponse.json(
          { message: "Admin user not configured properly" },
          { status: 500 }
        );
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', '11111111-2222-3333-4444-555555555555');

      // Return admin user data
      return NextResponse.json({
        id: '11111111-2222-3333-4444-555555555555',
        email: 'adminmedicine@gmail.com',
        role: adminUser.role,
        permissions: adminUser.permissions,
        department: adminUser.department,
        access_level: adminUser.access_level,
        full_name: 'Medicine Store Admin',
        isAdmin: true,
        token: Buffer.from(`11111111-2222-3333-4444-555555555555:${Date.now()}`).toString('base64'),
      });
    } else {
      console.log('Invalid credentials provided');
      return NextResponse.json(
        { 
          message: "Invalid credentials",
          debug: {
            step: 'credential_check',
            email,
            error: 'Invalid email or password'
          }
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();
    const { userId, email, fullName } = await request.json();
    
    if (!userId || !email) {
      return NextResponse.json(
        { message: "User ID and email are required" },
        { status: 400 }
      );
    }

    // Check if email is whitelisted
    const { data: whitelist, error: whitelistError } = await supabase
      .from('admin_whitelist')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (whitelistError || !whitelist) {
      console.error('Email not whitelisted:', email);
      return NextResponse.json(
        { message: "This email is not authorized to create an admin account" },
        { status: 403 }
      );
    }

    // Mark whitelist entry as used
    const updateData: any = { 
      used: true, 
      used_at: new Date().toISOString() 
    };
    await supabase
      .from('admin_whitelist')
      .update(updateData)
      .eq('id', (whitelist as any).id);

    // Add to admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role: 'admin', // Default role, can be changed to super_admin later
        permissions: [
          "manage_products", 
          "manage_orders", 
          "manage_users", 
          "view_analytics", 
          "manage_payments"
        ],
        is_active: true,
        department: 'Administration',
        access_level: 'standard',
        created_at: new Date().toISOString(),
        last_login_at: null
      } as any)
      .select()
      .single();

    if (adminError) {
      console.error('Error creating admin user:', adminError);
      // Don't fail if admin record already exists
      if (adminError.code !== '23505') { // Duplicate key error
        throw adminError;
      }
    }

    // Also create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        phone_number: null,
        whatsapp_number: null,
        profile_completed: false,
        created_at: new Date().toISOString()
      } as any);

    if (profileError && profileError.code !== '23505') {
      console.error('Error creating user profile:', profileError);
    }

    // Create entry in public.users if it exists
    const { error: publicUserError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || 'Admin User',
        password: '', // Password handled by Auth
        created_at: new Date().toISOString()
      } as any);

    if (publicUserError && publicUserError.code !== '23505') {
      console.error('Error creating public user:', publicUserError);
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      adminUser: adminUser
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to create admin user",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

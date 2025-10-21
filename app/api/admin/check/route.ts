import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json(
        { message: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ 
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
        role: (adminUser as any).role,
        permissions: (adminUser as any).permissions,
        department: (adminUser as any).department,
        access_level: (adminUser as any).access_level,
      }
    });
  } catch (error: any) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user from Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
    if (authError || !authUser.user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    // Get user profile data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    
    // Get affiliate data
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', id)
      .single();
    
    // Combine auth and profile data
    const userData = {
      id: authUser.user.id,
      email: authUser.user.email,
      fullName: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0],
      phoneNumber: profile?.phone_number || null,
      whatsappNumber: profile?.whatsapp_number || null,
      profileCompleted: profile?.profile_completed || false,
      affiliateCode: affiliate?.affiliate_code || null,
      walletBalance: affiliate?.wallet_balance || "0.00",
      totalEarnings: affiliate?.total_earnings || "0.00",
      pendingEarnings: affiliate?.pending_earnings || "0.00",
      createdAt: authUser.user.created_at,
    };
    
    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to get user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Update user metadata in Supabase Auth if needed
    if (body.fullName) {
      await supabase.auth.admin.updateUserById(id, {
        user_metadata: { full_name: body.fullName }
      });
    }
    
    // Update profile data if provided
    if (body.phoneNumber || body.whatsappNumber) {
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: id,
          phone_number: body.phoneNumber,
          whatsapp_number: body.whatsappNumber,
          profile_completed: true,
          updated_at: new Date().toISOString()
        });
    }
    
    // Update affiliate data if provided
    if (body.walletBalance !== undefined || body.affiliateCode) {
      await supabase
        .from('affiliates')
        .upsert({
          user_id: id,
          affiliate_code: body.affiliateCode,
          wallet_balance: body.walletBalance,
          updated_at: new Date().toISOString()
        });
    }
    
    // Return updated user data
    const updatedUserResponse = await GET(request, { params });
    return updatedUserResponse;
    
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get profile data from request first
    const profileData = await request.json();
    
    console.log('📝 Received profile data:', profileData);

    // Get current user from Supabase Auth
    const authHeader = request.headers.get('authorization');
    let currentUser;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      currentUser = user;
      
      if (error) {
        console.log('⚠️ Auth token error:', error.message);
      }
    }

    // Fallback to userId from request body
    if (!currentUser && profileData.userId) {
      console.log('🔄 Using userId from request body as fallback:', profileData.userId);
      // Verify user exists in auth.users
      const { data: authUser } = await supabase.auth.admin.getUserById(profileData.userId);
      currentUser = authUser.user;
    }

    if (!currentUser) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('✅ Authenticated user:', currentUser.id);

    // Insert/Update user profile in user_profiles table
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    const profilePayload = {
      user_id: currentUser.id,
      phone_number: profileData.phoneNumber,
      whatsapp_number: profileData.whatsappNumber,
      address: profileData.address,
      city: profileData.city,
      province: profileData.province,
      postal_code: profileData.postalCode,
      first_name: currentUser.user_metadata?.full_name?.split(' ')[0] || currentUser.email?.split('@')[0],
      profile_completed: true,
      email_verified: true,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profilePayload)
        .eq('user_id', currentUser.id)
        .select()
        .single();
      
      result = { data, error };
      console.log('🔄 Updated existing profile');
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({ ...profilePayload, created_at: new Date().toISOString() })
        .select()
        .single();
      
      result = { data, error };
      console.log('✨ Created new profile');
    }

    if (result.error) {
      console.error('❌ Database error:', result.error);
      return NextResponse.json(
        { message: "Failed to save profile", error: result.error.message },
        { status: 500 }
      );
    }

    console.log('💾 Profile saved successfully:', result.data);

    return NextResponse.json({
      message: "Profile completed successfully",
      profile: result.data,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]
      }
    });

  } catch (error: any) {
    console.error('❌ Complete profile API error:', error);
    return NextResponse.json(
      { message: "Failed to complete profile", error: error.message },
      { status: 500 }
    );
  }
}

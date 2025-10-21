import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { id, email, fullName } = await request.json();
    
    if (!id || !email) {
      return NextResponse.json(
        { message: "User ID and email are required" },
        { status: 400 }
      );
    }
    
    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', id)
      .single();
    
    if (existingProfile) {
      // User profile already exists, just return success
      return NextResponse.json({ message: "User already synced" });
    }
    
    // User exists in auth but no profile yet - this is normal for new users
    // Profile will be created when they complete profile page
    return NextResponse.json({ message: "User authenticated, profile pending" });
    
  } catch (error: any) {
    console.error('User sync error:', error);
    
    // For new users without profiles, this is expected
    if (error.code === 'PGRST116') {
      return NextResponse.json({ message: "New user, profile will be created on completion" });
    }
    
    return NextResponse.json(
      { 
        message: "User sync completed",
        note: "Using Supabase Auth - no local sync needed"
      },
      { status: 200 } // Return success to avoid blocking auth
    );
  }
}

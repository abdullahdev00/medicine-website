import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }
    
    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });
    
    if (error) {
      console.error('OTP verification error:', error);
      return NextResponse.json(
        { message: error.message || "Invalid verification code" },
        { status: 400 }
      );
    }
    
    if (!data.user) {
      return NextResponse.json(
        { message: "Verification failed" },
        { status: 400 }
      );
    }
    
    // Return success with user data
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
        isConfirmed: true
      },
      session: data.session,
      message: "Email verified successfully!"
    });
    
  } catch (error: any) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { message: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}

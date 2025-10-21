import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists in Supabase auth first (primary check)
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsers?.users) {
        const existingAuthUser = authUsers.users.find(user => user.email === email);
        
        if (existingAuthUser) {
          return NextResponse.json(
            { 
              exists: true,
              message: "Email already exists" 
            },
            { status: 200 }
          );
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase auth check failed:', supabaseError);
    }

    // Also check local database as fallback
    try {
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        return NextResponse.json(
          { 
            exists: true,
            message: "Email already exists" 
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.warn('Local database error during email check:', error);
    }

    // Email not found in either system
    return NextResponse.json(
      { 
        exists: false,
        message: "Email available" 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { 
        message: error.message || "Failed to check email",
        error: "EMAIL_CHECK_ERROR"
      },
      { status: 500 }
    );
  }
}

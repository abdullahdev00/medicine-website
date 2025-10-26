import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      phoneNumber, 
      whatsappNumber, 
      address, 
      city, 
      province, 
      postalCode,
      referredBy 
    } = body;
    
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Update existing profile (should already exist from signup)
    await db.execute(sql`
      UPDATE user_profiles 
      SET 
        phone_number = ${phoneNumber || null},
        whatsapp_number = ${whatsappNumber || null},
        profile_completed = true,
        updated_at = NOW()
      WHERE user_id = ${userId}
    `);
    
    // Generate affiliate code if not exists
    const affiliateCheck = await db.execute(sql`
      SELECT * FROM affiliates WHERE user_id = ${userId}
    `);
    
    if ((affiliateCheck as any[]).length === 0) {
      const affiliateCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await db.execute(sql`
        INSERT INTO affiliates (
          user_id,
          affiliate_code,
          referred_by,
          wallet_balance,
          total_earnings,
          pending_earnings,
          is_active,
          created_at,
          updated_at
        ) VALUES (
          ${userId},
          ${affiliateCode},
          ${referredBy || null},
          0.00,
          0.00,
          0.00,
          true,
          NOW(),
          NOW()
        )
      `);
    }
    
    // Get user data from Supabase Auth
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    // Update user metadata to mark profile as completed
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...user.user_metadata,
          profile_completed: true
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: "Profile completed successfully!",
      user: {
        id: userId,
        email: user.email,
        fullName: user.user_metadata?.full_name,
        phoneNumber,
        profileCompleted: true
      }
    });
    
  } catch (error: any) {
    console.error('Complete profile API error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to complete profile" },
      { status: 500 }
    );
  }
}

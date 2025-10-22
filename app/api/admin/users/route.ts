import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from "@/lib/admin-middleware";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  walletBalance: number;
  isPartner: boolean;
  status: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdmin();
    
    // Get search params for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Optimized query - fetch all data in single efficient query
    let users: UserData[] = [];
    let total = 0;
    
    try {
      const usersResult = await db.execute(sql`
        WITH user_wallets AS (
          SELECT 
            user_id,
            SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) as wallet_balance
          FROM wallet_transactions
          GROUP BY user_id
        ),
        user_partners AS (
          SELECT 
            user_id,
            business_name,
            status as partner_status,
            commission_rate
          FROM partners
        ),
        user_profiles_data AS (
          SELECT 
            user_id,
            phone_number,
            whatsapp_number,
            profile_completed
          FROM user_profiles
        )
        SELECT 
          au.id,
          au.email,
          au.raw_user_meta_data->>'full_name' as full_name,
          au.created_at,
          au.last_sign_in_at,
          au.email_confirmed_at,
          COALESCE(upd.phone_number, '') as phone_number,
          COALESCE(upd.whatsapp_number, '') as whatsapp_number,
          COALESCE(upd.profile_completed, false) as profile_completed,
          COALESCE(uw.wallet_balance, 0) as wallet_balance,
          up.business_name,
          up.partner_status,
          CASE 
            WHEN up.partner_status = 'active' THEN true
            ELSE false
          END as is_partner,
          CASE
            WHEN au.email_confirmed_at IS NOT NULL THEN 'active'
            WHEN au.banned_until IS NOT NULL THEN 'banned'
            ELSE 'pending'
          END as status
        FROM auth.users au
        LEFT JOIN user_profiles_data upd ON au.id = upd.user_id
        LEFT JOIN user_wallets uw ON au.id = uw.user_id
        LEFT JOIN user_partners up ON au.id = up.user_id
        WHERE 1=1
        ${search ? sql`AND (
          LOWER(au.email) LIKE ${`%${search.toLowerCase()}%`} OR
          LOWER(au.raw_user_meta_data->>'full_name') LIKE ${`%${search.toLowerCase()}%`} OR
          upd.phone_number LIKE ${`%${search}%`}
        )` : sql``}
        ORDER BY au.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `);
      
      // Format the response - usersResult is the actual array
      users = (usersResult as any[]).map((user: any) => ({
        id: user.id,
        fullName: user.full_name || user.email?.split('@')[0] || 'N/A',
        email: user.email || 'N/A',
        phoneNumber: user.phone_number || 'N/A',
        walletBalance: Number(user.wallet_balance || 0),
        isPartner: user.is_partner || false,
        status: user.status || 'pending',
        createdAt: user.created_at,
      }));
      
      // Get total count
      const totalCountResult = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM auth.users au
        ${search ? sql`
          LEFT JOIN user_profiles up ON au.id = up.user_id
          WHERE 
            LOWER(au.email) LIKE ${`%${search.toLowerCase()}%`} OR
            LOWER(au.raw_user_meta_data->>'full_name') LIKE ${`%${search.toLowerCase()}%`} OR
            up.phone_number LIKE ${`%${search}%`}
        ` : sql``}
      `);
      
      total = Number((totalCountResult as any[])[0]?.count || 0);
    } catch (queryError) {
      console.error("Query error:", queryError);
      // Return empty if query fails
    }
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin users error:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

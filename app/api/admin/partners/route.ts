import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { partners, orders } from "@/shared/schema";
import { verifyAdmin } from "@/lib/admin-middleware";
import { desc, eq, sql, and } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

interface PartnerData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  businessName: string;
  businessType: string;
  status: string;
  commissionRate: number;
  totalSales: number;
  totalOrders: number;
  totalCommissions: number;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdmin();
    
    // Get search params for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;
    
    // Build query with filters using Drizzle ORM
    let conditions = [];
    
    if (status) {
      conditions.push(eq(partners.status, status as any));
    }
    
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      conditions.push(
        sql`LOWER(${partners.businessName}) LIKE ${searchPattern}`
      );
    }
    
    // Build main query
    const query = db
      .select({
        id: partners.id,
        userId: partners.userId,
        businessName: partners.businessName,
        businessType: partners.businessType,
        status: partners.status,
        commissionRate: partners.commissionRate,
        totalSales: partners.totalSales,
        createdAt: partners.createdAt,
        totalOrders: sql<number>`0`,  // Placeholder since orders don't have affiliate tracking
        totalCommissions: sql<number>`0`,  // Placeholder
      })
      .from(partners);
    
    // Apply conditions if any
    const finalQuery = conditions.length > 0
      ? query.where(and(...conditions))
      : query;
    
    // Execute query with pagination
    const allPartners = await finalQuery
      .orderBy(desc(partners.createdAt))
      .limit(limit)
      .offset(offset)
      .catch(() => []); // Return empty array if query fails
    
    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(partners);
    
    const finalCountQuery = conditions.length > 0
      ? countQuery.where(and(...conditions))
      : countQuery;
    
    const totalResultArray = await finalCountQuery.catch(() => []);
    const totalResult = totalResultArray?.[0];
    
    // Create Supabase admin client to fetch user info
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get unique user IDs from partners
    const userIds = [...new Set(allPartners.map(partner => partner.userId).filter(Boolean))];
    
    // Fetch user info from auth.users
    const userMap = new Map();
    if (userIds.length > 0) {
      try {
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        if (authUsers && authUsers.users) {
          authUsers.users.forEach(user => {
            if (userIds.includes(user.id)) {
              userMap.set(user.id, {
                email: user.email,
                fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'N/A',
                phone: user.phone
              });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
    
    return NextResponse.json({
      partners: allPartners.map(partner => {
        const userInfo = userMap.get(partner.userId) || {};
        return {
          ...partner,
          userName: userInfo.fullName || 'N/A',
          userEmail: userInfo.email || 'N/A',
          userPhone: userInfo.phone || 'N/A',
          commissionRate: Number(partner.commissionRate),
          totalSales: Number(partner.totalSales),
          totalOrders: Number(partner.totalOrders || 0),
          totalCommissions: Number(partner.totalCommissions || 0),
        };
      }),
      pagination: {
        page,
        limit,
        total: totalResult?.count || 0,
        totalPages: Math.ceil((totalResult?.count || 0) / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin partners error:", error);
    return NextResponse.json({ message: "Failed to fetch partners" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders } from "@/shared/schema";
import { verifyAdmin } from "@/lib/admin-middleware";
import { desc, eq, sql, and, gte, lte, or } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

interface OrderData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  products: any[];
  totalPrice: number;
  deliveryAddress: any;
  paymentMethod: string;
  status: string;
  createdAt: string;
  expectedDelivery: string;
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
    const userId = searchParams.get("userId") || "";
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const offset = (page - 1) * limit;
    
    // Build query with filters using Drizzle ORM
    let conditions = [];
    
    if (status) {
      conditions.push(eq(orders.status, status));
    }
    
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }
    
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      conditions.push(
        sql`LOWER(${orders.id}::text) LIKE ${searchPattern}`
      );
    }
    
    if (startDate) {
      conditions.push(gte(orders.createdAt, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(orders.createdAt, new Date(endDate)));
    }
    
    // Build main query
    const query = db
      .select({
        id: orders.id,
        userId: orders.userId,
        products: orders.products,
        totalPrice: orders.totalPrice,
        deliveryAddress: orders.deliveryAddress,
        paymentMethod: orders.paymentMethod,
        paidFromWallet: orders.paidFromWallet,
        status: orders.status,
        createdAt: orders.createdAt,
        expectedDelivery: orders.expectedDelivery,
      })
      .from(orders);
    
    // Apply conditions if any
    const finalQuery = conditions.length > 0
      ? query.where(and(...conditions))
      : query;
    
    // Execute query with pagination
    const allOrders = await finalQuery
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)
      .catch(() => []); // Return empty array if query fails
    
    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders);
    
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
    
    // Get unique user IDs from orders
    const userIds = [...new Set(allOrders.map(order => order.userId).filter(Boolean))];
    
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
      orders: allOrders.map(order => {
        const userInfo = userMap.get(order.userId) || {};
        return {
          ...order,
          userName: userInfo.fullName || 'N/A',
          userEmail: userInfo.email || 'N/A',
          userPhone: userInfo.phone || 'N/A',
          totalPrice: Number(order.totalPrice),
          paidFromWallet: Number(order.paidFromWallet || 0),
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
    console.error("Admin orders error:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

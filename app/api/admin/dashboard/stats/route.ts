import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, orders, paymentRequests } from "@/shared/schema";
import { verifyAdmin } from "@/lib/admin-middleware";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdmin();
    
    // Get counts using optimized queries with error handling
    const userCountArray = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .catch(() => []);
    const userCount = userCountArray?.[0];
    
    const orderCountArray = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .catch(() => []);
    const orderCount = orderCountArray?.[0];
    
    // Get revenue from delivered orders
    const revenueResultArray = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${orders.totalPrice}), 0)::numeric` 
      })
      .from(orders)
      .where(eq(orders.status, "delivered"))
      .catch(() => []);
    const revenueResult = revenueResultArray?.[0];
    
    // Get pending counts
    const pendingOrderCountArray = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "pending"))
      .catch(() => []);
    const pendingOrderCount = pendingOrderCountArray?.[0];
    
    const pendingPaymentCountArray = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(paymentRequests)
      .where(eq(paymentRequests.status, "pending"))
      .catch(() => []);
    const pendingPaymentCount = pendingPaymentCountArray?.[0];
    
    // Get recent orders with user info
    const recentOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
        totalPrice: orders.totalPrice,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        userName: users.fullName,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(10)
      .catch(() => []); // Return empty array if query fails
    
    return NextResponse.json({
      totalUsers: userCount?.count || 0,
      totalOrders: orderCount?.count || 0,
      totalRevenue: Number(revenueResult?.total || 0),
      pendingOrders: pendingOrderCount?.count || 0,
      pendingPayments: pendingPaymentCount?.count || 0,
      recentOrders: recentOrders.map(order => ({
        ...order,
        totalPrice: Number(order.totalPrice),
      })),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 });
  }
}

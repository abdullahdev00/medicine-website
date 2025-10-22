import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { paymentRequests } from "@/shared/schema";
import { verifyAdmin } from "@/lib/admin-middleware";
import { desc, eq, sql, and } from "drizzle-orm";

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
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let conditions = [];
    
    if (status) {
      conditions.push(eq(paymentRequests.status, status as any));
    }
    
    if (userId) {
      conditions.push(eq(paymentRequests.userId, userId));
    }
    
    // Build main query without user join (users table doesn't exist)
    const query = db
      .select({
        id: paymentRequests.id,
        userId: paymentRequests.userId,
        type: paymentRequests.type,
        amount: paymentRequests.amount,
        status: paymentRequests.status,
        paymentMethod: paymentRequests.paymentMethod,
        receiptUrl: paymentRequests.receiptUrl,
        rejectionReason: paymentRequests.rejectionReason,
        adminNotes: paymentRequests.adminNotes,
        orderId: paymentRequests.orderId,
        orderData: paymentRequests.orderData,
        paymentAccountId: paymentRequests.paymentAccountId,
        createdAt: paymentRequests.createdAt,
        updatedAt: paymentRequests.updatedAt,
      })
      .from(paymentRequests);
    
    // Build the final query with conditions
    const finalQuery = conditions.length > 0
      ? query.where(and(...conditions))
      : query;
    
    // Execute query with pagination
    const allRequests = await finalQuery
      .orderBy(desc(paymentRequests.createdAt))
      .limit(limit)
      .offset(offset)
      .catch(() => []); // Return empty array if table doesn't exist or query fails
    
    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(paymentRequests);
    
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    
    const totalResultArray = await countQuery.catch(() => []);
    const totalResult = totalResultArray?.[0];
    
    return NextResponse.json({
      requests: allRequests.map(request => ({
        ...request,
        amount: Number(request.amount),
      })),
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
    console.error("Admin payment requests error:", error);
    return NextResponse.json({ message: "Failed to fetch payment requests" }, { status: 500 });
  }
}

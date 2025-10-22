import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { userPaymentAccounts, users, paymentRequests } from "@/shared/schema";
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
    const userId = searchParams.get("userId") || "";
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(userPaymentAccounts.userId, userId));
    }
    
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${userPaymentAccounts.accountName}) LIKE ${searchPattern} 
        OR LOWER(${userPaymentAccounts.raastId}) LIKE ${searchPattern})`
      );
    }
    
    // Build main query with user info and withdrawal stats
    const query = db
      .select({
        id: userPaymentAccounts.id,
        userId: userPaymentAccounts.userId,
        userName: users.fullName,
        userEmail: users.email,
        accountName: userPaymentAccounts.accountName,
        raastId: userPaymentAccounts.raastId,
        isDefault: userPaymentAccounts.isDefault,
        createdAt: userPaymentAccounts.createdAt,
        totalWithdrawals: sql<number>`(
          SELECT COALESCE(SUM(${paymentRequests.amount}), 0)::numeric 
          FROM ${paymentRequests} 
          WHERE ${paymentRequests.userId} = ${userPaymentAccounts.userId}
          AND ${paymentRequests.status} = 'completed'
        )`,
        pendingWithdrawals: sql<number>`(
          SELECT COALESCE(SUM(${paymentRequests.amount}), 0)::numeric 
          FROM ${paymentRequests} 
          WHERE ${paymentRequests.userId} = ${userPaymentAccounts.userId}
          AND ${paymentRequests.status} = 'pending'
        )`,
      })
      .from(userPaymentAccounts)
      .leftJoin(users, eq(userPaymentAccounts.userId, users.id));
    
    // Build the final query with conditions
    const finalQuery = conditions.length > 0
      ? query.where(and(...conditions))
      : query;
    
    // Execute query with pagination
    const allAccounts = await finalQuery
      .orderBy(desc(userPaymentAccounts.createdAt))
      .limit(limit)
      .offset(offset)
      .catch(() => []); // Return empty array if table doesn't exist or query fails
    
    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(userPaymentAccounts);
    
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    
    const totalResultArray = await countQuery.catch(() => []);
    const totalResult = totalResultArray?.[0];
    
    return NextResponse.json({
      accounts: allAccounts.map(account => ({
        ...account,
        totalWithdrawals: Number(account.totalWithdrawals),
        pendingWithdrawals: Number(account.pendingWithdrawals),
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
    console.error("Admin payment accounts error:", error);
    return NextResponse.json({ message: "Failed to fetch payment accounts" }, { status: 500 });
  }
}

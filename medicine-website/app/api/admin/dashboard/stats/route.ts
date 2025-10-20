import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const users = await storage.getAllUsers();
    const orders = await storage.getAllOrders();
    const paymentRequests = await storage.getAllPaymentRequests();
    
    const totalRevenue = orders
      .filter(o => o.status === "delivered")
      .reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
    
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const pendingPayments = paymentRequests.filter(p => p.status === "pending").length;
    
    return NextResponse.json({
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      pendingPayments,
      recentOrders: orders.slice(0, 10),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

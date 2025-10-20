import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { insertOrderSchema, walletTransactions } from "@shared/schema";
import { z } from "zod";
import { db } from "@/db";
import { inMemoryCart } from "@/lib/cart/in-memory-cart";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }
    
    const orders = await storage.getOrders(userId);
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertOrderSchema.parse(body);
    
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 3);
    
    // If payment is from wallet or online with wallet balance, deduct balance and create transaction
    const paidFromWallet = parseFloat(validatedData.paidFromWallet || "0");
    if (paidFromWallet > 0) {
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      
      const currentBalance = parseFloat(user.walletBalance || "0");
      
      if (currentBalance < paidFromWallet) {
        return NextResponse.json(
          { message: "Insufficient wallet balance" },
          { status: 400 }
        );
      }
      
      // Deduct from wallet
      const newBalance = (currentBalance - paidFromWallet).toFixed(2);
      await storage.updateUser(validatedData.userId, {
        walletBalance: newBalance
      });
    }
    
    const order = await storage.createOrder({
      ...validatedData,
      expectedDelivery,
    });
    
    // Create wallet transaction if payment is from wallet
    if (paidFromWallet > 0) {
      await db.insert(walletTransactions).values({
        userId: validatedData.userId,
        type: "debit",
        amount: paidFromWallet.toString(),
        description: `Payment for Order #${order.id.slice(0, 8)}`,
        orderId: order.id,
        status: "completed"
      });
    }
    
    // Clear cart
    inMemoryCart.clear(validatedData.userId);
    
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

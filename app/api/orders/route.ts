import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import { inMemoryCart } from "@/lib/cart/in-memory-cart";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Order validation schema
const insertOrderSchema = z.object({
  userId: z.string().uuid(),
  products: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
    price: z.string(),
    variantName: z.string().optional(),
  })),
  totalPrice: z.string(),
  deliveryAddress: z.string(),
  paymentMethod: z.string(),
  paidFromWallet: z.string().optional().default("0"),
  status: z.string().optional().default("pending"),
});

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
    
    // Get orders from Supabase
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get orders error:', error);
      return NextResponse.json(
        { message: "Failed to fetch orders" },
        { status: 500 }
      );
    }
    
    // Transform to match frontend expectations
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      userId: order.user_id,
      products: order.products,
      totalPrice: order.total_price,
      deliveryAddress: order.delivery_address,
      paymentMethod: order.payment_method,
      paidFromWallet: order.paid_from_wallet,
      status: order.status,
      expectedDelivery: order.expected_delivery,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    })) || [];
    
    return NextResponse.json(transformedOrders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch orders" },
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
      // Get user's affiliate data for wallet balance
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('wallet_balance')
        .eq('user_id', validatedData.userId)
        .single();
      
      if (affiliateError || !affiliate) {
        return NextResponse.json(
          { message: "User wallet not found" },
          { status: 404 }
        );
      }
      
      const currentBalance = parseFloat(affiliate.wallet_balance || "0");
      
      if (currentBalance < paidFromWallet) {
        return NextResponse.json(
          { message: "Insufficient wallet balance" },
          { status: 400 }
        );
      }
      
      // Deduct from wallet
      const newBalance = (currentBalance - paidFromWallet).toFixed(2);
      await supabase
        .from('affiliates')
        .update({ wallet_balance: newBalance })
        .eq('user_id', validatedData.userId);
    }
    
    // Transform data for database
    const orderData = {
      user_id: validatedData.userId,
      products: validatedData.products,
      total_price: validatedData.totalPrice,
      delivery_address: validatedData.deliveryAddress,
      payment_method: validatedData.paymentMethod,
      paid_from_wallet: validatedData.paidFromWallet,
      status: validatedData.status || "pending",
      expected_delivery: expectedDelivery.toISOString(),
    };
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) {
      console.error('Create order error:', orderError);
      return NextResponse.json(
        { message: "Failed to create order" },
        { status: 500 }
      );
    }
    
    // Create wallet transaction if payment is from wallet
    if (paidFromWallet > 0) {
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: validatedData.userId,
          type: "debit",
          amount: paidFromWallet.toString(),
          description: `Payment for Order #${order.id.slice(0, 8)}`,
          order_id: order.id,
          status: "completed"
        });
    }
    
    // Clear cart
    inMemoryCart.clear(validatedData.userId);
    
    // Transform back to frontend format
    const transformedOrder = {
      id: order.id,
      userId: order.user_id,
      products: order.products,
      totalPrice: order.total_price,
      deliveryAddress: order.delivery_address,
      paymentMethod: order.payment_method,
      paidFromWallet: order.paid_from_wallet,
      status: order.status,
      expectedDelivery: order.expected_delivery,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
    
    return NextResponse.json(transformedOrder, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Payment request validation schema
const insertPaymentRequestSchema = z.object({
  userId: z.string().uuid(),
  amount: z.string(),
  paymentMethod: z.string(),
  paymentAccountId: z.string().uuid().optional(),
  receiptUrl: z.string().optional(),
  orderId: z.string().uuid().optional(),
  orderData: z.any().optional(),
  status: z.string().optional().default("pending"),
  type: z.string().optional().default("deposit"),
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
    
    // Get payment requests from Supabase
    const { data: requests, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get payment requests error:', error);
      return NextResponse.json(
        { message: "Failed to fetch payment requests" },
        { status: 500 }
      );
    }
    
    // Transform to match frontend expectations
    const transformedRequests = requests?.map(request => ({
      id: request.id,
      userId: request.user_id,
      amount: request.amount,
      paymentMethod: request.payment_method,
      paymentAccountId: request.payment_account_id,
      receiptUrl: request.receipt_url,
      orderId: request.order_id,
      orderData: request.order_data,
      status: request.status,
      type: request.type,
      adminNotes: request.admin_notes,
      rejectionReason: request.rejection_reason,
      createdAt: request.created_at,
      updatedAt: request.updated_at
    })) || [];
    
    return NextResponse.json(transformedRequests);
  } catch (error: any) {
    console.error('Get payment requests error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch payment requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertPaymentRequestSchema.parse(body);
    
    // Transform data for database
    const requestData = {
      user_id: validatedData.userId,
      amount: validatedData.amount,
      payment_method: validatedData.paymentMethod,
      payment_account_id: validatedData.paymentAccountId,
      receipt_url: validatedData.receiptUrl,
      order_id: validatedData.orderId,
      order_data: validatedData.orderData,
      status: validatedData.status,
      type: validatedData.type,
    };
    
    // Create payment request
    const { data: paymentRequest, error } = await supabase
      .from('payment_requests')
      .insert(requestData)
      .select()
      .single();
    
    if (error) {
      console.error('Create payment request error:', error);
      return NextResponse.json(
        { message: "Failed to create payment request" },
        { status: 500 }
      );
    }
    
    // Transform back to frontend format
    const transformedRequest = {
      id: paymentRequest.id,
      userId: paymentRequest.user_id,
      amount: paymentRequest.amount,
      paymentMethod: paymentRequest.payment_method,
      paymentAccountId: paymentRequest.payment_account_id,
      receiptUrl: paymentRequest.receipt_url,
      orderId: paymentRequest.order_id,
      orderData: paymentRequest.order_data,
      status: paymentRequest.status,
      type: paymentRequest.type,
      createdAt: paymentRequest.created_at,
      updatedAt: paymentRequest.updated_at
    };
    
    return NextResponse.json(transformedRequest, { status: 201 });
  } catch (error: any) {
    console.error('Create payment request error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || "Failed to create payment request" },
      { status: 500 }
    );
  }
}

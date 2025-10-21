import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// User payment account validation schema
const insertUserPaymentAccountSchema = z.object({
  user_id: z.string().uuid(),
  account_name: z.string().min(1),
  account_number: z.string().min(1),
  method: z.string().min(1),
  is_default: z.boolean().optional().default(false),
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
    
    // Get user payment accounts from Supabase
    const { data: accounts, error } = await supabase
      .from('user_payment_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get user payment accounts error:', error);
      return NextResponse.json(
        { message: "Failed to fetch user payment accounts" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(accounts || []);
  } catch (error: any) {
    console.error('Get user payment accounts error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch user payment accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform frontend data to database format
    const accountData = {
      user_id: body.userId,
      account_name: body.accountName,
      account_number: body.accountNumber,
      method: body.method,
      is_default: body.isDefault || false,
    };
    
    const validatedData = insertUserPaymentAccountSchema.parse(accountData);
    
    // If this is set as default, update other accounts to not be default
    if (validatedData.is_default) {
      await supabase
        .from('user_payment_accounts')
        .update({ is_default: false })
        .eq('user_id', validatedData.user_id);
    }
    
    // Insert new user payment account
    const { data: account, error } = await supabase
      .from('user_payment_accounts')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      console.error('Create user payment account error:', error);
      return NextResponse.json(
        { message: "Failed to create user payment account" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    console.error('Create user payment account error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || "Failed to create user payment account" },
      { status: 500 }
    );
  }
}

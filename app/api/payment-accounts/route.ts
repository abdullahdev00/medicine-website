import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get active payment accounts from Supabase
    const { data: accounts, error } = await supabase
      .from('payment_accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Get payment accounts error:', error);
      return NextResponse.json(
        { message: "Failed to fetch payment accounts" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(accounts || []);
  } catch (error: any) {
    console.error('Get payment accounts error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch payment accounts" },
      { status: 500 }
    );
  }
}

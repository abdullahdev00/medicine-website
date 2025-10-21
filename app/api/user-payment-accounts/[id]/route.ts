import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Transform frontend data to database format
    const updateData: any = {};
    if (body.accountName) updateData.account_name = body.accountName;
    if (body.accountNumber) updateData.account_number = body.accountNumber;
    if (body.method) updateData.method = body.method;
    if (body.isDefault !== undefined) updateData.is_default = body.isDefault;
    
    // If setting as default, update other accounts first
    if (body.isDefault) {
      // Get the account to find user_id
      const { data: currentAccount } = await supabase
        .from('user_payment_accounts')
        .select('user_id')
        .eq('id', id)
        .single();
        
      if (currentAccount) {
        await supabase
          .from('user_payment_accounts')
          .update({ is_default: false })
          .eq('user_id', currentAccount.user_id);
      }
    }
    
    // Update the account
    const { data: account, error } = await supabase
      .from('user_payment_accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update user payment account error:', error);
      return NextResponse.json(
        { message: "Failed to update user payment account" },
        { status: 500 }
      );
    }
    
    if (!account) {
      return NextResponse.json(
        { message: "User payment account not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Update user payment account error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to update user payment account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from('user_payment_accounts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete user payment account error:', error);
      return NextResponse.json(
        { message: "Failed to delete user payment account" },
        { status: 500 }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Delete user payment account error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to delete user payment account" },
      { status: 500 }
    );
  }
}

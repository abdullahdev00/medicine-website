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
    if (body.label) updateData.title = body.label;
    if (body.address) updateData.full_address = body.address;
    if (body.city) updateData.city = body.city;
    if (body.province) updateData.province = body.province;
    if (body.postalCode) updateData.postal_code = body.postalCode;
    if (body.isDefault !== undefined) updateData.is_default = body.isDefault;
    
    // If setting as default, update other addresses first
    if (body.isDefault) {
      // Get the address to find user_id
      const { data: currentAddress } = await supabase
        .from('addresses')
        .select('user_id')
        .eq('id', id)
        .single();
        
      if (currentAddress) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', currentAddress.user_id);
      }
    }
    
    // Update the address
    const { data: address, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update address error:', error);
      return NextResponse.json(
        { message: "Failed to update address" },
        { status: 500 }
      );
    }
    
    if (!address) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }
    
    // Transform back to frontend format
    const transformedAddress = {
      id: address.id,
      userId: address.user_id,
      label: address.title,
      address: address.full_address,
      city: address.city,
      province: address.province,
      postalCode: address.postal_code,
      isDefault: address.is_default,
      createdAt: address.created_at
    };
    
    return NextResponse.json(transformedAddress);
  } catch (error: any) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to update address" },
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
      .from('addresses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete address error:', error);
      return NextResponse.json(
        { message: "Failed to delete address" },
        { status: 500 }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to delete address" },
      { status: 500 }
    );
  }
}

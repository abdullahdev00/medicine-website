import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Address validation schema
const insertAddressSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1),
  full_address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postal_code: z.string().min(1),
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
    
    // Get addresses from Supabase
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get addresses error:', error);
      return NextResponse.json(
        { message: "Failed to fetch addresses" },
        { status: 500 }
      );
    }
    
    // Transform to match frontend expectations
    const transformedAddresses = addresses?.map(addr => ({
      id: addr.id,
      userId: addr.user_id,
      label: addr.title,
      address: addr.full_address,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postal_code,
      isDefault: addr.is_default,
      createdAt: addr.created_at
    })) || [];
    
    return NextResponse.json(transformedAddresses);
  } catch (error: any) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform frontend data to database format
    const addressData = {
      user_id: body.userId,
      title: body.label,
      full_address: body.address,
      city: body.city,
      province: body.province,
      postal_code: body.postalCode,
      is_default: body.isDefault || false,
    };
    
    const validatedData = insertAddressSchema.parse(addressData);
    
    // If this is set as default, update other addresses to not be default
    if (validatedData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', validatedData.user_id);
    }
    
    // Insert new address
    const { data: address, error } = await supabase
      .from('addresses')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      console.error('Create address error:', error);
      return NextResponse.json(
        { message: "Failed to create address" },
        { status: 500 }
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
    
    return NextResponse.json(transformedAddress, { status: 201 });
  } catch (error: any) {
    console.error('Create address error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || "Failed to create address" },
      { status: 500 }
    );
  }
}

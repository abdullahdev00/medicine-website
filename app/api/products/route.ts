import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";

// Initialize Supabase client with anon key for read operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 60; // Cache for 60 seconds

// Product validation schema
const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  images: z.array(z.string()).optional().default([]),
  rating: z.string().optional(),
  variants: z.array(z.object({
    name: z.string(),
    price: z.string(),
    stock: z.number().optional().default(0)
  })).optional().default([]),
  in_stock: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Products API: GET request received');
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      console.error('🚨 Products API: Database error:', error);
      // Return empty array instead of error to prevent UI crash
      return NextResponse.json([]);
    }
    
    console.log('✅ Products API: Found', products?.length || 0, 'products');
    
    // Transform to match frontend expectations
    const transformedProducts = products?.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.category_id,
      images: product.images || [],
      rating: product.rating,
      variants: product.variants || [],
      inStock: product.in_stock,
      createdAt: product.created_at
    })) || [];
    
    return NextResponse.json(transformedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertProductSchema.parse(body);
    
    // Create product in Supabase
    const { data: product, error } = await supabase
      .from('products')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      console.error('Create product error:', error);
      return NextResponse.json(
        { message: "Failed to create product" },
        { status: 500 }
      );
    }
    
    // Transform back to frontend format
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.category_id,
      images: product.images || [],
      rating: product.rating,
      variants: product.variants || [],
      inStock: product.in_stock,
      createdAt: product.created_at
    };
    
    return NextResponse.json(transformedProduct, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

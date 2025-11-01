import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First try to get by slug if it looks like a slug (contains hyphens)
    if (id.includes('-')) {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('slug', id)
        .single();
      
      if (!error && product) {
        // Transform the response to match frontend expectations
        const transformedProduct = {
          ...product,
          category: product.categories,
          categoryId: product.category_id,
          inStock: product.in_stock,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        };
        return NextResponse.json(transformedProduct);
      }
    }
    
    // Fallback to ID lookup
    const product = await storage.getProductById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

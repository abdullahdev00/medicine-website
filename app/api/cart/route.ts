import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { inMemoryCart } from "@/lib/cart/in-memory-cart";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json([]);
    }
    
    const userCart = inMemoryCart.get(userId);
    const cartWithProducts = await Promise.all(
      userCart.map(async (item) => {
        // Get product from Supabase
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productId)
          .single();
        
        if (product) {
          // Transform to match frontend expectations
          const transformedProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            categoryId: product.category_id,
            images: product.images || [],
            rating: product.rating,
            variants: product.variants || [],
            inStock: product.in_stock,
          };
          return { ...item, product: transformedProduct };
        }
        return item;
      })
    );
    
    return NextResponse.json(cartWithProducts);
  } catch (error: any) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { message: error.message || "Failed to get cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity, selectedPackage } = await request.json();
    
    if (!userId || !productId || !quantity || !selectedPackage) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userCart = inMemoryCart.add(userId, { productId, quantity, selectedPackage });
    
    // Enrich cart items with product details like GET endpoint does
    const cartWithProducts = await Promise.all(
      userCart.map(async (item) => {
        // Get product from Supabase
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productId)
          .single();
        
        if (product) {
          // Transform to match frontend expectations
          const transformedProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            categoryId: product.category_id,
            images: product.images || [],
            rating: product.rating,
            variants: product.variants || [],
            inStock: product.in_stock,
          };
          return { ...item, product: transformedProduct };
        }
        return item;
      })
    );
    
    return NextResponse.json({ success: true, cart: cartWithProducts });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    inMemoryCart.clear(userId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

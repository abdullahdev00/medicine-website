import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { inMemoryCart } from "@/lib/cart/in-memory-cart";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const updatedCart = inMemoryCart.remove(userId, (await params).id);
    
    // Enrich cart items with product details
    const cartWithProducts = await Promise.all(
      updatedCart.map(async (item) => {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productId)
          .single();
        
        if (product) {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const { quantity } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const item = inMemoryCart.update(userId, (await params).id, quantity);
    
    if (!item) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }
    
    // Get the full updated cart and enrich with product details
    const updatedCart = inMemoryCart.get(userId);
    const cartWithProducts = await Promise.all(
      updatedCart.map(async (cartItem) => {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', cartItem.productId)
          .single();
        
        if (product) {
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
          return { ...cartItem, product: transformedProduct };
        }
        return cartItem;
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

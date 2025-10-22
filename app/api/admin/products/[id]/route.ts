import { NextRequest, NextResponse } from "next/server";
import { db, supabase } from "@/lib/db/client";
import { products } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-middleware";
import { createClient } from '@supabase/supabase-js';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdmin();
    
    const productId = (await params).id;
    const productData = await request.json();
    
    // Handle image URL to images array conversion
    if (productData.imageUrl && !productData.images) {
      productData.images = [productData.imageUrl];
      delete productData.imageUrl;
    }
    
    // Prepare update data - use camelCase for Drizzle
    const updateData: any = {};
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined) updateData.description = productData.description;
    if (productData.categoryId !== undefined) updateData.categoryId = productData.categoryId;
    if (productData.images !== undefined) updateData.images = productData.images;
    if (productData.rating !== undefined) updateData.rating = productData.rating;
    if (productData.variants !== undefined) updateData.variants = productData.variants;
    if (productData.inStock !== undefined) updateData.inStock = productData.inStock;
    
    // For Supabase direct update, use snake_case
    const supabaseUpdateData: any = {};
    if (productData.name !== undefined) supabaseUpdateData.name = productData.name;
    if (productData.description !== undefined) supabaseUpdateData.description = productData.description;
    if (productData.categoryId !== undefined) supabaseUpdateData.category_id = productData.categoryId;
    if (productData.images !== undefined) supabaseUpdateData.images = productData.images;
    if (productData.rating !== undefined) supabaseUpdateData.rating = productData.rating;
    if (productData.variants !== undefined) supabaseUpdateData.variants = productData.variants;
    if (productData.inStock !== undefined) supabaseUpdateData.in_stock = productData.inStock;
    
    let updatedProduct;
    
    try {
      // Try Drizzle ORM first
      const result = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, productId))
        .returning();
      
      if (result.length === 0) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
      }
      
      updatedProduct = result[0];
    } catch (dbError: any) {
      console.error("Drizzle update failed, trying Supabase:", dbError.message);
      
      // Fallback to Supabase client
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabaseAdmin
          .from('products')
          .update(supabaseUpdateData)
          .eq('id', productId)
          .select()
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
          }
          throw error;
        }
        
        updatedProduct = data;
      } catch (supabaseError: any) {
        console.error("Both Drizzle and Supabase failed:", supabaseError);
        return NextResponse.json({ 
          message: "Failed to update product",
          error: supabaseError.message || dbError.message
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      ...updatedProduct,
      rating: updatedProduct.rating ? Number(updatedProduct.rating) : 0,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Update product error:", error);
    return NextResponse.json({ 
      message: "Failed to update product",
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdmin();
    
    const productId = (await params).id;
    
    // Get product to find images before deletion
    let productToDelete;
    try {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
      
      productToDelete = result[0];
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
    
    // Delete product from database
    let deleted = false;
    
    try {
      // Try Drizzle ORM first
      const result = await db
        .delete(products)
        .where(eq(products.id, productId))
        .returning();
      
      deleted = result.length > 0;
    } catch (dbError: any) {
      console.error("Drizzle delete failed, trying Supabase:", dbError.message);
      
      // Fallback to Supabase client
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { error } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) {
          throw error;
        }
        
        deleted = true;
      } catch (supabaseError: any) {
        console.error("Both Drizzle and Supabase failed:", supabaseError);
        return NextResponse.json({ 
          message: "Failed to delete product",
          error: supabaseError.message || dbError.message
        }, { status: 500 });
      }
    }
    
    if (!deleted) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    
    // Delete images from storage if product had images
    if (productToDelete && productToDelete.images && productToDelete.images.length > 0) {
      try {
        const supabaseStorage = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // Extract file paths from URLs
        const filePaths = productToDelete.images.map((url: string) => {
          const urlParts = url.split('/');
          return `products/${urlParts[urlParts.length - 1]}`;
        });
        
        const { error } = await supabaseStorage.storage
          .from('product-images')
          .remove(filePaths);
        
        if (error) {
          console.error("Failed to delete images from storage:", error);
        }
      } catch (error) {
        console.error("Error deleting images:", error);
      }
    }
    
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete product error:", error);
    return NextResponse.json({ 
      message: "Failed to delete product",
      error: error.message 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { insertWishlistItemSchema } from "@shared/schema";
import { z } from "zod";

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
    
    const items = await storage.getWishlistItems(userId);
    // Ensure items is always an array
    const safeItems = Array.isArray(items) ? items : [];
    const itemsWithProducts = await Promise.all(
      safeItems.map(async (item) => {
        try {
          const product = await storage.getProductById(item.productId);
          return { ...item, product: product || null };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return { ...item, product: null };
        }
      })
    );
    
    return NextResponse.json(itemsWithProducts);
  } catch (error: any) {
    console.error('Wishlist API error:', error);
    
    // Check if it's a database connection error
    if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      return NextResponse.json(
        { 
          message: "Database connection error. Please check your internet connection and try again.",
          error: "DATABASE_CONNECTION_ERROR",
          items: [] // Return empty array as fallback
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json(
      { 
        message: error.message || "An unexpected error occurred",
        error: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertWishlistItemSchema.parse(body);
    const item = await storage.addToWishlist(validatedData);
    
    // Handle case where item might be undefined due to database error
    if (!item) {
      return NextResponse.json(
        { message: "Failed to add item to wishlist" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Wishlist POST API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    // Handle unique constraint violation (duplicate wishlist item)
    if (error.code === '23505' || error.message?.includes('unique_user_product')) {
      console.log('Duplicate wishlist item detected, returning success');
      return NextResponse.json(
        { message: "Item already in wishlist" },
        { status: 200 } // Return 200 instead of error since it's not really an error
      );
    }
    
    // Check if it's a database connection error
    if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      return NextResponse.json(
        { 
          message: "Database connection error. Please check your internet connection and try again.",
          error: "DATABASE_CONNECTION_ERROR"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

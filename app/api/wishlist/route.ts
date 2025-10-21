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
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return { ...item, product };
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
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

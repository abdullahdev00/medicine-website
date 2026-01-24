import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await storage.removeFromWishlist(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Wishlist DELETE API error:', error);
    
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

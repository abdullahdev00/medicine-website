import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    
    let products;
    if (categoryId) {
      products = await storage.getProductsByCategory(categoryId);
    } else {
      products = await storage.getProducts();
    }
    
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = insertProductSchema.parse(body);
    const product = await storage.createProduct(validatedData);
    return NextResponse.json(product, { status: 201 });
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

import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

export const revalidate = 60; // Cache for 60 seconds
export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  try {
    const categories = await storage.getCategories();
    return NextResponse.json(categories, {
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

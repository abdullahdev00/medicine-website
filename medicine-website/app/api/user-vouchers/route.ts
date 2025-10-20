import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

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
    
    const userVouchers = await storage.getUserVouchers(userId);
    return NextResponse.json(userVouchers);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

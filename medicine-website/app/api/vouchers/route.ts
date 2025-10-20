import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function GET(request: NextRequest) {
  try {
    const vouchers = await storage.getActiveVouchers();
    return NextResponse.json(vouchers);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const voucher = await storage.getVoucherByCode((await params).code);
    if (!voucher) {
      return NextResponse.json(
        { message: "Voucher not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(voucher);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

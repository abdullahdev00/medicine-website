import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function GET(request: NextRequest) {
  try {
    const accounts = await storage.getPaymentAccounts();
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

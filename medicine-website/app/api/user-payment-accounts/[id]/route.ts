import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const account = await storage.updateUserPaymentAccount((await params).id, body);
    if (!account) {
      return NextResponse.json(
        { message: "User payment account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(account);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await storage.deleteUserPaymentAccount((await params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

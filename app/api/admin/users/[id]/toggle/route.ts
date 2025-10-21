import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { requireAdmin } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { isActive } = body;
    
    await storage.toggleUserStatus((await params).id, isActive);
    return NextResponse.json({ message: "User status updated successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

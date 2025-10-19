import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adminId = searchParams.get('adminId');
    
    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    const admin = await storage.getAdminById(adminId);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 401 }
      );
    }
    
    const { password: _, ...adminData } = admin;
    return NextResponse.json({ ...adminData, isAdmin: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

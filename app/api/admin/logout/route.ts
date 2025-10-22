import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Simple cookie clear
    const cookieStore = await cookies();
    cookieStore.delete("admin-id");
    cookieStore.delete("admin-email");
    
    return NextResponse.json({ 
      message: "Logged out successfully",
      success: true 
    });
  } catch (error) {
    return NextResponse.json({ 
      message: "Logout failed",
      success: false 
    }, { status: 500 });
  }
}

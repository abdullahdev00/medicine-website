import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    
    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Not authorized. Admin access required." },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ 
      isAdmin: true,
      user: session.user 
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

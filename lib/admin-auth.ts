import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function checkAdminAuth() {
  const session = await auth();
  
  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      ),
      session: null,
    };
  }

  const userRole = (session.user as any).role;
  
  if (userRole !== "admin") {
    return {
      error: NextResponse.json(
        { message: "Not authorized. Admin access required." },
        { status: 403 }
      ),
      session: null,
    };
  }
  
  return {
    error: null,
    session,
  };
}

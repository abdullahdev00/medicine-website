import { getCurrentUser } from "@/lib/auth-client";
import { NextResponse } from "next/server";

export async function checkAdminAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      ),
      user: null,
    };
  }

  const userRole = (user as any).user_metadata?.role;
  
  if (userRole !== "admin") {
    return {
      error: NextResponse.json(
        { message: "Not authorized. Admin access required." },
        { status: 403 }
      ),
      user: null,
    };
  }
  
  return {
    error: null,
    user,
  };
}

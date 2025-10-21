import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/lib/auth-client";

export async function POST(request: NextRequest) {
  try {
    await signOut();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}

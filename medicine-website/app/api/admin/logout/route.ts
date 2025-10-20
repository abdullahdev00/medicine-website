import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}

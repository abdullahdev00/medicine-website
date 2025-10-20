import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const applications = await storage.getAllPartnerApplications();
    return NextResponse.json(applications);
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

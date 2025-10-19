import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";
import { requireAdmin } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { status, adminNotes, rejectionReason } = await request.json();
    const application = await storage.updatePartnerApplicationStatus(
      (await params).id,
      status,
      adminNotes,
      rejectionReason
    );
    if (!application) {
      return NextResponse.json(
        { message: "Partner application not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(application);
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

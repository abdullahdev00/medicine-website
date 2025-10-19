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
    const paymentRequest = await storage.updatePaymentRequestStatus(
      (await params).id,
      status,
      adminNotes,
      rejectionReason
    );
    if (!paymentRequest) {
      return NextResponse.json({ message: "Payment request not found" }, { status: 404 });
    }
    return NextResponse.json(paymentRequest);
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { admins } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("admin-id")?.value;
    const adminEmail = cookieStore.get("admin-email")?.value;
    
    if (!adminId || !adminEmail) {
      console.error("Admin verification failed: Missing cookies", { adminId: !!adminId, adminEmail: !!adminEmail });
      throw new Error("Unauthorized");
    }

    const result = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
    
    if (result.length === 0) {
      console.error("Admin verification failed: Admin not found", { adminId });
      throw new Error("Unauthorized");
    }
    
    if (result[0].email !== adminEmail) {
      console.error("Admin verification failed: Email mismatch");
      throw new Error("Unauthorized");
    }
    
    if (!result[0].isActive) {
      console.error("Admin verification failed: Admin not active");
      throw new Error("Unauthorized");
    }

    return result[0];
  } catch (error: any) {
    console.error("Admin verification error:", error.message || error);
    throw new Error("Unauthorized");
  }
}
